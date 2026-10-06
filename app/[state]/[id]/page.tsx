import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ClaimProgramModal from "@/components/ClaimProgramModal";
import JsonLd from "@/components/JsonLd";
import OwnerBadge from "@/components/OwnerBadge";
import { EsaBadge, FeaturedBadge } from "@/components/ProgramBadges";
import { fetchProgramById } from "@/lib/programs";
import { generateBreadcrumbSchema, generateProgramSchema } from "@/lib/schema";
import { absoluteUrl, generateMetadata as buildMetadata } from "@/lib/seo";
import { findState, formatStateSlug, getStateBySlug, programPath } from "@/lib/states";
import { getServerSupabase } from "@/lib/supabase-server";
import { formatGradesServed, SOCIAL_MEDIA_KEYS, type SocialMediaLinks } from "@/lib/types";
import { isEsaActive, isFeaturedActive, UPGRADE_PLANS } from "@/lib/upgrades";
import { coerceProgramDetails } from "@/lib/validation";

const SOCIAL_LABELS: Record<(typeof SOCIAL_MEDIA_KEYS)[number], string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  twitter: "Twitter",
};

export const dynamic = "force-dynamic";

type ProgramPageProps = {
  params: { state: string; id: string };
};

function externalUrl(value: string | null | undefined) {
  const text = value?.trim();
  if (!text) return null;
  try {
    const url = new URL(text);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.href;
  } catch {
    return null;
  }
}

function socialLinks(links: SocialMediaLinks | null | undefined) {
  if (!links) return [];
  return SOCIAL_MEDIA_KEYS.flatMap((key) => {
    const href = externalUrl(links[key]);
    if (!href) return [];
    return [{ key, href, label: SOCIAL_LABELS[key] }];
  });
}

