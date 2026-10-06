import { siteConfig, absoluteUrl } from "@/lib/seo";
import { findState, programPath, US_STATES } from "@/lib/states";
import { SOCIAL_MEDIA_KEYS, type Program } from "@/lib/types";

export type BreadcrumbItem = {
  name: string;
  url: string;
};

export type FaqEntry = {
  question: string;
  answer: string;
};

function websiteHref(website: string | null | undefined) {
  if (!website?.trim()) return undefined;
  return website.startsWith("http") ? website : `https://${website}`;
}

function sameAsLinks(program: Program) {
  const links = [websiteHref(program.website)];
  for (const key of SOCIAL_MEDIA_KEYS) {
    links.push(websiteHref(program.social_media?.[key]));
  }
  return links.filter((link): link is string => Boolean(link));
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    email: siteConfig.email,
    image: siteConfig.image,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: siteConfig.email,
        availableLanguage: ["English"],
      },
    ],
  };
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateProgramSchema(program: Program) {
  const pageUrl = absoluteUrl(programPath(program.state, program.id));
  const sameAs = sameAsLinks(program);
  const stateName = findState(program.state)?.name ?? program.state;

  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: program.name,
    description: program.description,
    url: pageUrl,
    email: program.contact_email || undefined,
    telephone: program.phone || undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: program.city,
      addressRegion: program.state,
      addressCountry: "US",
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: stateName,
    },
    knowsAbout: program.category || undefined,
  };
}

export function generateFAQSchema(faqs: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateCollectionPageSchema(state: string, count: number) {
  const match = findState(state);
  const name = match?.name ?? state;
  const slug =
    match?.slug ?? name.trim().toLowerCase().replace(/\s+/g, "-");
  const url = absoluteUrl(`/${slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${name} Christian Homeschool Programs`,
    description: `Browse ${count} Christian homeschool programs, co-ops, and resources in ${name}, including owner-verified and ESA-eligible listings.`,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    about: {
      "@type": "Place",
      name,
      address: {
        "@type": "PostalAddress",
        addressRegion: match?.abbreviation ?? name,
        addressCountry: "US",
      },
    },
    numberOfItems: count,
  };
}

export function generateDirectoryCollectionSchema(programCount?: number) {
  const description =
    typeof programCount === "number"
      ? `${siteConfig.description} Currently listing ${programCount} programs across ${US_STATES.length} states.`
      : siteConfig.description;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: siteConfig.name,
    description,
    url: siteConfig.url,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    numberOfItems: US_STATES.length,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: US_STATES.length,
      itemListElement: US_STATES.map((state, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${state.name} Homeschool Programs`,
        url: absoluteUrl(`/${state.slug}`),
      })),
    },
  };
}
