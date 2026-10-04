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

type SubmissionConfirmationProps = {
  programName?: string;
  category?: string;
};

export default function SubmissionConfirmationEmail({
  programName = "Grace Homeschool Co-op",
  category = "Co-op",
}: SubmissionConfirmationProps) {
  const faqUrl = `${siteUrl()}/faq`;
  const support = supportEmail();

  return (
    <EmailLayout preview={`We received ${programName} and will review it within 3-5 business days.`}>
      <Heading style={emailHeading}>We received your program</Heading>
      <Text style={emailText}>
        Thank you for submitting a program to Christian Homeschools Hub. We are
        glad you want to help families in your community.
      </Text>
      <DetailBlock
        rows={[
          { label: "Program", value: programName },
          { label: "Category", value: category },
        ]}
      />
      <Text style={emailText}>
        Our team reviews new listings within 3-5 business days. We will email
        you when your program is approved or if we need anything else.
      </Text>
      <EmailButton href={faqUrl} label="Read the FAQ" />
      <Text style={emailMuted}>
        Questions in the meantime? Email{" "}
        <Link href={`mailto:${support}`} style={emailLink}>
          {support}
        </Link>
        .
      </Text>
    </EmailLayout>
  );
}
