export type UpgradeType = "featured" | "esa";

export type Program = {
  id: string;
  name: string;
  city: string;
  state: string;
  category: string;
  description: string;
  contact_email: string;
  website: string | null;
  featured: boolean;
  esa_verified: boolean;
  created_at: string;
  updated_at?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  featured_since?: string | null;
  esa_verified_since?: string | null;
  featured_expiry?: string | null;
  esa_expiry?: string | null;
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
