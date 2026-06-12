import { Inter, Plus_Jakarta_Sans } from "next/font/google";

/** Industry-standard SaaS body font (Linear, Notion, Shopify, etc.) */
export const marketingBodyFont = Inter({
  variable: "--font-marketing-body",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Warm, rounded display font common on modern startup marketing sites.
 * Pairs with Inter for headings + body (top SaaS pairing in 2025–2026).
 */
export const marketingDisplayFont = Plus_Jakarta_Sans({
  variable: "--font-marketing-display",
  subsets: ["latin"],
  display: "swap",
});

export const marketingFontVariables = `${marketingBodyFont.variable} ${marketingDisplayFont.variable}`;
