import { US_STATES } from "@/lib/states";

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function supportEmail() {
  return process.env.SUPPORT_EMAIL || "support@christianhomeschoolshub.com";
}

export function adminInbox() {
  return (process.env.ADMIN_EMAIL || "").trim();
}

function matchState(state: string) {
  const value = state.trim().toLowerCase();
  return US_STATES.find(
    (item) =>
      item.abbreviation.toLowerCase() === value ||
      item.slug === value ||
      item.name.toLowerCase() === value,
  );
}

export function formatStateLabel(state: string) {
  const match = matchState(state);
  return match ? match.name : state.trim();
}

export function programListingUrl(state: string, id: string | number) {
  const match = matchState(state);
  const slug = match?.slug || state.trim().toLowerCase().replace(/\s+/g, "-");
  return `${siteUrl()}/${slug}/${id}`;
}
