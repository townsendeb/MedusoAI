import { PLAN_LIMITS, PLAN_LABELS, type SubscriptionPlan } from "@meduso/shared";

export const MARKETING_URL =
  process.env.NEXT_PUBLIC_MARKETING_URL ?? "https://medusoai.com";

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.medusoai.com";

export const CONTACT_EMAIL = "support@medusoai.com";

export const BRAND_NAME = "Meduso";

export const TAGLINE = "We're killing email surveys. Get real feedback from your customers.";

export const HERO_SUBHEAD =
  "Meduso texts your customers after their visit, understands their replies with AI, and alerts your team when someone needs a human follow-up.";

export const TRUST_MICROCOPY = "Free plan · No credit card required · Cancel anytime";

export const HERO_TRUST_LINE = "50 free SMS/month · Setup in minutes";

export function appUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (process.env.NODE_ENV === "development") {
    return normalized;
  }
  return `${APP_URL.replace(/\/$/, "")}${normalized}`;
}

export type PricingTier = {
  plan: SubscriptionPlan;
  name: string;
  price: string;
  priceNote?: string;
  highlighted?: boolean;
  badge?: string;
  cta: string;
  ctaHref: string;
  isMailto?: boolean;
};

export const PRICING_TIERS: PricingTier[] = [
  {
    plan: "FREE",
    name: PLAN_LABELS.FREE,
    price: "$0",
    priceNote: "forever",
    cta: "Start free",
    ctaHref: appUrl("/register"),
  },
  {
    plan: "STARTER",
    name: PLAN_LABELS.STARTER,
    price: "$49",
    priceNote: "/month",
    cta: "Get Starter",
    ctaHref: appUrl("/register"),
  },
  {
    plan: "GROWTH",
    name: PLAN_LABELS.GROWTH,
    price: "$149",
    priceNote: "/month",
    highlighted: true,
    badge: "Most popular",
    cta: "Get Growth",
    ctaHref: appUrl("/register"),
  },
  {
    plan: "ENTERPRISE",
    name: PLAN_LABELS.ENTERPRISE,
    price: "Custom",
    priceNote: "contact us",
    cta: "Contact sales",
    ctaHref: `mailto:${CONTACT_EMAIL}?subject=Meduso%20Enterprise`,
    isMailto: true,
  },
];

export function formatPlanLimit(value: number | null, unit: string): string {
  if (value === null) return "Unlimited";
  if (value === 0) return "—";
  return `${value.toLocaleString()} ${unit}`;
}

export function getTierLimits(plan: SubscriptionPlan) {
  const limits = PLAN_LIMITS[plan];
  return {
    sms: formatPlanLimit(limits.sms_sent, "SMS"),
    voice:
      limits.voice_minutes === null
        ? "Unlimited"
        : limits.voice_minutes === 0
          ? "—"
          : `${limits.voice_minutes} min`,
    imports: formatPlanLimit(limits.customers_imported, "imports"),
  };
}

export const PROBLEM_COMPARISON = {
  headline: "Email surveys get ignored. Conversations don't.",
  description:
    "Your customers already text every day. Meduso meets them there — right after their visit — instead of burying feedback in an inbox they'll never open.",
  emailLabel: "Email surveys",
  medusoLabel: "Meduso",
  rows: [
    { email: "2–5% response rates", meduso: "Customers reply in-thread" },
    { email: "Feels like marketing", meduso: "Feels like a check-in" },
    { email: "Feedback arrives too late", meduso: "Alerts within hours of the visit" },
    { email: "No recovery workflow", meduso: "Staff inbox + action logging" },
  ],
} as const;

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Import customers",
    description: "Upload a CSV, add contacts manually, or sync from your CRM via API or Zapier.",
  },
  {
    step: 2,
    title: "SMS goes out automatically",
    description:
      "After a configurable delay (default 24 hours), Meduso sends a friendly post-visit text.",
  },
  {
    step: 3,
    title: "AI continues the conversation",
    description:
      "Customers reply naturally. AI asks follow-ups, respects opt-outs, and captures the full story.",
  },
  {
    step: 4,
    title: "Recover before it's public",
    description:
      "Negative sentiment triggers real-time alerts so your team can follow up before a bad review.",
  },
] as const;

export const FEATURES = [
  {
    title: "SMS outreach",
    description: "Automated post-visit texts that feel personal, not promotional.",
  },
  {
    title: "AI two-way chat",
    description: "Natural follow-up questions without making customers fill out a form.",
  },
  {
    title: "Real-time alerts",
    description: "A recovery inbox that updates the moment a customer needs attention.",
  },
  {
    title: "Analytics",
    description: "See complaint trends by category and track recovery over time.",
  },
  {
    title: "AI voice calls",
    description: "Optional high-touch phone follow-up for customers who need a human touch.",
  },
  {
    title: "Zapier & API",
    description: "Connect to 6,000+ apps or push customers from your own systems.",
  },
] as const;

export const OUTCOMES = [
  {
    title: "Catch issues early",
    description: "Learn about problems before they become public one-star reviews.",
  },
  {
    title: "Less manual work",
    description: "Outreach and first-pass analysis run automatically in the background.",
  },
  {
    title: "Measurable recovery",
    description: "Log actions taken and see which conversations turned around.",
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: "How does Meduso reach my customers?",
    answer:
      "After you import a customer, Meduso sends an SMS after a delay you configure (24 hours by default). Customers reply by text; AI continues the thread until the conversation is complete.",
  },
  {
    question: "Is this compliant with SMS regulations?",
    answer:
      "Meduso includes opt-out handling in every conversation. You are responsible for having consent to text your customers and following TCPA and carrier guidelines for your business.",
  },
  {
    question: "What integrations are available?",
    answer:
      "Import customers via CSV, manual entry, our public API, or Zapier. Connect your existing CRM or POS workflow without custom development.",
  },
  {
    question: "What happens on the free plan?",
    answer: `The free plan includes ${PLAN_LIMITS.FREE.sms_sent} SMS and ${PLAN_LIMITS.FREE.customers_imported} customer imports per month. Voice calls are available on paid plans. No credit card is required to start.`,
  },
  {
    question: "How do upgrades and billing work?",
    answer:
      "Sign up free, then upgrade to Starter ($49/mo) or Growth ($149/mo) from your dashboard billing settings. Enterprise plans are custom — email us for pricing.",
  },
  {
    question: "What counts toward my usage limits?",
    answer:
      "Every outbound SMS (initial outreach and AI replies) counts toward SMS. Each voice call attempt counts as one minute. New customer imports count; duplicates do not.",
  },
  {
    question: "How is my data secured?",
    answer:
      "Data is stored in Supabase with row-level security. Payments are handled by Stripe. SMS is delivered via Twilio. We never sell your customer data.",
  },
] as const;

export const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
] as const;
