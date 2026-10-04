import { Heading, Link, Text } from "@react-email/components";
import { supportEmail } from "@/lib/emails/brand";
import {
  DetailBlock,
  EmailButton,
  EmailLayout,
  emailHeading,
  emailLink,
  emailMuted,
  emailText,
} from "@/lib/emails/email-layout";

type ProgramUpdatedProps = {
  programName?: string;
  programUrl?: string;
  changes?: Array<{ label: string; value: string }>;
};

export default function ProgramUpdatedEmail({
  programName = "your program",
  programUrl = "http://localhost:3000",
  changes = [],
}: ProgramUpdatedProps) {
  const support = supportEmail();

  return (
    <EmailLayout preview={`${programName} was updated on Christian Homeschools Hub.`}>
      <Heading style={emailHeading}>Your program has been updated</Heading>
      <Text style={emailText}>
        The listing for <strong>{programName}</strong> was just saved from the
        owner dashboard.
      </Text>
      {changes.length > 0 ? (
        <>
          <Text style={emailText}>What changed:</Text>
          <DetailBlock rows={changes} />
        </>
      ) : (
        <Text style={emailText}>The saved details match the previous listing.</Text>
      )}
      <EmailButton href={programUrl} label="View your program" />
      <Text style={emailMuted}>
        If you did not make this change, sign in and review the listing, or email{" "}
        <Link href={`mailto:${support}`} style={emailLink}>
          {support}
        </Link>
        .
      </Text>
    </EmailLayout>
  );
}
