import { LegalContact, LegalPage } from "@/components/marketing/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        <strong>Last updated:</strong> June 2026
      </p>
      <p>
        Meduso AI (&quot;Meduso,&quot; &quot;we,&quot; &quot;us&quot;) provides customer feedback and recovery
        software for businesses. This Privacy Policy describes how we collect, use, and share
        information when you use our website and application.
      </p>

      <h2 className="text-xl font-semibold text-[var(--marketing-foreground)]">Information we collect</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>Account information (name, email, organization details)</li>
        <li>Customer contact data you import (names, phone numbers)</li>
        <li>SMS and voice conversation content and metadata</li>
        <li>Usage data, billing information, and support communications</li>
      </ul>

      <h2 className="text-xl font-semibold text-[var(--marketing-foreground)]">How we use information</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>Provide outreach, AI analysis, alerts, and analytics</li>
        <li>Process payments and manage subscriptions</li>
        <li>Improve and secure our services</li>
        <li>Communicate with you about your account</li>
      </ul>

      <h2 className="text-xl font-semibold text-[var(--marketing-foreground)]">Service providers</h2>
      <p>
        We use trusted subprocessors including Supabase (database and authentication), Twilio (SMS
        and voice), OpenAI (AI processing), Stripe (payments), Vercel (hosting), and Inngest
        (background jobs). These providers process data on our behalf under contractual obligations.
      </p>

      <h2 className="text-xl font-semibold text-[var(--marketing-foreground)]">Data retention</h2>
      <p>
        We retain data for as long as your account is active or as needed to provide services,
        comply with law, and resolve disputes.
      </p>

      <h2 className="text-xl font-semibold text-[var(--marketing-foreground)]">Your rights</h2>
      <p>
        Depending on your location, you may have rights to access, correct, delete, or export your
        personal data. Contact us to make a request.
      </p>

      <LegalContact />
    </LegalPage>
  );
}
