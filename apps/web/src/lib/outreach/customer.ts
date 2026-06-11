export function isCustomerOptedOut(metadata: Record<string, unknown> | null | undefined): boolean {
  return metadata?.optedOut === true;
}

export function isOptOutMessage(body: string, keywords: readonly string[]): boolean {
  const normalized = body.trim().toUpperCase();
  return keywords.some((keyword) => normalized === keyword || normalized.startsWith(`${keyword} `));
}
