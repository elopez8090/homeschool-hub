import { NextRequest, NextResponse } from "next/server";
import { emailAdminNewSubmission } from "@/lib/email";
import { getServerSupabase } from "@/lib/supabase-server";
import { validateSubmission } from "@/lib/validation";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { errors, data } = validateSubmission(body as Record<string, unknown>);
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" "), errors }, { status: 400 });
  }

  const client = getServerSupabase();
  const row: Record<string, unknown> = {
    name: data.name,
    city: data.city,
    state: data.state,
    category: data.category,
    description: data.description,
    contact_email: data.contact_email,
    website: data.website,
    accepts_esa: data.accepts_esa,
    status: "pending",
  };

  let submission = null;
  let error = null;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const result = await client
      .from("pending_submissions")
      .insert(row)
      .select("*")
      .single();

    submission = result.data;
    error = result.error;

    if (!error) break;

    const missingColumn = error.message.match(/Could not find the '([^']+)' column/)?.[1];
    if ((error.code === "PGRST204" || error.message.includes("schema cache")) && missingColumn && missingColumn in row) {
      delete row[missingColumn];
      continue;
    }

    break;
  }

  if (error) {
    const rlsBlocked = error.message.includes("row-level security");
    return NextResponse.json(
      {
        error: rlsBlocked
          ? "Submissions are blocked by Supabase row-level security. Add SUPABASE_SERVICE_ROLE_KEY to .env.local and run supabase/phase2.sql."
          : error.message,
      },
      { status: 500 },
    );
  }

  await emailAdminNewSubmission(data);

  return NextResponse.json({ success: true, submission }, { status: 201 });
}
