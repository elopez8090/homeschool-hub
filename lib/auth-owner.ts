import { NextRequest } from "next/server";
import { getOwnerSession as readOwnerSession } from "@/lib/owner-auth";
import { getServerSupabase, hasServiceRoleKey } from "@/lib/supabase-server";

/**
 * Reads the httpOnly owner_session cookie created after a claim or sign-in
 * magic link is used. Returns the signed-in email, or null.
 *
 * Sessions live in owner_sessions. auth_tokens only stores the single-use
 * link that created the session, and claimed_by stores the users.id for that email.
 */
export async function getOwnerSession(request: NextRequest): Promise<string | null> {
  const session = await readOwnerSession(request);
  return session?.email ?? null;
}

export async function resolveOwnerUserId(email: string): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !hasServiceRoleKey()) return null;

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("email", normalized)
    .maybeSingle();

  if (error || !data) return null;
  return data.id;
}

export async function checkProgramOwnership(
  programId: number | string,
  userEmail: string,
): Promise<boolean> {
  const id = Number(programId);
  if (!Number.isInteger(id) || id <= 0) return false;

  const userId = await resolveOwnerUserId(userEmail);
  if (!userId || !hasServiceRoleKey()) return false;

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("programs")
    .select("id, claimed_by")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return false;

  const claimedBy = String(data.claimed_by || "");
  return claimedBy === userId || claimedBy.toLowerCase() === userEmail.trim().toLowerCase();
}
