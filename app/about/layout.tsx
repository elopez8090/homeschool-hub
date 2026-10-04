import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Christian Homeschools Hub",
  description:
    "Christian Homeschools Hub is a free directory that helps families find Christ-centered homeschool programs by location, with owner verification badges.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
