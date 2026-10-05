import type { Metadata } from "next";

const PRODUCTION_URL = "https://www.christianhomeschoolshub.com";

function resolveSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  return configured || PRODUCTION_URL;
}

const siteUrl = resolveSiteUrl();

export const siteConfig = {
  name: "Christian Homeschools Hub",
  description:
    "Find Christ-centered homeschool programs, co-ops, and resources by state. Browse owner-verified listings and ESA eligibility in one directory.",
  url: siteUrl,
  image: `${siteUrl}/opengraph-image.png`,
  twitterHandle: "@christianhomeschoolshub",
  email: process.env.SUPPORT_EMAIL || "support@christianhomeschoolshub.com",
  themeColor: "#1e3a8a",
  locale: "en_US",
} as const;

export type PageSeo = {
  title: string;
  description: string;
  path: string;
  keywords?: readonly string[];
};

const sharedKeywords = [
  "Christian homeschool",
  "homeschool directory",
  "homeschool co-op",
  "ESA eligibility",
  "owner verified programs",
] as const;

export const pageMetadata = {
  home: {
    title: "Christian Homeschools Hub",
    description: siteConfig.description,
    path: "/",
    keywords: [
      ...sharedKeywords,
      "homeschool programs by state",
      "Christian homeschool resources",
    ],
  },
  about: {
    title: "About",
    description:
      "Christian Homeschools Hub is a free directory that helps families find Christ-centered homeschool programs by location, with owner verification and ESA eligibility.",
    path: "/about",
    keywords: [
      ...sharedKeywords,
      "about Christian Homeschools Hub",
      "homeschool community directory",
    ],
  },
  "how-it-works": {
    title: "How It Works",
    description:
      "See how families find programs, how owners claim and verify a listing, and how to submit a new program. Free to browse, with owner verification families can trust.",
    path: "/how-it-works",
    keywords: [
      ...sharedKeywords,
      "claim a homeschool listing",
      "submit a homeschool program",
    ],
  },
  faq: {
    title: "FAQ",
    description:
      "Answers about browsing Christian Homeschools Hub, claiming a program, owner verification, ESA listings, and submitting a new program.",
    path: "/faq",
    keywords: [
      ...sharedKeywords,
      "homeschool directory FAQ",
      "claim program verification",
    ],
  },
  contact: {
    title: "Contact",
    description:
      "Contact Christian Homeschools Hub with questions about listings, submissions, or the directory. We typically respond within 24–48 hours.",
    path: "/contact",
    keywords: [
      "contact Christian Homeschools Hub",
      "homeschool directory support",
      siteConfig.email,
    ],
  },
  submit: {
    title: "Submit Your Program",
    description:
      "Add your homeschool program to the free Christian Homeschools Hub directory. Listings are reviewed before they are published.",
    path: "/submit",
    keywords: [
      ...sharedKeywords,
      "submit homeschool program",
      "list a Christian co-op",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    description:
      "How Christian Homeschools Hub collects, uses, and protects information when you browse the directory, submit a program, or contact support.",
    path: "/privacy",
    keywords: ["privacy policy", "Christian Homeschools Hub privacy", "data protection"],
  },
  terms: {
    title: "Terms of Service",
    description:
      "Terms of service for using Christian Homeschools Hub, including program submissions, listing claims, and use of the directory.",
    path: "/terms",
    keywords: ["terms of service", "Christian Homeschools Hub terms", "directory terms"],
  },
} as const satisfies Record<string, PageSeo>;

export function absoluteUrl(path: string) {
  if (path === "/" || path === "") return siteConfig.url;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalized}`;
}

function documentTitle(title: string) {
  if (title === siteConfig.name || title.includes(`| ${siteConfig.name}`)) {
    return title;
  }
  return `${title} | ${siteConfig.name}`;
}

export function generateMetadata(page: PageSeo): Metadata {
  const title = documentTitle(page.title);
  const canonical = absoluteUrl(page.path);
  const image = {
    url: siteConfig.image,
    width: 1200,
    height: 630,
    alt: `${siteConfig.name} social preview`,
  };

  return {
    title: { absolute: title },
    description: page.description,
    keywords: page.keywords ? [...page.keywords] : undefined,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category: "education",
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title,
      description: page.description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitterHandle,
      creator: siteConfig.twitterHandle,
      title,
      description: page.description,
      images: [siteConfig.image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}
