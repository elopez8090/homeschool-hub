import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — Christian Homeschools Hub",
  description:
    "See how families find programs, how owners claim and verify a listing, and how to submit a new program. Easy, free, and built so families can trust what they read.",
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
