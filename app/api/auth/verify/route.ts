import { NextRequest, NextResponse } from "next/server";
import {
  applyOwnerSessionCookie,
  claimProgramForUser,
  consumeAuthToken,
  createOwnerSession,
  upsertUserByEmail,
} from "@/lib/owner-auth";

function loginRedirect(request: NextRequest, error: string) {
  const url = new URL("/owner/login", request.url);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const rawToken = request.nextUrl.searchParams.get("token") || "";
  if (!rawToken) {
    return loginRedirect(request, "missing_token");
  }

  try {
    const { token, error } = await consumeAuthToken(rawToken);
    if (error || !token) {
      return loginRedirect(request, "invalid_token");
    }

    const { user, error: userError } = await upsertUserByEmail(token.email);
    if (userError || !user) {
      console.error("Failed to create owner user:", userError);
      return loginRedirect(request, "session_failed");
    }

    let destination = "/owner/programs";

    if (token.action === "claim_program") {
      const programId = Number(token.program_id);
      if (!Number.isInteger(programId) || programId <= 0) {
        return loginRedirect(request, "invalid_token");
      }

      const { status, error: claimError } = await claimProgramForUser(programId, user.id);
      if (claimError || !status) {
        console.error("Failed to claim program:", claimError);
        return loginRedirect(request, "session_failed");
      }

      if (status === "taken") {
        destination = "/owner/programs?notice=taken";
      } else {
        destination = `/owner/programs/${programId}/edit?claimed=1`;
      }
    }

    const { token: sessionToken, error: sessionError } = await createOwnerSession(user.id);
    if (sessionError || !sessionToken) {
      console.error("Failed to create owner session:", sessionError);
      return loginRedirect(request, "session_failed");
    }

    const response = NextResponse.redirect(new URL(destination, request.url));
    return applyOwnerSessionCookie(response, sessionToken);
  } catch (error) {
    console.error("Verify error:", error);
    return loginRedirect(request, "invalid_token");
  }
}
