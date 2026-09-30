export const dynamic = 'force-dynamic';

// app/api/admin/verify/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;
    console.log("Token from cookie:", token);

    if (!token) {
      console.log("No token found in cookie");
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const tokenHash = hashPassword(token);
    console.log("Token hash:", tokenHash);

    // Find valid session
    const { data: session, error: sessionError } = await supabase
      .from("admin_sessions")
      .select("admin_id, expires_at")
      .eq("token_hash", tokenHash)
      .single();

    console.log("Session error:", sessionError);
    console.log("Session data:", session);

    if (sessionError || !session) {
      console.log("No session found or error occurred");
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      await supabase
        .from("admin_sessions")
        .delete()
        .eq("token_hash", tokenHash);

      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Get admin user info
    const { data: admin } = await supabase
      .from("admin_users")
      .select("id, email, name")
      .eq("id", session.admin_id)
      .single();

    return NextResponse.json({
      authenticated: true,
      admin,
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}
