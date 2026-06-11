import type { User } from "@supabase/supabase-js";

/** True when the user signed in with Google and has no email/password identity. */
export function isGoogleOnlyUser(user: User): boolean {
  const providers = user.app_metadata?.providers as string[] | undefined;
  if (providers?.length === 1 && providers[0] === "google") {
    return true;
  }

  return user.app_metadata?.provider === "google";
}
