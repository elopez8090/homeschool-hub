import type { SupabaseClient } from "@supabase/supabase-js";
import type { PendingSubmission, Program } from "@/lib/types";

export async function fetchProgramsByState(
  client: SupabaseClient,
  stateSlug: string,
) {
  const { data, error } = await client
    .from("programs")
    .select("*")
    .eq("state", stateSlug.toLowerCase())
    .order("featured", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    return { programs: [] as Program[], error };
  }

  return { programs: (data || []) as Program[], error: null };
}

export async function fetchProgramById(client: SupabaseClient, id: string) {
  const { data, error } = await client
    .from("programs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { program: null as Program | null, error };
  }

  return { program: (data as Program | null) || null, error: null };
}

export async function fetchPendingSubmissions(client: SupabaseClient) {
  const { data, error } = await client
    .from("pending_submissions")
    .select("*")
    .eq("status", "pending")
    .order("submitted_at", { ascending: false });

  if (error) {
    return { submissions: [] as PendingSubmission[], error };
  }

  return { submissions: (data || []) as PendingSubmission[], error: null };
}
