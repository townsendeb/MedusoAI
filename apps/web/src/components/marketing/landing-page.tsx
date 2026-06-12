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

const HERO_STATS = [
  { value: "50+", label: "Free SMS to start" },
  { value: "24h", label: "Default outreach delay" },
  { value: "6k+", label: "Zapier integrations" },
] as const;

function HeroHeadline({
  className,
  as: Tag = "h1",
}: {
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <Tag className={className}>
      We&apos;re killing your{" "}
      <span className={marketing.accentText}>email surveys</span>. Get{" "}
      <span className={marketing.accentText}>real feedback</span> from your customers.
    </Tag>
  );
}

export function LandingPage() {
  return (
    <div className={marketing.page}>
      <MarketingNav />

      <section className={cn(marketing.heroMesh, "pt-32 pb-20 md:pt-40 md:pb-28")}>
        <MarketingContainer className="relative">
          <div className="mx-auto max-w-4xl text-center">
            <p className={cn(marketing.eyebrow, "mx-auto")}>
              <span className={marketing.eyebrowDot} aria-hidden />
              AI-powered customer feedback
            </p>
            <HeroHeadline className={cn(marketing.h1, "mt-8 text-[var(--marketing-foreground)]")} />
            <p className={cn(marketing.lead, "mx-auto mt-7 max-w-2xl")}>{HERO_SUBHEAD}</p>
            <div className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <MarketingButton href={appUrl("/register")} size="lg">
                Start free today
              </MarketingButton>
              <MarketingButton href="#how-it-works" variant="secondary" size="lg">
                See how it works
              </MarketingButton>
            </div>
            <p className={cn(marketing.trust, "mt-6")}>{TRUST_MICROCOPY}</p>
          </div>

          <div className="mt-16 md:mt-24">
            <ProductMock />
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-3 md:gap-6">
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className={marketing.statBubble}>
                <p className={marketing.statValue}>{stat.value}</p>
                <p className={marketing.statLabel}>{stat.label}</p>
              </div>
            ))}
          </div>
        </MarketingContainer>
      </section>

      <MarketingSection variant="muted">
        <SectionHeader
          eyebrow="The problem"
          title="Email surveys get ignored."
          titleHighlight="Conversations don't."
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
          title="From visit to recovery"
          titleHighlight="in four steps"
          description="Set it up once. Meduso handles outreach, conversation, and alerting automatically."
        />
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <li
              key={step.step}
              className={cn(marketing.cardInteractive, "flex flex-col p-7 md:p-8")}
            >
              <div className={marketing.stepNumber}>{step.step}</div>
              <h3 className={cn(marketing.h3, "mt-6")}>{step.title}</h3>
              <p className={cn(marketing.body, "mt-3")}>{step.description}</p>
            </li>
          ))}
        </ol>
      </MarketingSection>

      <MarketingSection id="features" variant="elevated">
        <SectionHeader
          eyebrow="Features"
          title="Everything you need to"
          titleHighlight="recover customers"
          description="Same powerful platform on every plan — you only pay for volume as you grow."
        />
        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          <FeatureCard
            icon={FEATURE_ICONS[0]}
            title={FEATURES[0].title}
            description={FEATURES[0].description}
            featured
            className="md:col-span-2"
          />
          {FEATURES.slice(1).map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={FEATURE_ICONS[index + 1] ?? MessageSquare}
              title={feature.title}
              description={feature.description}
              className={index === 4 ? "md:col-span-2" : undefined}
            />
          ))}
        </div>
      </MarketingSection>

      <MarketingSection>
        <SectionHeader
          eyebrow="Outcomes"
          title="Stop losing customers"
          titleHighlight="silently"
          description="Meduso gives your team an early warning system — before dissatisfaction goes public."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {OUTCOMES.map((outcome, index) => {
            const Icon = OUTCOME_ICONS[index] ?? Target;
            return (
              <div
                key={outcome.title}
                className={cn(marketing.cardInteractive, "p-9 text-center")}
              >
                <div className={cn(marketing.iconBoxLg, "mx-auto")}>
                  <Icon className="size-6" aria-hidden />
                </div>
                <h3 className={cn(marketing.h3, "mt-6")}>{outcome.title}</h3>
                <p className={cn(marketing.body, "mt-3")}>{outcome.description}</p>
              </div>
            );
          })}
        </div>
      </MarketingSection>

      <MarketingSection id="pricing" variant="muted">
        <SectionHeader
          eyebrow="Pricing"
          title="Start free."
          titleHighlight="Scale when you're ready."
          description="Transparent plans for local businesses of every size. Upgrade anytime from your dashboard."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRICING_TIERS.map((tier) => (
            <PricingCard key={tier.plan} tier={tier} />
          ))}
        </div>
        <p className={cn(marketing.bodySm, "mt-10 text-center font-medium")}>
          Paid upgrades are completed in-app via Stripe after you sign up.
        </p>
      </MarketingSection>

      <MarketingSection id="faq">
        <SectionHeader
          eyebrow="FAQ"
          title="Common"
          titleHighlight="questions"
          description="Everything you need to know before getting started."
        />
        <MarketingAccordion items={FAQ_ITEMS} className="mx-auto max-w-3xl" />
      </MarketingSection>

      <MarketingSection id="contact" variant="elevated">
        <SectionHeader
          eyebrow="Contact"
          title="Questions?"
          titleHighlight="We're here to help."
          description="Reach out for sales, support, or enterprise pricing."
        />
        <div className={cn(marketing.glass, "mx-auto max-w-lg p-12 text-center")}>
          <div className={cn(marketing.iconBoxLg, "mx-auto")}>
            <Timer className="size-6" aria-hidden />
          </div>
          <p className={cn(marketing.body, "mt-6 text-base")}>
            Email us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className={marketing.link}>
              {CONTACT_EMAIL}
            </a>{" "}
            and we&apos;ll get back to you as soon as possible.
          </p>
        </div>
      </MarketingSection>

      <MarketingSection container="default" className="pb-32 pt-0">
        <div className={marketing.ctaBand}>
          <p className={cn(marketing.eyebrow, "mx-auto")}>
            <span className={marketing.eyebrowDot} aria-hidden />
            Ready when you are
          </p>
          <h2 className={cn(marketing.h2, "mx-auto mt-8 max-w-2xl text-[var(--marketing-secondary)]")}>
            Ditch the survey links. Start real conversations today.
          </h2>
          <p className={cn(marketing.body, "mx-auto mt-5 max-w-xl")}>
            {TRUST_MICROCOPY} · {HERO_TRUST_LINE}
          </p>
          <MarketingButton href={appUrl("/register")} size="lg" className="mt-10">
            Start free
          </MarketingButton>
        </div>
      </MarketingSection>

      <MarketingFooter />
    </div>
  );
}
