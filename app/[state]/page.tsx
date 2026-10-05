import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import StateProgramBrowser from "./state-program-browser";
import { countProgramsByState } from "@/lib/programs";
import {
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
} from "@/lib/schema";
import { absoluteUrl, generateMetadata as buildMetadata, siteConfig } from "@/lib/seo";
import { findState, formatStateSlug } from "@/lib/states";
import { getServerSupabase } from "@/lib/supabase-server";

type StatePageProps = {
  params: { state: string };
};

export const revalidate = 3600;

function stateLabel(slug: string) {
  const decoded = decodeURIComponent(slug);
  return findState(decoded)?.name ?? formatStateSlug(decoded);
}

function stateCode(slug: string) {
  const decoded = decodeURIComponent(slug);
  return findState(decoded)?.abbreviation ?? decoded;
}

export async function generateMetadata({
  params,
}: StatePageProps): Promise<Metadata> {
  const name = stateLabel(params.state);
  const match = findState(decodeURIComponent(params.state));
  const path = `/${match?.slug ?? params.state}`;

  return buildMetadata({
    title: `${name} Homeschool Programs`,
    description: `Browse Christian homeschool programs, co-ops, and resources in ${name}. Filter by category, owner verification, and ESA eligibility.`,
    path,
    keywords: [
      `${name} homeschool`,
      `${name} Christian homeschool`,
      `${name} homeschool co-op`,
      "ESA eligibility",
      "owner verified programs",
    ],
  });
}

export default async function StatePage({ params }: StatePageProps) {
  const name = stateLabel(params.state);
  const match = findState(decodeURIComponent(params.state));
  const path = `/${match?.slug ?? params.state}`;
  let count = 0;

  try {
    count = await countProgramsByState(getServerSupabase(), stateCode(params.state));
  } catch {
    count = 0;
  }

  return (
    <>
      <JsonLd data={generateCollectionPageSchema(name, count)} />
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: "Home", url: siteConfig.url },
          { name: "States", url: siteConfig.url },
          { name, url: absoluteUrl(path) },
        ])}
      />
      <StateProgramBrowser />
    </>
  );
}
