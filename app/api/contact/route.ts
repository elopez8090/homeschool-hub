import { NextRequest, NextResponse } from "next/server";
import {
  sendAdminContactNotification,
  sendContactConfirmation,
} from "@/lib/email-service";
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
    const [confirmation, adminNotice] = await Promise.all([
      sendContactConfirmation(data.email, data.subject),
      sendAdminContactNotification({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        category: data.category,
      }),
    ]);

    if (!confirmation.sent) {
      console.warn("[contact] Confirmation email was not sent", confirmation);
    }
    if (!adminNotice.sent) {
      console.warn("[contact] Admin notification was not sent", adminNotice);
    }
  } catch (error) {
    console.error("[contact] Failed to send notification", error);
  }

  return NextResponse.json({ success: true });
}
