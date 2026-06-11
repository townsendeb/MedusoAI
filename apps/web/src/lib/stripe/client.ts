import Stripe from "stripe";

let stripeClient: Stripe | null | undefined;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripeClient(): Stripe | null {
  if (stripeClient !== undefined) {
    return stripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    stripeClient = null;
    return stripeClient;
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: "2026-05-27.dahlia",
  });

  return stripeClient;
}

export function getStripePriceId(plan: "STARTER" | "GROWTH"): string | null {
  if (plan === "STARTER") {
    return process.env.STRIPE_PRICE_STARTER ?? null;
  }

  return process.env.STRIPE_PRICE_GROWTH ?? null;
}
