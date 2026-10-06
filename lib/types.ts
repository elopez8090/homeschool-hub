export type UpgradeType = "featured" | "esa";

export const GRADE_LEVELS = ["K", "1-3", "4-6", "7-8", "9-12", "mixed"] as const;

export type GradeLevel = (typeof GRADE_LEVELS)[number];

export const GRADE_LEVEL_LABELS: Record<GradeLevel, string> = {
  K: "K",
  "1-3": "1-3",
  "4-6": "4-6",
  "7-8": "7-8",
  "9-12": "9-12",
  mixed: "Mixed",
};

export const PROGRAM_FORMATS = ["Online", "Hybrid", "In-Person"] as const;

export type ProgramFormat = (typeof PROGRAM_FORMATS)[number];

export const PROGRAM_TYPES = [
  "Full Curriculum",
  "Co-op",
  "Tutoring",
  "Enrichment",
] as const;

export type ProgramType = (typeof PROGRAM_TYPES)[number];

export const SOCIAL_MEDIA_KEYS = ["facebook", "instagram", "youtube", "twitter"] as const;

export type SocialMediaKey = (typeof SOCIAL_MEDIA_KEYS)[number];

export type SocialMediaLinks = Record<SocialMediaKey, string | null>;

export function formatGradesServed(values: readonly string[] | null | undefined) {
  if (!Array.isArray(values) || !values.length) return "";
  return values
    .map((value) => {
      const match = GRADE_LEVELS.find(
        (grade) => grade.toLowerCase() === value.trim().toLowerCase(),
      );
      return match ? GRADE_LEVEL_LABELS[match] : value.trim();
    })
    .filter(Boolean)
    .join(", ");
}

export type Program = {
  id: string;
  name: string;
  city: string;
  state: string;
  category: string;
  description: string;
  contact_email: string;
  phone?: string | null;
  website: string | null;
  featured: boolean;
  esa_verified: boolean;
  claimed_by?: string | null;
  claimed_at?: string | null;
  owner_verified?: boolean;
  created_at: string;
  updated_at?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  featured_since?: string | null;
  esa_verified_since?: string | null;
  featured_expiry?: string | null;
  esa_expiry?: string | null;
  grades_served?: GradeLevel[] | null;
  program_format?: ProgramFormat[] | null;
  program_type?: ProgramType | null;
  social_media?: SocialMediaLinks | null;
};

export type Subscription = {
  id: string;
  program_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  stripe_checkout_session_id: string | null;
  type: UpgradeType;
  status: string;
  created_at: string;
  expires_at: string | null;
};

export type PendingSubmission = {
  id: string;
  name: string;
  city: string;
  state: string;
  category: string;
  description: string | null;
  contact_email: string;
  website: string | null;
  accepts_esa: boolean | null;
  status: string;
  submitted_at: string;
};

export const PROGRAM_CATEGORIES = [
  "Co-op",
  "Microschool",
  "Tutoring",
  "Academy",
  "Other",
] as const;

export type ProgramCategory = (typeof PROGRAM_CATEGORIES)[number];
