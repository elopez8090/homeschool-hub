import { render } from "@react-email/render";
import { Resend } from "resend";
import type { ReactElement } from "react";
import AdminContactNotificationEmail, {
  type AdminContactDetails,
} from "@/lib/emails/admin-contact-notification";
import AdminNotificationEmail, {
  type AdminProgramDetails,
} from "@/lib/emails/admin-notification";
import ApprovalNotificationEmail from "@/lib/emails/approval-notification";
import ClaimVerificationEmail from "@/lib/emails/claim-verification";
import ContactConfirmationEmail from "@/lib/emails/contact-confirmation";
import DenialNotificationEmail from "@/lib/emails/denial-notification";
import ProgramUpdatedEmail from "@/lib/emails/program-updated";
import SubmissionConfirmationEmail from "@/lib/emails/submission-confirmation";
import { adminInbox, supportEmail } from "@/lib/emails/brand";

export type EmailResult = {
  sent: boolean;
  skipped: boolean;
  id?: string;
  error?: string;
};

export type ProgramSubmissionEmailData = AdminProgramDetails & {
  name: string;
  city: string;
  state: string;
  category: string;
  contactEmail: string;
};

export type ContactNotificationData = AdminContactDetails & {
  name: string;
  email: string;
  subject: string;
  message: string;
};

function fromAddress() {
  return (
    process.env.RESEND_FROM_EMAIL ||
    "Christian Homeschools Hub <onboarding@resend.dev>"
  );
}

function getResend() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

async function deliverEmail({
  to,
  subject,
  react,
  replyTo,
  logLabel,
}: {
  to: string;
  subject: string;
  react: ReactElement;
  replyTo?: string;
  logLabel: string;
}): Promise<EmailResult> {
  const resend = getResend();
  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY is not set. Skipped ${logLabel} to ${to}: ${subject}`,
    );
    return { sent: false, skipped: true };
  }

  if (!to.trim()) {
    console.warn(`[email] Missing recipient. Skipped ${logLabel}: ${subject}`);
    return { sent: false, skipped: true, error: "Missing recipient." };
  }

  try {
    const html = await render(react);
    const text = await render(react, { plainText: true });
    const { data, error } = await resend.emails.send({
      from: fromAddress(),
      to,
      subject,
      html,
      text,
      replyTo,
    });

    if (error) {
      console.error(`[email] ${logLabel} failed`, error);
      return { sent: false, skipped: false, error: error.message };
    }

    console.info(`[email] ${logLabel} sent`, { id: data?.id, to, subject });
    return { sent: true, skipped: false, id: data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    console.error(`[email] ${logLabel} failed`, error);
    return { sent: false, skipped: false, error: message };
  }
}

export async function sendPlainEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}): Promise<EmailResult> {
  const resend = getResend();
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY is not set. Skipped plain email to ${to}: ${subject}`);
    return { sent: false, skipped: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress(),
      to,
      subject,
      text,
    });

    if (error) {
      console.error("[email] Plain email failed", error);
      return { sent: false, skipped: false, error: error.message };
    }

    console.info("[email] Plain email sent", { id: data?.id, to, subject });
    return { sent: true, skipped: false, id: data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    console.error("[email] Plain email failed", error);
    return { sent: false, skipped: false, error: message };
  }
}

export async function sendSubmissionConfirmation(
  email: string,
  programName: string,
  category: string,
) {
  return deliverEmail({
    to: email,
    subject: "Program Submitted - We'll Review It Soon",
    react: SubmissionConfirmationEmail({ programName, category }),
    replyTo: supportEmail(),
    logLabel: "submission confirmation",
  });
}

export async function sendAdminNotification(programData: ProgramSubmissionEmailData) {
  const to = adminInbox();
  if (!to) {
    console.warn("[email] ADMIN_EMAIL is not set. Skipped admin submission notification.");
    return { sent: false, skipped: true, error: "ADMIN_EMAIL is not set." };
  }

  return deliverEmail({
    to,
    subject: `New Program Submission: ${programData.name}`,
    react: AdminNotificationEmail(programData),
    replyTo: programData.contactEmail,
    logLabel: "admin submission notification",
  });
}

export async function sendClaimVerification(
  email: string,
  programName: string,
  verificationLink: string,
) {
  return deliverEmail({
    to: email,
    subject: "Verify Your Program Ownership",
    react: ClaimVerificationEmail({ programName, verificationLink }),
    replyTo: supportEmail(),
    logLabel: "claim verification",
  });
}

export async function sendApprovalNotification(
  email: string,
  programName: string,
  programUrl?: string,
) {
  return deliverEmail({
    to: email,
    subject: "Your Program Has Been Approved!",
    react: ApprovalNotificationEmail({ programName, programUrl }),
    replyTo: supportEmail(),
    logLabel: "approval notification",
  });
}

export async function sendDenialNotification(
  email: string,
  programName: string,
  reason?: string | null,
) {
  return deliverEmail({
    to: email,
    subject: "Your Program Submission Status",
    react: DenialNotificationEmail({ programName, reason }),
    replyTo: supportEmail(),
    logLabel: "denial notification",
  });
}

export async function sendProgramUpdatedEmail(
  email: string,
  programName: string,
  programUrl: string,
  changes: Array<{ label: string; value: string }>,
) {
  return deliverEmail({
    to: email,
    subject: "Your program has been updated",
    react: ProgramUpdatedEmail({ programName, programUrl, changes }),
    replyTo: supportEmail(),
    logLabel: "program update notification",
  });
}

export async function sendContactConfirmation(email: string, subject: string) {
  return deliverEmail({
    to: email,
    subject: "We Received Your Message",
    react: ContactConfirmationEmail({ subject }),
    replyTo: supportEmail(),
    logLabel: "contact confirmation",
  });
}

export async function sendAdminContactNotification(contactData: ContactNotificationData) {
  const to = adminInbox();
  if (!to) {
    console.warn("[email] ADMIN_EMAIL is not set. Skipped admin contact notification.");
    return { sent: false, skipped: true, error: "ADMIN_EMAIL is not set." };
  }

  return deliverEmail({
    to,
    subject: `New contact message: ${contactData.subject}`,
    react: AdminContactNotificationEmail(contactData),
    replyTo: contactData.email,
    logLabel: "admin contact notification",
  });
}
