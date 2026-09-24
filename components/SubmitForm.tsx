"use client";

import { useMemo, useState } from "react";
import { getCitiesForState } from "@/lib/cities";
import { PROGRAM_CATEGORIES } from "@/lib/types";

const DESCRIPTION_MAX = 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = {
  name?: string;
  city?: string;
  category?: string;
  description?: string;
  contactEmail?: string;
  website?: string;
};

export default function SubmitForm({
  stateSlug,
  stateName,
}: {
  stateSlug: string;
  stateName: string;
}) {
  const cities = useMemo(() => getCitiesForState(stateSlug), [stateSlug]);
  const [name, setName] = useState("");
  const [cityChoice, setCityChoice] = useState("");
  const [cityOther, setCityOther] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [acceptsEsa, setAcceptsEsa] = useState<"yes" | "no" | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const city = cityChoice === "Other" ? cityOther.trim() : cityChoice;

  function validateFields() {
    const nextErrors: FieldErrors = {};
    if (!name.trim()) nextErrors.name = "Program name is required.";
    if (!city) nextErrors.city = "City is required.";
    if (!category) nextErrors.category = "Category is required.";
    if (!description.trim()) nextErrors.description = "Description is required.";
    else if (description.length > DESCRIPTION_MAX) {
      nextErrors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer.`;
    }
    if (!contactEmail.trim()) nextErrors.contactEmail = "Contact email is required.";
    else if (!EMAIL_PATTERN.test(contactEmail.trim())) {
      nextErrors.contactEmail = "Enter a valid email address.";
    }
    if (website.trim() && !/^https?:\/\//i.test(website.trim())) {
      nextErrors.website = "Website must start with http:// or https://.";
    }
    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);

    const nextErrors = validateFields();
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setError("Please fix the highlighted fields and try again.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          city,
          state: stateSlug,
          category,
          description,
          contact_email: contactEmail,
          website,
          accepts_esa: acceptsEsa === "yes",
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to submit this program.");
      }

      setSuccess(true);
      setName("");
      setCityChoice("");
      setCityOther("");
      setCategory("");
      setDescription("");
      setContactEmail("");
      setWebsite("");
      setAcceptsEsa("");
      setFieldErrors({});
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit this program.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-blue-100 bg-white p-5 shadow-sm sm:p-8"
      noValidate
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-blue-900">
          Program name <span className="text-red-600">*</span>
        </span>
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none ring-blue-300 focus:ring-2"
        />
        {fieldErrors.name ? (
          <span className="mt-1 block text-xs text-red-600">{fieldErrors.name}</span>
        ) : null}
      </label>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-blue-900">
          City <span className="text-red-600">*</span>
        </span>
        <div className="space-y-3">
          <select
            required
            value={cityChoice}
            onChange={(event) => setCityChoice(event.target.value)}
            className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm outline-none ring-blue-300 focus:ring-2"
          >
            <option value="">Select a city in {stateName}</option>
            {cities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
          {cityChoice === "Other" ? (
            <input
              required
              value={cityOther}
              onChange={(event) => setCityOther(event.target.value)}
              placeholder={`City in ${stateName}`}
              className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none ring-blue-300 focus:ring-2"
            />
          ) : null}
        </div>
        {fieldErrors.city ? (
          <span className="mt-1 block text-xs text-red-600">{fieldErrors.city}</span>
        ) : null}
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-blue-900">
          Category <span className="text-red-600">*</span>
        </span>
        <select
          required
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm outline-none ring-blue-300 focus:ring-2"
        >
          <option value="">Select a category</option>
          {PROGRAM_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        {fieldErrors.category ? (
          <span className="mt-1 block text-xs text-red-600">{fieldErrors.category}</span>
        ) : null}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-blue-900">
          Description <span className="text-red-600">*</span>
        </span>
        <textarea
          required
          maxLength={DESCRIPTION_MAX}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={6}
          className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none ring-blue-300 focus:ring-2"
        />
        <span className="mt-1 block text-xs text-slate-500">
          {description.length}/{DESCRIPTION_MAX} characters
        </span>
        {fieldErrors.description ? (
          <span className="mt-1 block text-xs text-red-600">{fieldErrors.description}</span>
        ) : null}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-blue-900">
          Contact email <span className="text-red-600">*</span>
        </span>
        <input
          required
          type="email"
          value={contactEmail}
          onChange={(event) => setContactEmail(event.target.value)}
          className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none ring-blue-300 focus:ring-2"
        />
        {fieldErrors.contactEmail ? (
          <span className="mt-1 block text-xs text-red-600">{fieldErrors.contactEmail}</span>
        ) : null}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-blue-900">
          Website
        </span>
        <input
          type="url"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          placeholder="https://"
          className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none ring-blue-300 focus:ring-2"
        />
        {fieldErrors.website ? (
          <span className="mt-1 block text-xs text-red-600">{fieldErrors.website}</span>
        ) : null}
      </label>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-blue-900">
          Accept ESA funds?
        </legend>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="accepts_esa"
              value="yes"
              checked={acceptsEsa === "yes"}
              onChange={() => setAcceptsEsa("yes")}
            />
            Yes
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="accepts_esa"
              value="no"
              checked={acceptsEsa === "no"}
              onChange={() => setAcceptsEsa("no")}
            />
            No
          </label>
        </div>
      </fieldset>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Thank you! Your program has been submitted for review. We&apos;ll contact you within 48 hours.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
