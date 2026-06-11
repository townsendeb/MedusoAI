import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

export async function consumeRateLimit(
  supabase: SupabaseClient,
  bucketKey: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("consume_rate_limit", {
    p_bucket_key: bucketKey,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    console.error("rate limit error:", error);
    return true;
  }

  return data === true;
}

export function rateLimitResponse(windowSeconds: number): Response {
  return new Response(
    JSON.stringify({
      error: "Rate limit exceeded",
      retryAfterSeconds: windowSeconds,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(windowSeconds),
      },
    },
  );
}