function summarize(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 160) return clean;
  return `${clean.slice(0, 159).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: ProgramPageProps): Promise<Metadata> {
  const { program } = await fetchProgramById(getServerSupabase(), params.id);
  const stateName = formatStateSlug(params.state);

  if (!program) {
    return buildMetadata({
      title: "Program not found",
      description: "This program listing could not be found.",
      path: `/${params.state}/${params.id}`,
    });
  }

  return buildMetadata({
    title: program.name,
    description: summarize(program.description || `${program.name} in ${stateName}.`),
    path: programPath(program.state, program.id),
    keywords: [
      program.name,
      program.city,
      stateName,
      program.category,
      "Christian homeschool",
      "ESA eligibility",
    ],
  });
}

export default async function ProgramPage({ params }: ProgramPageProps) {
  const { program, error } = await fetchProgramById(
    getServerSupabase(),
    params.id,
  );

  if (error || !program) {
    notFound();
  }

  const stateName = formatStateSlug(params.state);
  const known = getStateBySlug(params.state);
  const matchesState = [params.state, known?.abbreviation, known?.name]
    .filter(Boolean)
    .some((value) => value!.toLowerCase() === program.state.toLowerCase());

  if (!matchesState) {
    notFound();
  }

  const website = program.website
    ? program.website.startsWith("http")
      ? program.website
      : `https://${program.website}`
    : null;
  const details = coerceProgramDetails(program);
  const gradeText = formatGradesServed(details.grades_served);
  const formatText = details.program_format.join(", ");
  const typeText = details.program_type || "";
  const profiles = socialLinks(details.social_media);
  const hasProfile = Boolean(gradeText || formatText || typeText || profiles.length);

  const stateMatch = findState(params.state);
  const crumbPath = `/${stateMatch?.slug ?? params.state}`;

  return (
    <>
    <JsonLd data={generateProgramSchema(program)} />
    <JsonLd
      data={generateBreadcrumbSchema([
        { name: "Home", url: absoluteUrl("/") },
        { name: "States", url: absoluteUrl("/") },
        { name: stateName, url: absoluteUrl(crumbPath) },
        { name: program.name, url: absoluteUrl(programPath(program.state, program.id)) },
      ])}
    />
    <div className="space-y-8">
      <div>
        <Link
          href={`/${params.state}`}
          className="text-sm text-blue-700 hover:text-blue-900"
        >
          ← Back to {stateName}
        </Link>
        <div className="mt-4 flex flex-wrap gap-2">
          {program.owner_verified ? <OwnerBadge /> : null}
          {isFeaturedActive(program) ? <FeaturedBadge /> : null}
          {isEsaActive(program) ? <EsaBadge /> : null}
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-blue-900 sm:text-4xl">
          {program.name}
        </h1>
        <p className="mt-2 text-slate-600">
          {program.city}, {stateName} · {program.category}
        </p>
      </div>

      <section className="rounded-xl border border-blue-100 bg-white px-6 py-8 shadow-sm">
        <p className="whitespace-pre-wrap text-slate-700 leading-7">
          {program.description}
        </p>
        {hasProfile ? (
          <div className="mt-8 border-t border-blue-100 pt-6">
            <h2 className="text-lg font-semibold text-blue-900">Program details</h2>
            {gradeText || formatText || typeText ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {gradeText ? (
                  <p className="text-sm text-slate-600">
                    <span className="font-medium text-slate-500">Grades: </span>
                    <span className="font-medium text-blue-900">{gradeText}</span>
                  </p>
                ) : null}
                {formatText ? (
                  <p className="text-sm text-slate-600">
                    <span className="font-medium text-slate-500">Format: </span>
                    <span className="font-medium text-blue-900">{formatText}</span>
                  </p>
                ) : null}
                {typeText ? (
                  <p className="text-sm text-slate-600">
                    <span className="font-medium text-slate-500">Type: </span>
                    <span className="font-medium text-blue-900">{typeText}</span>
                  </p>
                ) : null}
              </div>
            ) : null}
            {profiles.length ? (
              <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {profiles.map((profile) => (
                  <a
                    key={profile.key}
                    href={profile.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-100"
                  >
                    <SocialIcon name={profile.key} />
                    {profile.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Contact email
            </dt>
            <dd className="mt-1 font-medium text-blue-900">
              {program.contact_email}
            </dd>
          </div>
          {program.phone ? (
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">
                Phone
              </dt>
              <dd className="mt-1 font-medium text-blue-900">
                <a href={`tel:${program.phone}`} className="text-blue-700 hover:underline">
                  {program.phone}
                </a>
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Website
            </dt>
            <dd className="mt-1 font-medium text-blue-900">
              {website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 hover:underline"
                >
                  {program.website}
                </a>
              ) : (
                "Not listed"
              )}
            </dd>
          </div>
        </dl>
        <a
          href={`mailto:${program.contact_email}`}
          className="mt-8 inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Contact program
        </a>
      </section>

      <section className="rounded-xl border border-blue-100 bg-white px-6 py-6 shadow-sm">
        <h2 className="text-lg font-semibold text-blue-900">Program owner</h2>
        {program.owner_verified ? (
          <p className="mt-2 text-sm text-slate-600">
            This listing is verified by its owner.{" "}
            <Link href="/owner/login" className="font-medium text-blue-700 hover:text-blue-900">
              Sign in to edit
            </Link>
          </p>
        ) : (
          <div className="mt-2 space-y-4">
            <p className="text-sm text-slate-600">
              Claim this listing with the contact email on file. You&apos;ll get a verified badge
              and can update the public details.
            </p>
            <ClaimProgramModal programId={String(program.id)} programName={program.name} />
          </div>
        )}
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50/70 px-6 py-6">
        <h2 className="text-lg font-semibold text-blue-900">
          Program owner upgrades
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Increase visibility with a monthly featured listing or ESA badge.
        </p>
        {program.featured === false || program.esa_verified === false ? (
          <div className="mt-4 flex flex-wrap gap-3">
            {program.featured === false && (
              <Link
                href={`/${params.state}/${params.id}/upgrade`}
                className="inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Upgrade to Featured · {UPGRADE_PLANS.featured.priceLabel}
              </Link>
            )}
            {program.esa_verified === false && (
              <Link
                href={`/${params.state}/${params.id}/upgrade`}
                className="inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Get ESA Badge · {UPGRADE_PLANS.esa.priceLabel}
              </Link>
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm font-medium text-emerald-800">
            All upgrades active
          </p>
        )}
      </section>
    </div>
    </>
  );
}

function SocialIcon({ name }: { name: (typeof SOCIAL_MEDIA_KEYS)[number] }) {
  const className = "h-4 w-4 shrink-0";
  if (name === "facebook") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
        <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.95.93-1.95 1.89v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07z" />
      </svg>
    );
  }
  if (name === "instagram") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
        <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.69 21.31.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
      </svg>
    );
  }
  if (name === "youtube") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
        <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.38.46A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14C4.5 20.4 12 20.4 12 20.4s7.5 0 9.38-.46a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.75 15.57V8.43L15.84 12l-6.09 3.57z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.66l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.01 4.13H5.04l12.04 15.64z" />
    </svg>
  );
}
