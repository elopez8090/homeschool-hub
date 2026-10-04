import { US_STATES } from "@/lib/states";
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

export const CONTACT_CATEGORIES = [
  "General Inquiry",
  "Program Submission Issue",
  "Bug Report",
  "Other",
] as const;

export type ContactCategory = (typeof CONTACT_CATEGORIES)[number];

export type ContactFieldErrors = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  category?: string;
};

export type ContactInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: ContactCategory | null;
};

const CONTACT_NAME_MAX = 120;
const CONTACT_SUBJECT_MAX = 200;
const CONTACT_MESSAGE_MAX = 5000;

export function validateContact(body: Partial<ContactInput>) {
  const errors: string[] = [];
  const fieldErrors: ContactFieldErrors = {};
  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const subject = (body.subject || "").trim();
  const message = (body.message || "").trim();
  const category = (body.category || "").trim();

  if (!name) {
    fieldErrors.name = "Name is required.";
  } else if (name.length > CONTACT_NAME_MAX) {
    fieldErrors.name = `Name must be ${CONTACT_NAME_MAX} characters or fewer.`;
  }

  if (!email) {
    fieldErrors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (!subject) {
    fieldErrors.subject = "Subject is required.";
  } else if (subject.length > CONTACT_SUBJECT_MAX) {
    fieldErrors.subject = `Subject must be ${CONTACT_SUBJECT_MAX} characters or fewer.`;
  }

  if (!message) {
    fieldErrors.message = "Message is required.";
  } else if (message.length > CONTACT_MESSAGE_MAX) {
    fieldErrors.message = `Message must be ${CONTACT_MESSAGE_MAX} characters or fewer.`;
  }

  let parsedCategory: ContactCategory | null = null;
  if (category) {
    if (!CONTACT_CATEGORIES.includes(category as ContactCategory)) {
      fieldErrors.category = "Choose a valid category.";
    } else {
      parsedCategory = category as ContactCategory;
    }
  }

  for (const messageText of Object.values(fieldErrors)) {
    if (messageText) errors.push(messageText);
  }

  return {
    errors,
    fieldErrors,
    data: {
      name,
      email,
      subject,
      message,
      category: parsedCategory,
    } satisfies ContactInput,
  };
}

export const PROGRAM_SUBMISSION_CATEGORIES = [
  "Online",
  "In-Person",
  "Hybrid",
  "Tutoring",
  "Co-op",
  "Summer Camp",
  "Enrichment",
  "Other",
] as const;

export type ProgramSubmissionCategory = (typeof PROGRAM_SUBMISSION_CATEGORIES)[number];

const SUBMISSION_DESCRIPTION_MAX = 500;
const SUBMISSION_NAME_MAX = 200;
const SUBMISSION_CITY_MAX = 100;
const PHONE_PATTERN = /^(?:\+?1[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/;

export type ProgramSubmissionFieldErrors = {
  name?: string;
  description?: string;
  city?: string;
  state?: string;
  category?: string;
  contactEmail?: string;
  phone?: string;
  website?: string;
  certified?: string;
};

export type ProgramSubmissionInput = {
  name: string;
  description: string;
  city: string;
  state: string;
  category: ProgramSubmissionCategory;
  contact_email: string;
  phone: string | null;
  website: string | null;
};

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidWebsite(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateProgramSubmission(body: Record<string, unknown>) {
  const errors: string[] = [];
  const fieldErrors: ProgramSubmissionFieldErrors = {};
  const name = asTrimmedString(body.name);
  const description = asTrimmedString(body.description);
  const city = asTrimmedString(body.city);
  const stateInput = asTrimmedString(body.state);
  const category = asTrimmedString(body.category);
  const contact_email = (
    asTrimmedString(body.contact_email) || asTrimmedString(body.contactEmail)
  ).toLowerCase();
  const phone = asTrimmedString(body.phone);
  const website = asTrimmedString(body.website);

  if (!name) {
    fieldErrors.name = "Program name is required.";
  } else if (name.length > SUBMISSION_NAME_MAX) {
    fieldErrors.name = `Program name must be ${SUBMISSION_NAME_MAX} characters or fewer.`;
  }

  if (!description) {
    fieldErrors.description = "Description is required.";
  } else if (description.length > SUBMISSION_DESCRIPTION_MAX) {
    fieldErrors.description = `Description must be ${SUBMISSION_DESCRIPTION_MAX} characters or fewer.`;
  }

  if (!city) {
    fieldErrors.city = "City is required.";
  } else if (city.length > SUBMISSION_CITY_MAX) {
    fieldErrors.city = `City must be ${SUBMISSION_CITY_MAX} characters or fewer.`;
  }

  const matchedState = US_STATES.find(
    (item) =>
      item.abbreviation.toLowerCase() === stateInput.toLowerCase() ||
      item.name.toLowerCase() === stateInput.toLowerCase(),
  );
  if (!stateInput) {
    fieldErrors.state = "State is required.";
  } else if (!matchedState) {
    fieldErrors.state = "Choose a U.S. state.";
  }

  if (!category) {
    fieldErrors.category = "Category is required.";
  } else if (
    !PROGRAM_SUBMISSION_CATEGORIES.includes(category as ProgramSubmissionCategory)
  ) {
    fieldErrors.category = "Choose a valid category.";
  }

  if (!contact_email) {
    fieldErrors.contactEmail = "Contact email is required.";
  } else if (!EMAIL_PATTERN.test(contact_email)) {
    fieldErrors.contactEmail = "Enter a valid email address.";
  }

  if (phone && !PHONE_PATTERN.test(phone)) {
    fieldErrors.phone = "Enter a phone number like (555) 123-4567.";
  }

  if (website && !isValidWebsite(website)) {
    fieldErrors.website = "Enter a full website address starting with https://.";
  }

  if (body.certified !== true) {
    fieldErrors.certified = "Please certify that this information is accurate.";
  }

  for (const messageText of Object.values(fieldErrors)) {
    if (messageText) errors.push(messageText);
  }

  return {
    errors,
    fieldErrors,
    data: {
      name,
      description,
      city,
      state: matchedState?.abbreviation ?? stateInput.toUpperCase(),
      category: category as ProgramSubmissionCategory,
      contact_email,
      phone: phone || null,
      website: website || null,
    } satisfies ProgramSubmissionInput,
  };
}

export const OWNER_DESCRIPTION_MAX = 500;

const OWNER_CATEGORIES = new Set<string>([
  ...PROGRAM_SUBMISSION_CATEGORIES,
  ...PROGRAM_CATEGORIES,
]);

export type OwnerProgramFieldErrors = {
  name?: string;
  description?: string;
  city?: string;
  state?: string;
  category?: string;
  contact_email?: string;
  phone?: string;
  website?: string;
};

export type OwnerProgramUpdate = {
  name: string;
  description: string;
  city: string;
  state: string;
  category: string;
  contact_email: string;
  phone: string | null;
  website: string | null;
};

export function validateOwnerProgramUpdate(body: Record<string, unknown> | Partial<OwnerProgramUpdate>) {
  const errors: string[] = [];
  const fieldErrors: OwnerProgramFieldErrors = {};
  const source = body as Record<string, unknown>;
  const name = asTrimmedString(source.name);
  const description = asTrimmedString(source.description);
  const city = asTrimmedString(source.city);
  const stateInput = asTrimmedString(source.state);
  const category = asTrimmedString(source.category);
  const contact_email = asTrimmedString(source.contact_email).toLowerCase();
  const phone = asTrimmedString(source.phone);
  const website = asTrimmedString(source.website);

  if (!name) {
    fieldErrors.name = "Program name is required.";
  } else if (name.length > SUBMISSION_NAME_MAX) {
    fieldErrors.name = `Program name must be ${SUBMISSION_NAME_MAX} characters or fewer.`;
  }

  if (!description) {
    fieldErrors.description = "Description is required.";
  } else if (description.length > OWNER_DESCRIPTION_MAX) {
    fieldErrors.description = `Description must be ${OWNER_DESCRIPTION_MAX} characters or fewer.`;
  }

  if (!city) {
    fieldErrors.city = "City is required.";
  } else if (city.length > SUBMISSION_CITY_MAX) {
    fieldErrors.city = `City must be ${SUBMISSION_CITY_MAX} characters or fewer.`;
  }

  const matchedState = US_STATES.find(
    (item) =>
      item.abbreviation.toLowerCase() === stateInput.toLowerCase() ||
      item.name.toLowerCase() === stateInput.toLowerCase() ||
      item.slug === stateInput.toLowerCase(),
  );
  if (!stateInput) {
    fieldErrors.state = "State is required.";
  } else if (!matchedState) {
    fieldErrors.state = "Choose a U.S. state.";
  }

  if (!category) {
    fieldErrors.category = "Category is required.";
  } else if (!OWNER_CATEGORIES.has(category)) {
    fieldErrors.category = "Choose a valid category.";
  }

  if (!contact_email) {
    fieldErrors.contact_email = "Contact email is required.";
  } else if (!EMAIL_PATTERN.test(contact_email)) {
    fieldErrors.contact_email = "Enter a valid email address.";
  }

  if (phone && !PHONE_PATTERN.test(phone)) {
    fieldErrors.phone = "Enter a phone number like (555) 123-4567.";
  }

  if (website && !isValidWebsite(website)) {
    fieldErrors.website = "Enter a full website address starting with https://.";
  }

  for (const messageText of Object.values(fieldErrors)) {
    if (messageText) errors.push(messageText);
  }

  return {
    errors,
    fieldErrors,
    data: {
      name,
      description,
      city,
      state: matchedState?.abbreviation ?? stateInput.toUpperCase(),
      category,
      contact_email,
      phone: phone || null,
      website: website || null,
    } satisfies OwnerProgramUpdate,
  };
}
