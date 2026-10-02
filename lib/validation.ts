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

const OWNER_DESCRIPTION_MAX = 2000;

export type OwnerProgramUpdate = {
  name: string;
  city: string;
  category: string;
  description: string;
  contact_email: string;
  phone: string | null;
  website: string | null;
};

export function validateOwnerProgramUpdate(body: Partial<OwnerProgramUpdate>) {
  const errors: string[] = [];
  const name = (body.name || "").trim();
  const city = (body.city || "").trim();
  const category = (body.category || "").trim();
  const description = (body.description || "").trim();
  const contact_email = (body.contact_email || "").trim().toLowerCase();
  const phone = (body.phone || "").trim();
  const website = (body.website || "").trim();

  if (!name) errors.push("Program name is required.");
  else if (name.length > 200) errors.push("Program name must be 200 characters or fewer.");
  if (!city) errors.push("City is required.");
  else if (city.length > 100) errors.push("City must be 100 characters or fewer.");
  if (!category) errors.push("Category is required.");
  else if (category.length > 80) errors.push("Category must be 80 characters or fewer.");
  if (!description) errors.push("Description is required.");
  else if (description.length > OWNER_DESCRIPTION_MAX) {
    errors.push(`Description must be ${OWNER_DESCRIPTION_MAX} characters or fewer.`);
  }
  if (!contact_email) errors.push("Contact email is required.");
  else if (!EMAIL_PATTERN.test(contact_email)) {
    errors.push("Contact email is not valid.");
  }
  if (phone.length > 30) errors.push("Phone must be 30 characters or fewer.");
  if (website && !/^https?:\/\//i.test(website)) {
    errors.push("Website must start with http:// or https://.");
  }

  return {
    errors,
    data: {
      name,
      city,
      category,
      description,
      contact_email,
      phone: phone || null,
      website: website || null,
    } satisfies OwnerProgramUpdate,
  };
}
