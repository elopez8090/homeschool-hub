import { Heading, Link, Text } from "@react-email/components";
import { supportEmail } from "@/lib/emails/brand";
import {
  EmailLayout,
  emailHeading,
  emailLink,
  emailText,
} from "@/lib/emails/email-layout";

type ContactConfirmationProps = {
  subject?: string;
};

export default function ContactConfirmationEmail({
  subject = "your message",
}: ContactConfirmationProps) {
  const support = supportEmail();

  return (
    <EmailLayout preview="We received your message and will reply within 24-48 hours.">
      <Heading style={emailHeading}>We received your message</Heading>
      <Text style={emailText}>
        Thank you for contacting Christian Homeschools Hub. We have your message
        about <strong>{subject}</strong>.
      </Text>
      <Text style={emailText}>
        We typically reply within 24-48 hours. If your question is urgent, you
        can also email{" "}
        <Link href={`mailto:${support}`} style={emailLink}>
          {support}
        </Link>
        .
      </Text>
    </EmailLayout>
  );
}
