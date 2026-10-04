import { Heading, Text } from "@react-email/components";
import {
  DetailBlock,
  EmailButton,
  EmailLayout,
  emailHeading,
  emailText,
} from "@/lib/emails/email-layout";

export type AdminContactDetails = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  category?: string | null;
};

export default function AdminContactNotificationEmail({
  name = "Alex Morgan",
  email = "alex@example.com",
  subject = "Question about a listing",
  message = "Hello, I have a question about my program listing.",
  category,
}: AdminContactDetails) {
  const replyHref = `mailto:${email}?subject=${encodeURIComponent(`Re: ${subject}`)}`;

  return (
    <EmailLayout preview={`${name} sent a message: ${subject}`}>
      <Heading style={emailHeading}>New contact form message</Heading>
      <Text style={emailText}>
        Someone sent a message from the contact form. You can reply directly to
        the sender.
      </Text>
      <DetailBlock
        rows={[
          { label: "Name", value: name },
          { label: "Email", value: email },
          { label: "Category", value: category },
          { label: "Subject", value: subject },
        ]}
      />
      <Text style={emailText}>
        <strong>Message</strong>
        <br />
        {message}
      </Text>
      <EmailButton href={replyHref} label="Reply to sender" />
    </EmailLayout>
  );
}
