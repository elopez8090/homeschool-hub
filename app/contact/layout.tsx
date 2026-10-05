import { generateMetadata, pageMetadata } from "@/lib/seo";

export const metadata = generateMetadata(pageMetadata.contact);

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
