import { PROGRAM_CATEGORIES } from "@/lib/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DESCRIPTION_MAX = 1000;

export type SubmissionInput = {
  name: string;
  city: string;
  state: string;
  category: string;
  description: string;
  contact_email: string;
  website?: string;
  accepts_esa?: boolean;
};

export function validateSubmission(body: Partial<SubmissionInput>) {
  const errors: string[] = [];
  const name = (body.name || "").trim();
  const city = (body.city || "").trim();
  const state = (body.state || "").trim().toLowerCase();
  const category = (body.category || "").trim();
  const description = (body.description || "").trim();
  const contact_email = (body.contact_email || "").trim().toLowerCase();
  const website = (body.website || "").trim();

  if (!name) errors.push("Program name is required.");
  if (!city) errors.push("City is required.");
  if (!state) errors.push("State is required.");
  if (!category) errors.push("Category is required.");
  else if (!PROGRAM_CATEGORIES.includes(category as (typeof PROGRAM_CATEGORIES)[number])) {
    errors.push("Category is not valid.");
  }
  if (!description) errors.push("Description is required.");
  else if (description.length > DESCRIPTION_MAX) {
    errors.push(`Description must be ${DESCRIPTION_MAX} characters or fewer.`);
  }
  if (!contact_email) errors.push("Contact email is required.");
  else if (!EMAIL_PATTERN.test(contact_email)) {
    errors.push("Contact email is not valid.");
  }
  if (website && !/^https?:\/\//i.test(website)) {
    errors.push("Website must start with http:// or https://.");
  }

  return {
    errors,
    data: {
      name,
      city,
      state,
      category,
      description,
      contact_email,
      website: website || null,
      accepts_esa: Boolean(body.accepts_esa),
    },
  };
}
