import { NextRequest, NextResponse } from "next/server";

export const ADMIN_COOKIE_NAME = "admin_session";
const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

export function isValidAdminPassword(password: string | null | undefined) {
  const expected = getAdminPassword();
  return Boolean(expected && password && password === expected);
}

export async function getAdminSessionToken() {
  const password = getAdminPassword();
  if (!password) return "";

  const data = new TextEncoder().encode(`homeschool-hub-admin:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function isAdminCookieValid(value: string | undefined | null) {
  const token = await getAdminSessionToken();
  return Boolean(token && value && value === token);
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  };
}

export async function applyAdminSessionCookie(response: NextResponse) {
  const token = await getAdminSessionToken();
  if (!token) return response;
  response.cookies.set(ADMIN_COOKIE_NAME, token, getAdminCookieOptions());
  return response;
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    ...getAdminCookieOptions(),
    maxAge: 0,
  });
  return response;
}

export function getPasswordFromRequest(request: NextRequest) {
  const headerPassword = request.headers.get("x-admin-password");
  const queryPassword = request.nextUrl.searchParams.get("password");
  return headerPassword || queryPassword;
}

export async function isAdminRequest(request: NextRequest) {
  if (isValidAdminPassword(getPasswordFromRequest(request))) return true;
  return isAdminCookieValid(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
