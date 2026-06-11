import { NextResponse } from "next/server";
import { canManageBilling } from "@/lib/billing/access";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe/client";
import { getUserProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

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
        error: "Stripe is not configured. Add STRIPE_SECRET_KEY to enable the customer portal.",
      },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("organization_id", profile.organization_id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No Stripe customer on file. Upgrade to a paid plan first." },
      { status: 400 },
    );
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe client unavailable" }, { status: 503 });
  }

  const origin = new URL(request.url).origin;
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${origin}/settings/billing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
