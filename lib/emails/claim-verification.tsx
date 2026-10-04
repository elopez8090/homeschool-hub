import { Heading, Text } from "@react-email/components";
import {
  EmailButton,
  EmailLayout,
  emailHeading,
  emailMuted,
  emailText,
} from "@/lib/emails/email-layout";

type ClaimVerificationProps = {
  programName?: string;
  verificationLink?: string;
};

export default function ClaimVerificationEmail({
  programName = "Grace Homeschool Co-op",
  verificationLink = "http://localhost:3000/auth/verify?token=preview",
}: ClaimVerificationProps) {
  return (
    <EmailLayout preview={`Confirm that you own ${programName}. This link expires in 24 hours.`}>
      <Heading style={emailHeading}>Verify your program ownership</Heading>
      <Text style={emailText}>
        Use the button below to confirm that you own <strong>{programName}</strong>{" "}
        on Christian Homeschools Hub.
      </Text>
      <EmailButton href={verificationLink} label="Verify ownership" />
      <Text style={emailText}>
        After you open the link, we will sign you in and mark you as the verified
        owner. You can then update the listing from your owner dashboard.
      </Text>
      <Text style={emailMuted}>
        This link expires in 24 hours and can only be used once. If you did not
        request this, you can ignore this email.
      </Text>
      <Text style={emailMuted}>
        If the button does not work, copy and paste this address into your
        browser:
        <br />
        {verificationLink}
      </Text>
    </EmailLayout>
  );
}
