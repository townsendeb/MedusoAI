import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";
import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse } from "../_shared/response.ts";
import { claimWebhookEvent, completeWebhookEvent } from "../_shared/webhook-events.ts";

type SubscriptionPlan = "FREE" | "STARTER" | "GROWTH" | "ENTERPRISE";
type SubscriptionStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED";

const VALID_PLANS = new Set<SubscriptionPlan>(["FREE", "STARTER", "GROWTH", "ENTERPRISE"]);

function planFromMetadata(metadata: Stripe.Metadata | null | undefined): SubscriptionPlan | null {
  const plan = metadata?.plan;
  if (typeof plan === "string" && VALID_PLANS.has(plan as SubscriptionPlan) && plan !== "FREE") {
    return plan as SubscriptionPlan;
  }

  return null;
}

function planFromPriceId(priceId: string | null | undefined): SubscriptionPlan | null {
  if (!priceId) {
    return null;
  }

  const starter = Deno.env.get("STRIPE_PRICE_STARTER");
  const growth = Deno.env.get("STRIPE_PRICE_GROWTH");

  if (starter && priceId === starter) {
    return "STARTER";
  }

  if (growth && priceId === growth) {
    return "GROWTH";
  }

  return null;
}

function resolvePlan(
  ...sources: Array<Stripe.Metadata | null | undefined>
): SubscriptionPlan | null {
  for (const metadata of sources) {
    const plan = planFromMetadata(metadata);
    if (plan) {
      return plan;
    }
  }

  return null;
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "trialing":
      return "TRIALING";
    case "active":
      return "ACTIVE";
    case "past_due":
    case "unpaid":
      return "PAST_DUE";
    case "canceled":
    case "incomplete_expired":
      return "CANCELED";
    case "incomplete":
    case "paused":
      return "PAST_DUE";
    default:
      return "PAST_DUE";
  }
}

function getPrimaryPriceId(subscription: Stripe.Subscription): string | null {
  const item = subscription.items.data[0];
  return item?.price?.id ?? null;
}

async function updateSubscription(
  supabase: ReturnType<typeof createClient>,
  organizationId: string,
  updates: {
    plan?: SubscriptionPlan;
    status?: SubscriptionStatus;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    currentPeriodEnd?: string | null;
    trialEndsAt?: string | null;
  },
) {
  const payload: Record<string, unknown> = {};

  if (updates.plan) {
    payload.plan = updates.plan;
  }
  if (updates.status) {
    payload.status = updates.status;
  }
  if (updates.stripeCustomerId !== undefined) {
    payload.stripe_customer_id = updates.stripeCustomerId;
  }
  if (updates.stripeSubscriptionId !== undefined) {
    payload.stripe_subscription_id = updates.stripeSubscriptionId;
  }
  if (updates.currentPeriodEnd !== undefined) {
    payload.current_period_end = updates.currentPeriodEnd;
  }
  if (updates.trialEndsAt !== undefined) {
    payload.trial_ends_at = updates.trialEndsAt;
  }

  const { error } = await supabase
    .from("subscriptions")
    .update(payload)
    .eq("organization_id", organizationId);

  if (error) {
    throw error;
  }
}

async function resolveOrganizationId(
  supabase: ReturnType<typeof createClient>,
  metadata: Stripe.Metadata | null | undefined,
  stripeCustomerId?: string | null,
): Promise<string | null> {
  if (metadata?.organizationId) {
    return metadata.organizationId;
  }

  if (!stripeCustomerId) {
    return null;
  }

  const { data } = await supabase
    .from("subscriptions")
    .select("organization_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  return data?.organization_id ?? null;
}

async function activatePaidSubscription(
  supabase: ReturnType<typeof createClient>,
  organizationId: string,
) {
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!subscription || subscription.status === "CANCELED") {
    return;
  }

  await updateSubscription(supabase, organizationId, { status: "ACTIVE" });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let eventId: string | null = null;
  let markComplete = false;

  try {
    const rawBody = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeSecretKey || !webhookSecret) {
      console.warn("Stripe webhook received but STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET is unset");
      return jsonResponse({ error: "Stripe not configured" }, 503);
    }

    const signature = req.headers.get("Stripe-Signature");
    if (!signature) {
      return jsonResponse({ error: "Missing Stripe-Signature" }, 400);
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2026-05-27.dahlia" });
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
    } catch (error) {
      console.error("Stripe signature verification failed:", error);
      return jsonResponse({ error: "Invalid signature" }, 400);
    }

    eventId = event.id;
    const claim = await claimWebhookEvent("STRIPE", event.id, event as unknown as Record<string, unknown>);
    if (claim === "skip") {
      return jsonResponse({ received: true, duplicate: true });
    }

    markComplete = true;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      return jsonResponse({ error: "Server misconfigured" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const organizationId = await resolveOrganizationId(
          supabase,
          session.metadata,
          typeof session.customer === "string" ? session.customer : session.customer?.id,
        );

        if (!organizationId) {
          console.warn("checkout.session.completed without organizationId");
          break;
        }

        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

        let plan = resolvePlan(session.metadata);
        let status: SubscriptionStatus = "ACTIVE";
        let currentPeriodEnd: string | null = null;
        let trialEndsAt: string | null = null;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          plan =
            resolvePlan(session.metadata, subscription.metadata) ??
            planFromPriceId(getPrimaryPriceId(subscription));
          status = mapStripeStatus(subscription.status);
          currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
          trialEndsAt = subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null;
        }

        if (!plan) {
          throw new Error(`Unable to resolve plan for checkout session ${session.id}`);
        }

        await updateSubscription(supabase, organizationId, {
          plan,
          status,
          stripeCustomerId:
            typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
          stripeSubscriptionId: subscriptionId ?? null,
          currentPeriodEnd,
          trialEndsAt,
        });
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const organizationId = await resolveOrganizationId(
          supabase,
          subscription.metadata,
          typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id,
        );

        if (!organizationId) {
          console.warn(`${event.type} without organizationId`);
          break;
        }

        const plan =
          resolvePlan(subscription.metadata) ?? planFromPriceId(getPrimaryPriceId(subscription));
        const status =
          event.type === "customer.subscription.deleted"
            ? "CANCELED"
            : mapStripeStatus(subscription.status);

        const updates: Parameters<typeof updateSubscription>[2] = {
          status,
          stripeCustomerId:
            typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id,
          stripeSubscriptionId: subscription.id,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          trialEndsAt: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
        };

        if (plan) {
          updates.plan = plan;
        } else if (event.type === "customer.subscription.deleted") {
          updates.plan = "FREE";
        }

        await updateSubscription(supabase, organizationId, updates);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const organizationId = await resolveOrganizationId(
          supabase,
          invoice.metadata,
          typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id,
        );

        if (organizationId) {
          await updateSubscription(supabase, organizationId, { status: "PAST_DUE" });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const organizationId = await resolveOrganizationId(
          supabase,
          invoice.metadata,
          typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id,
        );

        if (organizationId) {
          await activatePaidSubscription(supabase, organizationId);
        }
        break;
      }

      default:
        console.info("Unhandled Stripe event:", event.type);
    }

    return jsonResponse({ received: true });
  } catch (error) {
    markComplete = false;
    console.error("webhooks-stripe error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  } finally {
    if (markComplete && eventId) {
      await completeWebhookEvent(eventId);
    }
  }
});
