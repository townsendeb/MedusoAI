import type { Metadata } from "next";
import { MARKETING_URL, TAGLINE } from "@/lib/marketing/config";
import { marketingFontVariables } from "@/lib/marketing/fonts";

export const metadata: Metadata = {
  title: "Meduso — Real customer feedback without email surveys",
  description: TAGLINE,
  metadataBase: new URL(MARKETING_URL),
  openGraph: {
    title: "Meduso — Real customer feedback without email surveys",
    description: TAGLINE,
    url: MARKETING_URL,
    siteName: "Meduso",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meduso — Real customer feedback without email surveys",
    description: TAGLINE,
  },
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className={marketingFontVariables}>{children}</div>;
}
