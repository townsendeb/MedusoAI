"use client";

import { useSearchParams } from "next/navigation";

export function AuthErrorBanner() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (!error) {
    return null;
  }

  const message =
    error === "auth"
      ? "Sign in failed. Please try again."
      : "Something went wrong. Please try again.";

  return <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{message}</p>;
}
