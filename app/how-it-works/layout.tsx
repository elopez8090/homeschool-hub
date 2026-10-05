import { generateMetadata, pageMetadata } from "@/lib/seo";

export const metadata = generateMetadata(pageMetadata["how-it-works"]);

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
