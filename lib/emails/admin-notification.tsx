import { Heading, Link, Text } from "@react-email/components";
import { formatStateLabel, siteUrl } from "@/lib/emails/brand";
import {
  DetailBlock,
  EmailButton,
  EmailLayout,
  emailHeading,
  emailLink,
  emailMuted,
  emailText,
} from "@/lib/emails/email-layout";

export type AdminProgramDetails = {
  name?: string;
  city?: string;
  state?: string;
  category?: string;
  contactEmail?: string;
  phone?: string | null;
  website?: string | null;
  description?: string | null;
};

export default function AdminNotificationEmail({
  name = "Grace Homeschool Co-op",
  city = "Orlando",
  state = "FL",
  category = "Co-op",
  contactEmail = "owner@example.com",
  phone,
  website,
  description,
}: AdminProgramDetails) {
  const dashboardUrl = `${siteUrl()}/admin/dashboard`;
  const submissionsUrl = `${siteUrl()}/admin/submissions`;
  const stateLabel = formatStateLabel(state);

  return (
    <EmailLayout preview={`${name} in ${city}, ${stateLabel} is waiting for review.`}>
      <Heading style={emailHeading}>New program submission</Heading>
      <Text style={emailText}>
        A program was just submitted and is waiting for review. Approve or deny
        it from the admin submissions page.
      </Text>
      <DetailBlock
        rows={[
          { label: "Program", value: name },
          { label: "City", value: city },
          { label: "State", value: stateLabel },
          { label: "Category", value: category },
          { label: "Contact email", value: contactEmail },
          { label: "Phone", value: phone },
          { label: "Website", value: website },
        ]}
      />
      {description ? (
        <Text style={emailText}>
          <strong>Description: </strong>
          {description}
        </Text>
      ) : null}
      <EmailButton href={submissionsUrl} label="Review submission" />
      <Text style={emailMuted}>
        Or open the{" "}
        <Link href={dashboardUrl} style={emailLink}>
          admin dashboard
        </Link>
        .
      </Text>
    </EmailLayout>
  );
}
