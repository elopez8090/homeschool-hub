import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Christian Homeschools Hub",
  description:
    "Contact Christian Homeschools Hub with questions about listings, submissions, or the directory. We typically respond within 24–48 hours.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
