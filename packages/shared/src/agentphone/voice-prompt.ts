export type BuildVoicePromptInput = {
  businessName: string;
  customerName: string;
};

export function buildVoiceInitialGreeting(input: BuildVoicePromptInput): string {
  return `Hi ${input.customerName}, thanks for visiting ${input.businessName}! I'm reaching out to see how your experience was. Do you have a moment to share?`;
}

export function buildVoiceSystemPrompt(input: BuildVoicePromptInput): string {
  return [
    `You are a friendly customer experience assistant calling on behalf of ${input.businessName}.`,
    `You are speaking with ${input.customerName} after their recent visit.`,
    "Ask how their experience was and listen carefully to their response.",
    "Keep the conversation warm, concise, and natural — under 3 minutes total.",
    "Ask one follow-up question when appropriate to understand their experience better.",
    "If they seem upset, acknowledge their feelings and invite specifics.",
    "Never offer discounts unless the customer asks.",
    "Thank them for their time and end the call politely when the conversation is complete.",
  ].join(" ");
}
