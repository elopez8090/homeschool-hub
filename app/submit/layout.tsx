import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit Your Program — Christian Homeschools Hub",
  description:
    "Add your homeschool program to the free Christian Homeschools Hub directory. Listings are reviewed before they are published.",
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
