import { NextResponse } from "next/server";
import { canManageBilling } from "@/lib/billing/access";
import { getStripeClient, getStripePriceId, isStripeConfigured } from "@/lib/stripe/client";
import { getAuthUser, getUserProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

type CheckoutBody = {
  plan?: "STARTER" | "GROWTH";
};

export async function POST(request: Request) {
  const profile = await getUserProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageBilling(profile)) {
    return NextResponse.json({ error: "Only owners and admins can manage billing" }, { status: 403 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        stub: true,
        error: "Stripe is not configured. Add STRIPE_SECRET_KEY and price IDs to enable checkout.",
      },
      { status: 503 },
    );
  }

  const body = (await request.json()) as CheckoutBody;
  const plan = body.plan;

  if (!plan || (plan !== "STARTER" && plan !== "GROWTH")) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId = getStripePriceId(plan);
  if (!priceId) {
    return NextResponse.json(
      { error: `Missing Stripe price ID for ${plan}` },
      { status: 503 },
    );
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe client unavailable" }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("organization_id", profile.organization_id)
    .single();

  const user = await getAuthUser();
  const origin = new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: subscription?.stripe_customer_id ?? undefined,
    customer_email: subscription?.stripe_customer_id ? undefined : user?.email ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/settings/billing?checkout=success`,
    cancel_url: `${origin}/settings/billing?checkout=canceled`,
    metadata: {
      organizationId: profile.organization_id,
      plan,
    },
    subscription_data: {
      metadata: {
        organizationId: profile.organization_id,
        plan,
      },
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
