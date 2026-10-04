import { sendPlainEmail } from "@/lib/email-service";
import { siteUrl } from "@/lib/emails/brand";

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
};

async function sendWithSendGrid({ to, subject, text }: SendEmailInput, apiKey: string) {
  const from = process.env.SENDGRID_FROM_EMAIL || process.env.MAILCHIMP_FROM_EMAIL || "noreply@example.com";
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from },
      subject,
      content: [{ type: "text/plain", value: text }],
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("[email] SendGrid error", response.status, details);
    return { sent: false, skipped: false, error: details };
  }

  return { sent: true, skipped: false };
}

async function sendWithMailchimp({ to, subject, text }: SendEmailInput, apiKey: string) {
  const from = process.env.MAILCHIMP_FROM_EMAIL || process.env.SENDGRID_FROM_EMAIL || "noreply@example.com";
  const response = await fetch("https://mandrillapp.com/api/1.0/messages/send.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: apiKey,
      message: {
        from_email: from,
        to: [{ email: to, type: "to" }],
        subject,
        text,
      },
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("[email] Mailchimp error", response.status, details);
    return { sent: false, skipped: false, error: details };
  }

  return { sent: true, skipped: false };
}

async function sendEmail({ to, subject, text }: SendEmailInput) {
  if (process.env.RESEND_API_KEY?.trim()) {
    return sendPlainEmail({ to, subject, text });
  }

  const sendgridKey = process.env.SENDGRID_API_KEY;
  const mailchimpKey = process.env.MAILCHIMP_API_KEY;

  if (sendgridKey) {
    return sendWithSendGrid({ to, subject, text }, sendgridKey);
  }

  if (mailchimpKey) {
    return sendWithMailchimp({ to, subject, text }, mailchimpKey);
  }

  console.warn(`[email] No email provider is configured. Skipped email to ${to}: ${subject}`);
  return { sent: false, skipped: true };
}

export async function emailOwnerUpgradeActivated(details: {
  name: string;
  contact_email: string;
  planName: string;
  listingUrl?: string;
  nextBillingDate?: string;
}) {
  return sendEmail({
    to: details.contact_email,
    subject: `${details.planName} is now active for ${details.name}`,
    text: [
      `Thank you! Your ${details.planName} subscription for ${details.name} is active.`,
      details.listingUrl ? `View your listing: ${details.listingUrl}` : "",
      details.nextBillingDate
        ? `Next billing date: ${details.nextBillingDate}`
        : "Your subscription renews automatically each month.",
      "",
      "If you have questions about billing, reply to this email.",
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

export async function emailOwnerMagicLink(details: {
  to: string;
  token: string;
  action: "signin" | "claim_program";
  programName?: string;
}) {
  const verifyUrl = `${siteUrl()}/auth/verify?token=${encodeURIComponent(details.token)}`;
  const claiming = details.action === "claim_program";
  const programName = details.programName || "your program";

  const result = await sendEmail({
    to: details.to,
    subject: claiming
      ? `Claim ${programName} on Christian Homeschools Hub`
      : "Sign in to Christian Homeschools Hub",
    text: claiming
      ? [
          `Use the link below to claim ${programName} and sign in.`,
          "The link expires in 24 hours and can only be used once.",
          "",
          verifyUrl,
          "",
          "If you did not request this, you can ignore this email.",
        ].join("\n")
      : [
          "Use the link below to sign in to your program dashboard.",
          "The link expires in 24 hours and can only be used once.",
          "",
          verifyUrl,
          "",
          "If you did not request this, you can ignore this email.",
        ].join("\n"),
  });

  if (result.skipped) {
    console.info(`[email] Magic link for ${details.to}: ${verifyUrl}`);
  }

  return result;
}

export async function emailOwnerUpgradeCanceled(details: {
  name: string;
  contact_email: string;
  planName: string;
}) {
  return sendEmail({
    to: details.contact_email,
    subject: `${details.planName} subscription canceled for ${details.name}`,
    text: [
      `Your ${details.planName} subscription for ${details.name} has ended.`,
      "The upgrade will no longer appear on your listing.",
      "",
      "You can start a new subscription from your program page at any time.",
    ].join("\n"),
  });
}
