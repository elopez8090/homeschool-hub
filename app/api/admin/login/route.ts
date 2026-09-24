import { NextRequest, NextResponse } from "next/server";
import { applyAdminSessionCookie, isValidAdminPassword } from "@/lib/admin";

export async function POST(request: NextRequest) {
  let body: { password?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isValidAdminPassword(body.password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  return await applyAdminSessionCookie(NextResponse.json({ success: true }));
}
