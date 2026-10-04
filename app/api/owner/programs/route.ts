import { NextRequest, NextResponse } from "next/server";
import { getOwnerSession, resolveOwnerUserId } from "@/lib/auth-owner";
import { getServerSupabase } from "@/lib/supabase-server";
import type { Program } from "@/lib/types";

function toOwnerProgram(program: Program) {
  return {
    id: program.id,
    name: program.name,
    city: program.city,
    state: program.state,
    category: program.category,
    description: program.description,
    contact_email: program.contact_email,
    phone: program.phone || null,
    website: program.website,
    owner_verified: program.owner_verified ?? Boolean(program.claimed_by),
    updated_at: program.updated_at || program.claimed_at || program.created_at || null,
    claimed_at: program.claimed_at || null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const email = await getOwnerSession(request);
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await resolveOwnerUserId(email);
    if (!userId) {
      return NextResponse.json({ email, programs: [] });
    }

    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("programs")
      .select("*")
      .eq("claimed_by", userId)
      .order("name", { ascending: true });

    if (error) {
      console.error("Failed to load owner programs:", error);
      return NextResponse.json({ error: "Could not load your programs." }, { status: 500 });
    }

    return NextResponse.json({
      email,
      programs: ((data || []) as Program[]).map(toOwnerProgram),
    });
  } catch (error) {
    console.error("Owner programs error:", error);
    return NextResponse.json({ error: "Could not load your programs." }, { status: 500 });
  }
}
