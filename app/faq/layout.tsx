import JsonLd from "@/components/JsonLd";
import { faqEntries } from "@/lib/faq";
import { generateFAQSchema } from "@/lib/schema";
import { generateMetadata, pageMetadata } from "@/lib/seo";

export const metadata = generateMetadata(pageMetadata.faq);

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={generateFAQSchema(faqEntries())} />
      {children}
    </>
  );
}
