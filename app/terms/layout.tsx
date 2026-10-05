import { generateMetadata, pageMetadata } from "@/lib/seo";

export const metadata = generateMetadata(pageMetadata.terms);

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
