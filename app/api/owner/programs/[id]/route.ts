import { NextRequest, NextResponse } from "next/server";
import { getOwnerSession } from "@/lib/owner-auth";
import { getServerSupabase } from "@/lib/supabase-server";
import type { Program } from "@/lib/types";
import { validateOwnerProgramUpdate } from "@/lib/validation";

type RouteContext = {
  params: { id: string };
};

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

async function loadOwnedProgram(request: NextRequest, id: string) {
  const programId = Number(id);
  if (!Number.isInteger(programId) || programId <= 0) {
    return { error: NextResponse.json({ error: "Program not found." }, { status: 404 }) };
  }

  const session = await getOwnerSession(request);
  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("id", programId)
    .eq("claimed_by", session.userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load owned program:", error);
    return {
      error: NextResponse.json({ error: "Could not load this program." }, { status: 500 }),
    };
  }

  if (!data) {
    return { error: NextResponse.json({ error: "Program not found." }, { status: 404 }) };
  }

  return { program: data as Program, session };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const result = await loadOwnedProgram(request, context.params.id);
    if ("error" in result && result.error) return result.error;
    return NextResponse.json({ program: toOwnerProgram(result.program as Program) });
  } catch (error) {
    console.error("Owner program error:", error);
    return NextResponse.json({ error: "Could not load this program." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const result = await loadOwnedProgram(request, context.params.id);
    if ("error" in result && result.error) return result.error;

    const body = await request.json().catch(() => null);
    const { errors, data } = validateOwnerProgramUpdate(body || {});
    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0], errors }, { status: 400 });
    }

    const supabase = getServerSupabase();
    const { data: updated, error } = await supabase
      .from("programs")
      .update({
        name: data.name,
        city: data.city,
        category: data.category,
        description: data.description,
        contact_email: data.contact_email,
        phone: data.phone,
        website: data.website,
        updated_at: new Date().toISOString(),
      })
      .eq("id", result.program!.id)
      .eq("claimed_by", result.session!.userId)
      .select("*")
      .maybeSingle();

    if (error || !updated) {
      console.error("Failed to update owned program:", error);
      return NextResponse.json({ error: "Could not save this program." }, { status: 500 });
    }

    return NextResponse.json({ program: toOwnerProgram(updated as Program) });
  } catch (error) {
    console.error("Owner program update error:", error);
    return NextResponse.json({ error: "Could not save this program." }, { status: 500 });
  }
}
