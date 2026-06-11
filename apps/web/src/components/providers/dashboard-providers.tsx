"use client";

import { QueryProvider } from "@/components/providers/query-provider";

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
