export async function sendInngestEvent(
  name: string,
  data: Record<string, unknown>,
  id?: string,
): Promise<void> {
  const eventKey = Deno.env.get("INNGEST_EVENT_KEY");
  if (!eventKey) {
    throw new Error("INNGEST_EVENT_KEY is not configured");
  }

  const payload: Record<string, unknown> = { name, data };
  if (id) {
    payload.id = id;
  }

  const response = await fetch(`https://inn.gs/e/${eventKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to send Inngest event: ${text}`);
  }
}
