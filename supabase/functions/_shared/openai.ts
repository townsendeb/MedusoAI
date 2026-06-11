const DEFAULT_STUB_REPLY =
  "Thanks for sharing that! Is there anything else about your visit we should know?";

export async function generateSmsReply(input: {
  businessName: string;
  customerName: string;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
}): Promise<{ content: string; stub: boolean }> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");

  if (!apiKey) {
    console.info("[openai:stub] SMS reply not generated — OPENAI_API_KEY not configured");
    return { content: DEFAULT_STUB_REPLY, stub: true };
  }

  const systemPrompt = [
    `You are a friendly customer experience assistant for ${input.businessName}.`,
    "You are texting a customer after their recent visit to ask how things went.",
    "Keep replies under 320 characters, warm, and conversational.",
    "Ask one clear follow-up question when appropriate.",
    "Never offer discounts unless the customer asks.",
    "If they seem upset, acknowledge their feelings and invite specifics.",
  ].join(" ");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 180,
      messages: [{ role: "system", content: systemPrompt }, ...input.messages],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${text}`);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("OpenAI returned an empty SMS reply");
  }

  return { content, stub: false };
}
