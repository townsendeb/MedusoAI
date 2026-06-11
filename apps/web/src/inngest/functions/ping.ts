import { inngest } from "../client";

export const ping = inngest.createFunction(
  { id: "ping", name: "Ping", triggers: [{ event: "meduso/ping" }] },
  async ({ event }) => {
    const data = event.data as { message?: string };
    return {
      ok: true,
      message: data.message ?? "pong",
      timestamp: new Date().toISOString(),
    };
  },
);
