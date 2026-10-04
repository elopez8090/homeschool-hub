import { NextRequest, NextResponse } from "next/server";
import { getOwnerSession } from "@/lib/auth-owner";

export async function GET(request: NextRequest) {
  const email = await getOwnerSession(request);
  if (!email) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, email });
}
