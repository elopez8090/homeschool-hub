type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
};

const ADMIN_INBOX = process.env.ADMIN_EMAIL || "admin@example.com";

async function sendEmail({ to, subject, text }: SendEmailInput) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM_EMAIL || "noreply@example.com";

  if (!apiKey) {
    console.warn(`[email] SENDGRID_API_KEY is not set. Skipped email to ${to}: ${subject}`);
    return { sent: false, skipped: true };
  }

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
  return sendEmail({
    to: ADMIN_INBOX,
    subject: `New program submission: ${details.name}`,
    text: [
      "A new program was submitted to Christian Homeschools Hub.",
      "",
      `Program: ${details.name}`,
      `City: ${details.city}`,
      `State: ${details.state}`,
      `Category: ${details.category}`,
      `Contact: ${details.contact_email}`,
      `Website: ${details.website || "Not provided"}`,
      `Accepts ESA funds: ${details.accepts_esa ? "Yes" : "No"}`,
      "",
      "Description:",
      details.description || "Not provided",
      "",
      "Review it in the admin dashboard.",
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
    subject: `${details.name} is now live`,
    text: [
      `Good news — ${details.name} has been approved and is now listed on Christian Homeschools Hub.`,
      details.listingUrl ? `\nView your listing:\n${details.listingUrl}` : "",
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
    subject: `Update on your ${details.name} submission`,
    text: [
      `Thank you for submitting ${details.name} to Christian Homeschools Hub.`,
      "",
      "After review, we were not able to publish this listing at this time.",
      "You are welcome to submit again with updated details.",
    ].join("\n"),
  });
}
