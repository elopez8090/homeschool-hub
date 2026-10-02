import { NextRequest, NextResponse } from "next/server";
import {
  OWNER_COOKIE_NAME,
  clearOwnerSessionCookie,
  deleteOwnerSession,
} from "@/lib/owner-auth";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(OWNER_COOKIE_NAME)?.value;
    if (token) {
      await deleteOwnerSession(token);
    }

    const response = NextResponse.json({ ok: true });
    return clearOwnerSessionCookie(response);
  } catch (error) {
    console.error("Owner logout error:", error);
    return NextResponse.json({ error: "Could not sign out." }, { status: 500 });
  }
}
