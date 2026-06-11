import type { UserProfile } from "@/lib/profile";

export function canManageBilling(profile: UserProfile): boolean {
  return profile.role === "OWNER" || profile.role === "ADMIN";
}
