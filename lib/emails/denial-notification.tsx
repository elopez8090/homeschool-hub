import { Heading, Link, Text } from "@react-email/components";
import { siteUrl, supportEmail } from "@/lib/emails/brand";
import {
  DetailBlock,
  EmailButton,
  EmailLayout,
  emailHeading,
  emailLink,
  emailMuted,
  emailText,
} from "@/lib/emails/email-layout";

type DenialNotificationProps = {
  programName?: string;
  reason?: string | null;
};

export default function DenialNotificationEmail({
  programName = "Grace Homeschool Co-op",
  reason,
}: DenialNotificationProps) {
  const submitUrl = `${siteUrl()}/submit`;
  const contactUrl = `${siteUrl()}/contact`;
  const support = supportEmail();
  const trimmedReason = reason?.trim();

  return (
    <EmailLayout preview={`An update on your submission for ${programName}.`}>
      <Heading style={emailHeading}>Update on your submission</Heading>
      <Text style={emailText}>
        Thank you for submitting <strong>{programName}</strong>. After review,
        we are not able to publish this listing right now.
      </Text>
      {trimmedReason ? (
        <DetailBlock rows={[{ label: "Reason", value: trimmedReason }]} />
      ) : (
        <Text style={emailText}>
          A specific reason was not included with this decision. You can contact
          us if you would like more detail.
        </Text>
      )}
      <Text style={emailText}>
        You are welcome to update the details and submit the program again, or
        write to us if you think this was a mistake.
      </Text>
      <EmailButton href={submitUrl} label="Submit again" />
      <Text style={emailMuted}>
        <Link href={contactUrl} style={emailLink}>
          Contact support
        </Link>
        {" or email "}
        <Link href={`mailto:${support}`} style={emailLink}>
          {support}
        </Link>
        .
      </Text>
    </EmailLayout>
  );
}
