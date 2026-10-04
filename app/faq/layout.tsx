import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Christian Homeschools Hub",
  description:
    "Answers about browsing Christian Homeschools Hub, claiming a program, verification, and submitting a new listing.",
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
