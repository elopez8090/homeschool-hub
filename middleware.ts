import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Token exists, allow access (actual verification happens on client side with verify endpoint)
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*"],
};
