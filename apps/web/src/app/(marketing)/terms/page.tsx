import { LegalContact, LegalPage } from "@/components/marketing/legal-page";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        <strong>Last updated:</strong> June 2026
      </p>
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your use of Meduso AI&apos;s website and
        application. By creating an account or using our services, you agree to these Terms.
      </p>

      <h2 className="text-xl font-semibold text-[var(--marketing-foreground)]">Service description</h2>
      <p>
        Meduso provides automated customer outreach via SMS and optional voice, AI-assisted
        conversations, sentiment analysis, alerts, and analytics for businesses.
      </p>

      <h2 className="text-xl font-semibold text-[var(--marketing-foreground)]">Your responsibilities</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>You must have proper consent to contact customers via SMS or phone</li>
        <li>You are responsible for compliance with TCPA, carrier rules, and applicable laws</li>
        <li>You must provide accurate account and billing information</li>
        <li>You may not use Meduso for spam, harassment, or unlawful purposes</li>
      </ul>

      <h2 className="text-xl font-semibold text-[var(--marketing-foreground)]">Subscriptions and billing</h2>
      <p>
        Paid plans are billed monthly through Stripe. Usage limits apply per plan. Outreach may pause
        when limits are reached or payment fails. You may cancel through the billing portal; access
        continues through the end of the paid period unless otherwise stated.
      </p>

      <h2 className="text-xl font-semibold text-[var(--marketing-foreground)]">Disclaimer</h2>
      <p>
        Meduso is provided &quot;as is&quot; without warranties of any kind. We do not guarantee specific
        business outcomes such as review scores or customer retention.
      </p>

      <h2 className="text-xl font-semibold text-[var(--marketing-foreground)]">Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Meduso AI shall not be liable for indirect,
        incidental, or consequential damages arising from your use of the service.
      </p>

      <LegalContact />
    </LegalPage>
  );
}
