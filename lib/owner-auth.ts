import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase, hasServiceRoleKey } from "@/lib/supabase-server";

export const OWNER_COOKIE_NAME = "owner_session";

const MAGIC_LINK_MS = 24 * 60 * 60 * 1000;
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export type AuthAction = "signin" | "claim_program";

export type OwnerSession = {
  userId: string;
  email: string;
};

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function ownerCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export function applyOwnerSessionCookie(response: NextResponse, rawToken: string) {
  response.cookies.set(OWNER_COOKIE_NAME, rawToken, ownerCookieOptions());
  return response;
}

export function clearOwnerSessionCookie(response: NextResponse) {
  response.cookies.set(OWNER_COOKIE_NAME, "", {
    ...ownerCookieOptions(),
    maxAge: 0,
  });
  return response;
}

function requireServiceClient() {
  if (!hasServiceRoleKey()) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }
  return getServerSupabase();
}

export async function createAuthToken(input: {
  email: string;
  action: AuthAction;
  programId?: number | null;
}) {
  const supabase = requireServiceClient();
  const email = normalizeEmail(input.email);
  const token = generateToken();
  const tokenHash = hashToken(token);
  const programId = input.action === "claim_program" ? input.programId ?? null : null;

  let stale = supabase
    .from("auth_tokens")
    .delete()
    .eq("email", email)
    .eq("action", input.action)
    .is("used_at", null);

  if (programId) {
    stale = stale.eq("program_id", programId);
  }

  await stale;

  const { error } = await supabase.from("auth_tokens").insert({
    email,
    token_hash: tokenHash,
    action: input.action,
    program_id: programId,
    expires_at: new Date(Date.now() + MAGIC_LINK_MS).toISOString(),
  });

  if (error) {
    return { token: null as string | null, error };
  }

  return { token, error: null };
}

export async function consumeAuthToken(rawToken: string) {
  const supabase = requireServiceClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("auth_tokens")
    .update({ used_at: now })
    .eq("token_hash", hashToken(rawToken))
    .is("used_at", null)
    .gt("expires_at", now)
    .select("id, email, action, program_id")
    .maybeSingle();

  if (error) {
    return { token: null, error };
  }

  return { token: data, error: null };
}

export async function upsertUserByEmail(email: string) {
  const supabase = requireServiceClient();
  const normalized = normalizeEmail(email);

  const { data: existing, error: lookupError } = await supabase
    .from("users")
    .select("id, email")
    .eq("email", normalized)
    .maybeSingle();

  if (lookupError) {
    return { user: null, error: lookupError };
  }

  if (existing) {
    return { user: existing, error: null };
  }

  const { data, error } = await supabase
    .from("users")
    .insert({ email: normalized })
    .select("id, email")
    .single();

  if (!error && data) {
    return { user: data, error: null };
  }

  const { data: raced } = await supabase
    .from("users")
    .select("id, email")
    .eq("email", normalized)
    .maybeSingle();

  if (raced) {
    return { user: raced, error: null };
  }

  return { user: null, error };
}

export type ClaimResult = "claimed" | "already_yours" | "taken";

export async function claimProgramForUser(programId: number, userId: string) {
  const supabase = requireServiceClient();
  const claimedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("programs")
    .update({ claimed_by: userId, claimed_at: claimedAt })
    .eq("id", programId)
    .is("claimed_by", null)
    .select("id")
    .maybeSingle();

  if (error) {
    return { status: null as ClaimResult | null, error };
  }

  if (data) {
    return { status: "claimed" as ClaimResult, error: null };
  }

  const { data: current, error: readError } = await supabase
    .from("programs")
    .select("claimed_by")
    .eq("id", programId)
    .maybeSingle();

  if (readError) {
    return { status: null as ClaimResult | null, error: readError };
  }

  if (current?.claimed_by === userId) {
    return { status: "already_yours" as ClaimResult, error: null };
  }

  return { status: "taken" as ClaimResult, error: null };
}

export async function createOwnerSession(userId: string) {
  const supabase = requireServiceClient();
  const token = generateToken();

  const { error } = await supabase.from("owner_sessions").insert({
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: new Date(Date.now() + SESSION_MS).toISOString(),
  });

  if (error) {
    return { token: null as string | null, error };
  }

  return { token, error: null };
}

export async function getOwnerSession(request: NextRequest): Promise<OwnerSession | null> {
  const rawToken = request.cookies.get(OWNER_COOKIE_NAME)?.value;
  if (!rawToken || !hasServiceRoleKey()) return null;

  const supabase = getServerSupabase();
  const tokenHash = hashToken(rawToken);
  const { data, error } = await supabase
    .from("owner_sessions")
    .select("user_id, expires_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !data) return null;

  if (new Date(data.expires_at).getTime() <= Date.now()) {
    await supabase.from("owner_sessions").delete().eq("token_hash", tokenHash);
    return null;
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, email")
    .eq("id", data.user_id)
    .maybeSingle();

  if (userError || !user) return null;

  return { userId: user.id, email: user.email };
}

export async function deleteOwnerSession(rawToken: string) {
  if (!hasServiceRoleKey()) return;
  const supabase = getServerSupabase();
  await supabase.from("owner_sessions").delete().eq("token_hash", hashToken(rawToken));
}
