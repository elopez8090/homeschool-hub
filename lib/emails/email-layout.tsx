import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import { siteUrl, supportEmail } from "@/lib/emails/brand";

const colors = {
  navy: "#1e3a8a",
  navyDeep: "#172554",
  blue: "#1d4ed8",
  gold: "#c4a35a",
  cream: "#f7f1e8",
  text: "#1f2937",
  muted: "#4b5563",
  border: "#dbe4f0",
  white: "#ffffff",
  blueSoft: "#eff6ff",
};

type EmailLayoutProps = {
  preview: string;
  children: ReactNode;
};

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  const home = siteUrl();
  const support = supportEmail();
  const year = new Date().getFullYear();

  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brandName}>Christian Homeschools Hub</Text>
          </Section>
          <Section style={goldBar}>
            <Text style={goldSpacer}> </Text>
          </Section>
          <Section style={content}>{children}</Section>
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              Christian Homeschools Hub
              <br />
              A directory of Christian homeschool programs, co-ops, and resources.
            </Text>
            <Text style={footerText}>
              <Link href={home} style={footerLink}>
                Visit the directory
              </Link>
              {" · "}
              <Link href={`${home}/contact`} style={footerLink}>
                Contact
              </Link>
              {" · "}
              <Link href={`mailto:${support}`} style={footerLink}>
                {support}
              </Link>
            </Text>
            <Text style={footerMuted}>
              You received this service email because of an action on Christian
              Homeschools Hub, such as a program submission, ownership claim, or
              contact message. These are not marketing messages.
            </Text>
            <Text style={footerMuted}>© {year} Christian Homeschools Hub. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function EmailButton({ href, label }: { href: string; label: string }) {
  return (
    <Button href={href} style={button}>
      {label}
    </Button>
  );
}

export function DetailBlock({
  rows,
}: {
  rows: Array<{ label: string; value?: string | null }>;
}) {
  const visible = rows.filter((row) => row.value && row.value.trim());
  if (visible.length === 0) return null;

  return (
    <Section style={detailsBox}>
      {visible.map((row) => (
        <Text key={row.label} style={detailRow}>
          <strong style={detailLabel}>{row.label}: </strong>
          {row.value}
        </Text>
      ))}
    </Section>
  );
}

const body = {
  backgroundColor: colors.cream,
  fontFamily: "Arial, Helvetica, sans-serif",
  margin: "0",
  padding: "24px 12px",
};

const container = {
  backgroundColor: colors.white,
  border: `1px solid ${colors.border}`,
  borderRadius: "12px",
  margin: "0 auto",
  maxWidth: "600px",
  overflow: "hidden",
};

const header = {
  backgroundColor: colors.navyDeep,
  padding: "28px 32px 22px",
};

const brandName = {
  color: colors.white,
  fontSize: "20px",
  fontWeight: "700",
  letterSpacing: "0.2px",
  lineHeight: "28px",
  margin: "0",
};

const goldBar = {
  backgroundColor: colors.gold,
  lineHeight: "4px",
};

const goldSpacer = {
  color: colors.gold,
  fontSize: "4px",
  lineHeight: "4px",
  margin: "0",
};

const content = {
  padding: "32px 32px 8px",
};

const button = {
  backgroundColor: colors.blue,
  borderRadius: "8px",
  color: colors.white,
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "700",
  lineHeight: "24px",
  padding: "12px 20px",
  textDecoration: "none",
};

const detailsBox = {
  backgroundColor: colors.blueSoft,
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  margin: "20px 0",
  padding: "8px 16px",
};

const detailRow = {
  color: colors.text,
  fontSize: "15px",
  lineHeight: "22px",
  margin: "10px 0",
};

const detailLabel = {
  color: colors.navy,
};

const divider = {
  borderColor: colors.border,
  margin: "8px 32px 0",
};

const footer = {
  padding: "8px 32px 28px",
};

const footerText = {
  color: colors.muted,
  fontSize: "13px",
  lineHeight: "20px",
  margin: "12px 0 0",
};

const footerMuted = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "12px 0 0",
};

const footerLink = {
  color: colors.blue,
  textDecoration: "underline",
};

export const emailText = {
  color: colors.text,
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 16px",
};

export const emailHeading = {
  color: colors.navy,
  fontSize: "24px",
  fontWeight: "700",
  lineHeight: "32px",
  margin: "0 0 16px",
};

export const emailMuted = {
  color: colors.muted,
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 16px",
};

export const emailLink = {
  color: colors.blue,
  textDecoration: "underline",
};
