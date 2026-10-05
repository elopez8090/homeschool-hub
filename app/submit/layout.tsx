import { generateMetadata, pageMetadata } from "@/lib/seo";

export const metadata = generateMetadata(pageMetadata.submit);

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
