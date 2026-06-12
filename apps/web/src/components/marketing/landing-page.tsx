import {
  BarChart3,
  Bell,
  MessageSquare,
  Phone,
  Plug,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  appUrl,
  FAQ_ITEMS,
  FEATURES,
  HERO_SUBHEAD,
  HERO_TRUST_LINE,
  HOW_IT_WORKS_STEPS,
  OUTCOMES,
  PRICING_TIERS,
  PROBLEM_COMPARISON,
  TAGLINE,
  TRUST_MICROCOPY,
  CONTACT_EMAIL,
} from "@/lib/marketing/config";
import { MarketingFooter } from "./marketing-footer";
import { MarketingNav } from "./marketing-nav";
import { ProductMock } from "./product-mock";
import {
  ComparisonTable,
  FeatureCard,
  MarketingAccordion,
  MarketingButton,
  MarketingContainer,
  MarketingSection,
  PricingCard,
  SectionHeader,
  marketing,
} from "./primitives";
import { cn } from "@/lib/utils";

const FEATURE_ICONS = [
  MessageSquare,
  Sparkles,
  Bell,
  BarChart3,
  Phone,
  Plug,
] as const;

const OUTCOME_ICONS = [Target, Zap, TrendingUp] as const;

export function LandingPage() {
  return (
    <div className={marketing.page}>
      <MarketingNav />

      <section className={marketing.heroGradient}>
        <MarketingContainer className="pb-20 pt-16 md:pb-28 md:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className={marketing.eyebrow}>Customer feedback, reimagined</p>
              <h1 className={cn(marketing.h1, "mt-4")}>{TAGLINE}</h1>
              <p className={cn(marketing.lead, "mt-6")}>{HERO_SUBHEAD}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <MarketingButton href={appUrl("/register")} size="lg">
                  Start free
                </MarketingButton>
                <MarketingButton href="#how-it-works" variant="secondary" size="lg">
                  See how it works
                </MarketingButton>
              </div>
              <p className={cn(marketing.trust, "mt-4")}>{TRUST_MICROCOPY}</p>
              <p className={cn(marketing.trust, "mt-1")}>{HERO_TRUST_LINE}</p>
            </div>
            <ProductMock />
          </div>
        </MarketingContainer>
      </section>

      <MarketingSection variant="muted">
        <SectionHeader
          eyebrow="The problem"
          title={PROBLEM_COMPARISON.headline}
          description={PROBLEM_COMPARISON.description}
        />
        <ComparisonTable
          emailLabel={PROBLEM_COMPARISON.emailLabel}
          medusoLabel={PROBLEM_COMPARISON.medusoLabel}
          rows={PROBLEM_COMPARISON.rows}
          className="mx-auto max-w-3xl"
        />
      </MarketingSection>

      <MarketingSection id="how-it-works">
        <SectionHeader
          eyebrow="How it works"
          title="From visit to recovery in four steps"
          description="Set it up once. Meduso handles outreach, conversation, and alerting automatically."
        />
        <ol className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <li key={step.step} className="relative flex flex-col">
              <div className={marketing.stepNumber}>{step.step}</div>
              <h3 className={cn(marketing.h3, "mt-4")}>{step.title}</h3>
              <p className={cn(marketing.bodySm, "mt-2")}>{step.description}</p>
            </li>
          ))}
        </ol>
      </MarketingSection>

      <MarketingSection id="features" variant="muted">
        <SectionHeader
          eyebrow="Features"
          title="Everything local businesses need to recover customers"
          description="Same powerful platform on every plan — you only pay for volume as you grow."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={FEATURE_ICONS[index] ?? MessageSquare}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <SectionHeader
          eyebrow="Outcomes"
          title="Stop losing customers silently"
          description="Meduso gives your team an early warning system — before dissatisfaction goes public."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {OUTCOMES.map((outcome, index) => {
            const Icon = OUTCOME_ICONS[index] ?? Target;
            return (
              <div key={outcome.title} className={cn(marketing.card, "p-6 text-center")}>
                <div className={cn(marketing.iconBox, "mx-auto")}>
                  <Icon className="size-5" aria-hidden />
                </div>
                <h3 className={cn(marketing.h3, "mt-4")}>{outcome.title}</h3>
                <p className={cn(marketing.bodySm, "mt-2")}>{outcome.description}</p>
              </div>
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection id="pricing" variant="muted">
        <SectionHeader
          eyebrow="Pricing"
          title="Start free. Scale when you're ready."
          description="Transparent plans for local businesses of every size. Upgrade anytime from your dashboard."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRICING_TIERS.map((tier) => (
            <PricingCard key={tier.plan} tier={tier} />
          ))}
        </div>
        <p className={cn(marketing.bodySm, "mt-8 text-center")}>
          Paid upgrades are completed in-app via Stripe after you sign up.
        </p>
      </MarketingSection>

      <MarketingSection id="faq">
        <SectionHeader
          eyebrow="FAQ"
          title="Common questions"
          description="Everything you need to know before getting started."
        />
        <MarketingAccordion items={FAQ_ITEMS} className="mx-auto max-w-3xl" />
      </MarketingSection>

      <MarketingSection id="contact" variant="muted">
        <SectionHeader
          eyebrow="Contact"
          title="Questions? We're here to help."
          description="Reach out for sales, support, or enterprise pricing."
        />
        <div className={cn(marketing.card, "mx-auto max-w-lg p-8 text-center")}>
          <Timer className="mx-auto size-8 text-[var(--marketing-brand)]" aria-hidden />
          <p className={cn(marketing.body, "mt-4")}>
            Email us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className={marketing.link}>
              {CONTACT_EMAIL}
            </a>{" "}
            and we&apos;ll get back to you as soon as possible.
          </p>
        </div>
      </MarketingSection>

      <MarketingSection container="default" className="pb-28 pt-0">
        <div className={marketing.ctaBand}>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {TAGLINE}
          </h2>
          <p className="mt-4 text-[var(--marketing-brand-foreground)]/80">{TRUST_MICROCOPY}</p>
          <MarketingButton href={appUrl("/register")} variant="inverse" size="lg" className="mt-8">
            Start free
          </MarketingButton>
        </div>
      </MarketingSection>

      <MarketingFooter />
    </div>
  );
}
