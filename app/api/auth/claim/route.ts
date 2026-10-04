import { NextRequest, NextResponse } from "next/server";
import { siteUrl } from "@/lib/emails/brand";
import { sendClaimVerification } from "@/lib/email-service";
import { createAuthToken, normalizeEmail } from "@/lib/owner-auth";
import { getServerSupabase, hasServiceRoleKey } from "@/lib/supabase-server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    if (!hasServiceRoleKey()) {
      return NextResponse.json(
        { error: "Owner sign-in is not configured." },
        { status: 500 },
      );
    }

    const body = await request.json().catch(() => null);
    const email = normalizeEmail(String(body?.email || ""));
    const programId = Number(body?.programId);

    if (!email || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (!Number.isInteger(programId) || programId <= 0) {
      return NextResponse.json({ error: "Program not found." }, { status: 404 });
    }

    const supabase = getServerSupabase();
    const { data: program, error } = await supabase
      .from("programs")
      .select("id, name, contact_email, claimed_by")
      .eq("id", programId)
      .maybeSingle();

    if (error || !program) {
      return NextResponse.json({ error: "Program not found." }, { status: 404 });
    }

    if (program.claimed_by) {
      return NextResponse.json(
        { error: "This program has already been claimed." },
        { status: 409 },
      );
    }

    const contactEmail = normalizeEmail(program.contact_email || "");
    if (!contactEmail || email !== contactEmail) {
      return NextResponse.json(
        { error: "Use the contact email listed on this program." },
        { status: 400 },
      );
    }

    const { token, error: tokenError } = await createAuthToken({
      email,
      action: "claim_program",
      programId,
    });

    if (tokenError || !token) {
      console.error("Failed to create claim token:", tokenError);
      return NextResponse.json(
        { error: "Could not send a verification link. Try again." },
        { status: 500 },
      );
    }

    const verificationLink = `${siteUrl()}/auth/verify?token=${encodeURIComponent(token)}`;
    const sent = await sendClaimVerification(
      email,
      program.name || "your program",
      verificationLink,
    );

    if (sent.skipped) {
      console.info(`[email] Claim verification link for ${email}: ${verificationLink}`);
    }

    if (!sent.sent && !sent.skipped) {
      return NextResponse.json(
        { error: "Could not send a verification link. Try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Check your email for a link to claim this program. It expires in 24 hours.",
    });
  } catch (error) {
    console.error("Claim error:", error);
    return NextResponse.json({ error: "Could not start the claim." }, { status: 500 });
  }
}
