import { generateMetadata, pageMetadata } from "@/lib/seo";

export const metadata = generateMetadata(pageMetadata.about);

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
