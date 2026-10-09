import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { programPath, US_STATES } from "@/lib/states";
import { getServerSupabase } from "@/lib/supabase-server";

const STATIC_PATHS = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/how-it-works", priority: 0.6, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/submit", priority: 0.7, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
] as const;

type ProgramRow = {
  id: string;
  state: string;
  updated_at: string | null;
  created_at: string | null;
};

async function fetchProgramRows() {
  const rows: ProgramRow[] = [];
  const pageSize = 1000;
  let from = 0;

  try {
    const client = getServerSupabase();

    while (true) {
      const { data, error } = await client
        .from("programs")
        .select("id, state, updated_at, created_at")
        .range(from, from + pageSize - 1);

      if (error || !data?.length) break;

      rows.push(...(data as ProgramRow[]));
      if (data.length < pageSize) break;
      from += pageSize;
    }
  } catch {
    return rows;
  }

  return rows;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const programs = await fetchProgramRows();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  const stateEntries: MetadataRoute.Sitemap = US_STATES.map((state) => ({
    url: absoluteUrl(`/${state.slug}`),
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const programEntries: MetadataRoute.Sitemap = programs.map((program) => ({
    url: `${siteConfig.url}${programPath(program.state, program.id)}`,
    lastModified: new Date(program.updated_at || program.created_at || now.toISOString()),
    priority: 0.6,
  }));

  return [...staticEntries, ...stateEntries, ...programEntries];
}
