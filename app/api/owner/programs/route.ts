import { NextRequest, NextResponse } from "next/server";
import { getOwnerSession } from "@/lib/owner-auth";
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
    featured: program.featured,
    esa_verified: program.esa_verified,
    owner_verified: program.owner_verified ?? Boolean(program.claimed_by),
    claimed_at: program.claimed_at || null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getOwnerSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("programs")
      .select("*")
      .eq("claimed_by", session.userId)
      .order("name", { ascending: true });

    if (error) {
      console.error("Failed to load owner programs:", error);
      return NextResponse.json({ error: "Could not load your programs." }, { status: 500 });
    }

    return NextResponse.json({
      email: session.email,
      programs: ((data || []) as Program[]).map(toOwnerProgram),
    });
  } catch (error) {
    console.error("Owner programs error:", error);
    return NextResponse.json({ error: "Could not load your programs." }, { status: 500 });
  }
}
