type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
};

const ADMIN_INBOX = process.env.ADMIN_EMAIL || "admin@example.com";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

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
  const sendgridKey = process.env.SENDGRID_API_KEY;
  const mailchimpKey = process.env.MAILCHIMP_API_KEY;

  if (sendgridKey) {
    return sendWithSendGrid({ to, subject, text }, sendgridKey);
  }

  if (mailchimpKey) {
    return sendWithMailchimp({ to, subject, text }, mailchimpKey);
  }

  console.warn(`[email] No SENDGRID_API_KEY or MAILCHIMP_API_KEY set. Skipped email to ${to}: ${subject}`);
  return { sent: false, skipped: true };
}

export async function emailAdminNewSubmission(details: {
  name: string;
  city: string;
  state: string;
  category: string;
  contact_email: string;
  website?: string | null;
  description?: string | null;
  accepts_esa?: boolean | null;
}) {
  const dashboardUrl = `${siteUrl()}/admin/dashboard`;

  return sendEmail({
    to: ADMIN_INBOX,
    subject: `New program submission: ${details.name}`,
    text: [
      "A new program was submitted for review.",
      "",
      `Program name: ${details.name}`,
      `City: ${details.city}`,
      `State: ${details.state}`,
      `Category: ${details.category}`,
      `Contact email: ${details.contact_email}`,
      `Website: ${details.website || "Not provided"}`,
      `Accepts ESA funds: ${details.accepts_esa ? "Yes" : "No"}`,
      "",
      "Description:",
      details.description || "Not provided",
      "",
      "Approve or reject this submission in the admin dashboard:",
      dashboardUrl,
    ].join("\n"),
  });
}

export async function emailOwnerApproved(details: {
  name: string;
  contact_email: string;
  listingUrl?: string;
}) {
  return sendEmail({
    to: details.contact_email,
    subject: "Your program has been approved!",
    text: [
      `Congratulations! ${details.name} has been approved.`,
      details.listingUrl
        ? `It's now live at ${details.listingUrl}`
        : "It's now live in the directory.",
      "",
      "Thank you for serving families in your community.",
    ].join("\n"),
  });
}

export async function emailOwnerRejected(details: {
  name: string;
  contact_email: string;
}) {
  return sendEmail({
    to: details.contact_email,
    subject: "Your submission status",
    text: [
      `Your submission for ${details.name} was not approved.`,
      "Contact us for details.",
    ].join("\n"),
  });
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
