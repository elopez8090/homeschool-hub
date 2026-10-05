import { generateMetadata, pageMetadata } from "@/lib/seo";

export const metadata = generateMetadata(pageMetadata.privacy);

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
