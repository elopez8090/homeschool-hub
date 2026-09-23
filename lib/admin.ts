import { NextRequest, NextResponse } from "next/server";

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

export function isValidAdminPassword(password: string | null | undefined) {
  const expected = getAdminPassword();
  return Boolean(expected && password && password === expected);
}

export function getPasswordFromRequest(request: NextRequest) {
  const headerPassword = request.headers.get("x-admin-password");
  const queryPassword = request.nextUrl.searchParams.get("password");
  return headerPassword || queryPassword;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
