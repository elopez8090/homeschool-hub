import { NextRequest, NextResponse } from "next/server";
import { emailOwnerMagicLink } from "@/lib/email";
import { createAuthToken, normalizeEmail } from "@/lib/owner-auth";
import { getServerSupabase, hasServiceRoleKey } from "@/lib/supabase-server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_MESSAGE =
  "If an owner account exists for that email, we sent a sign-in link. It expires in 24 hours.";

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

    if (!email || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const supabase = getServerSupabase();
    const { data: user, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("Owner sign-in lookup failed:", error);
      return NextResponse.json({ error: "Could not send a sign-in link." }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
    }

    const { token, error: tokenError } = await createAuthToken({
      email,
      action: "signin",
    });

    if (tokenError || !token) {
      console.error("Failed to create sign-in token:", tokenError);
      return NextResponse.json({ error: "Could not send a sign-in link." }, { status: 500 });
    }

    const sent = await emailOwnerMagicLink({
      to: email,
      token,
      action: "signin",
    });

    if (!sent.sent && !sent.skipped) {
      return NextResponse.json({ error: "Could not send a sign-in link." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
  } catch (error) {
    console.error("Owner sign-in error:", error);
    return NextResponse.json({ error: "Could not send a sign-in link." }, { status: 500 });
  }
}
