import { Heading, Link, Text } from "@react-email/components";
import { siteUrl, supportEmail } from "@/lib/emails/brand";
import {
  EmailButton,
  EmailLayout,
  emailHeading,
  emailLink,
  emailMuted,
  emailText,
} from "@/lib/emails/email-layout";

type ApprovalNotificationProps = {
  programName?: string;
  programUrl?: string;
};

export default function ApprovalNotificationEmail({
  programName = "Grace Homeschool Co-op",
  programUrl,
}: ApprovalNotificationProps) {
  const listingUrl = programUrl || siteUrl();
  const support = supportEmail();

  return (
    <EmailLayout preview={`${programName} is now live on Christian Homeschools Hub.`}>
      <Heading style={emailHeading}>Your program has been approved</Heading>
      <Text style={emailText}>
        Good news. <strong>{programName}</strong> has been approved and is now
        live in the directory.
      </Text>
      <EmailButton href={listingUrl} label="View your program" />
      <Text style={emailText}>
        To manage the listing, open the program page and choose Claim this
        program. Use the contact email on the listing. We will send a
        verification link that expires in 24 hours. After you verify, you can
        sign in and edit the program from your owner dashboard.
      </Text>
      <Text style={emailMuted}>
        Need help? Email{" "}
        <Link href={`mailto:${support}`} style={emailLink}>
          {support}
        </Link>
        .
      </Text>
    </EmailLayout>
  );
}
