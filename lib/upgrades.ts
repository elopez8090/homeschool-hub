import type { Program, UpgradeType } from "@/lib/types";

export const UPGRADE_PLANS = {
  featured: {
    type: "featured" as const,
    name: "Featured Listing",
    priceCents: 19900,
    priceLabel: "$199/month",
    tagline: "Appear at the top of search results",
    includes: [
      "Pinned at the top of your state's directory",
      "Green Featured badge on your listing",
      "Higher visibility to families browsing programs",
      "Renews automatically each month",
    ],
  },
  esa: {
    type: "esa" as const,
    name: "ESA Badge",
    priceCents: 4900,
    priceLabel: "$49/month",
    tagline: "Show an “ESA Approved” badge on your listing",
    includes: [
      "Green ESA Approved checkmark on your listing",
      "Included when families filter for ESA programs",
      "Signals that your program accepts ESA funds",
      "Renews automatically each month",
    ],
  },
} as const;

export function isUpgradeType(value: string): value is UpgradeType {
  return value === "featured" || value === "esa";
}

export function isFeaturedActive(program: Program, now = Date.now()) {
  if (!program.featured) return false;
  if (!program.featured_expiry) return true;
  return new Date(program.featured_expiry).getTime() > now;
}

export function isEsaActive(program: Program, now = Date.now()) {
  if (!program.esa_verified) return false;
  if (!program.esa_expiry) return true;
  return new Date(program.esa_expiry).getTime() > now;
}

export function addDays(days: number, from = new Date()) {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  return date;
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export function programPath(stateSlug: string, programId: string) {
  return `/${stateSlug}/${programId}`;
}

export function upgradePath(stateSlug: string, programId: string) {
  return `${programPath(stateSlug, programId)}/upgrade`;
}

export function formatBillingDate(isoOrUnix?: string | number | null) {
  if (!isoOrUnix) return null;
  const date =
    typeof isoOrUnix === "number"
      ? new Date(isoOrUnix * 1000)
      : new Date(isoOrUnix);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
