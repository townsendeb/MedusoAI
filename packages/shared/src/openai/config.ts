export function isOpenAiConfigured(apiKey?: string): boolean {
  return Boolean(apiKey ?? process.env.OPENAI_API_KEY);
}

export function getOpenAiApiKey(): string | null {
  return process.env.OPENAI_API_KEY ?? null;
}
