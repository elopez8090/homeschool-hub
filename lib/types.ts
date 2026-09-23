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
