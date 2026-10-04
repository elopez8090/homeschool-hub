import { NextRequest, NextResponse } from "next/server";
import { checkProgramOwnership, getOwnerSession } from "@/lib/auth-owner";
import { programListingUrl } from "@/lib/emails/brand";
import { sendProgramUpdatedEmail } from "@/lib/email-service";
import { getServerSupabase } from "@/lib/supabase-server";
import type { Program } from "@/lib/types";
import { validateOwnerProgramUpdate, type OwnerProgramUpdate } from "@/lib/validation";

type RouteContext = {
  params: { id: string };
};

const PERMISSION_ERROR = "You don't have permission to edit this program";

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

function clip(value: string | null | undefined) {
  const text = (value || "").trim();
  if (!text) return "—";
  if (text.length <= 140) return text;
  return `${text.slice(0, 137)}...`;
}

function listChanges(before: Program, after: OwnerProgramUpdate) {
  const fields: Array<[string, string | null | undefined, string | null]> = [
    ["Program name", before.name, after.name],
    ["Description", before.description, after.description],
    ["City", before.city, after.city],
    ["State", before.state, after.state],
    ["Category", before.category, after.category],
    ["Contact email", before.contact_email, after.contact_email],
    ["Phone", before.phone, after.phone],
    ["Website", before.website, after.website],
  ];

  return fields
    .filter(([, previous, next]) => (previous || "").trim() !== (next || "").trim())
    .map(([label, previous, next]) => ({
      label,
      value: `${clip(previous)} → ${clip(next)}`,
    }));
}

async function loadOwnedProgram(request: NextRequest, id: string) {
  const programId = Number(id);
  if (!Number.isInteger(programId) || programId <= 0) {
    return { error: NextResponse.json({ error: "Program not found." }, { status: 404 }) };
  }

  const email = await getOwnerSession(request);
  if (!email) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("id", programId)
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

  const owns = await checkProgramOwnership(programId, email);
  if (!owns) {
    return {
      error: NextResponse.json({ error: PERMISSION_ERROR }, { status: 403 }),
    };
  }

  return { program: data as Program, email };
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
    const { errors, fieldErrors, data } = validateOwnerProgramUpdate(body || {});
    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0], errors, fieldErrors }, { status: 400 });
    }

    const current = result.program as Program;
    const supabase = getServerSupabase();
    const { data: updated, error } = await supabase
      .from("programs")
      .update({
        name: data.name,
        description: data.description,
        city: data.city,
        state: data.state,
        category: data.category,
        contact_email: data.contact_email,
        phone: data.phone,
        website: data.website,
        updated_at: new Date().toISOString(),
      })
      .eq("id", current.id)
      .eq("claimed_by", current.claimed_by)
      .select("*")
      .maybeSingle();

    if (error || !updated) {
      console.error("Failed to update owned program:", error);
      return NextResponse.json({ error: "Could not save this program." }, { status: 500 });
    }

    const saved = updated as Program;
    try {
      const sent = await sendProgramUpdatedEmail(
        data.contact_email,
        data.name,
        programListingUrl(data.state, saved.id),
        listChanges(current, data),
      );
      if (!sent.sent && !sent.skipped) {
        console.error("Program update email failed:", sent.error);
      }
    } catch (emailError) {
      console.error("Program update email failed:", emailError);
    }

    return NextResponse.json({
      message: "Program updated successfully",
      program: toOwnerProgram(saved),
    });
  } catch (error) {
    console.error("Owner program update error:", error);
    return NextResponse.json({ error: "Could not save this program." }, { status: 500 });
  }
}
