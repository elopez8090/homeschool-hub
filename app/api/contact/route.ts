import { NextRequest, NextResponse } from "next/server";
import { emailContactInquiry } from "@/lib/email";
import { validateContact, type ContactInput } from "@/lib/validation";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { errors, fieldErrors, data } = validateContact(
    body && typeof body === "object" ? (body as Partial<ContactInput>) : {},
  );

  if (errors.length > 0) {
    return NextResponse.json(
      { error: errors[0], errors, fieldErrors },
      { status: 400 },
    );
  }

  console.info("[contact] New message", data);

  try {
    const result = await emailContactInquiry(data);

    if (result.skipped || !result.sent) {
      console.warn(
        "[contact] Notification email was not sent. The message was logged and accepted.",
      );
    }
  } catch (error) {
    console.error("[contact] Failed to send notification", error);
  }

  return NextResponse.json({ success: true });
}
