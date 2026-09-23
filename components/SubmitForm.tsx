"use client";

import { useMemo, useState } from "react";
import { FLORIDA_CITIES } from "@/lib/cities";
import { PROGRAM_CATEGORIES } from "@/lib/types";

const DESCRIPTION_MAX = 1000;

export default function SubmitForm({
  stateSlug,
  stateName,
}: {
  stateSlug: string;
  stateName: string;
}) {
  const [name, setName] = useState("");
  const [cityChoice, setCityChoice] = useState("");
  const [cityOther, setCityOther] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [acceptsEsa, setAcceptsEsa] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isFlorida = stateSlug === "florida";
  const city = cityChoice === "Other" || !isFlorida ? cityOther.trim() : cityChoice;
  const remaining = DESCRIPTION_MAX - description.length;

  const canSubmit = useMemo(
    () =>
      Boolean(name.trim() && city && category && description.trim() && contactEmail.trim()),
    [name, city, category, description, contactEmail],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);

    try {
      const response = await fetch("/api/submissions", {
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
          accepts_esa: acceptsEsa,
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
      setAcceptsEsa(false);
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
      </label>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-blue-900">
          City <span className="text-red-600">*</span>
        </span>
        {isFlorida ? (
          <div className="space-y-3">
            <select
              required
              value={cityChoice}
              onChange={(event) => setCityChoice(event.target.value)}
              className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm outline-none ring-blue-300 focus:ring-2"
            >
              <option value="">Select a Florida city</option>
              {FLORIDA_CITIES.map((item) => (
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
                placeholder="Enter city"
                className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none ring-blue-300 focus:ring-2"
              />
            ) : null}
          </div>
        ) : (
          <input
            required
            value={cityOther}
            onChange={(event) => setCityOther(event.target.value)}
            placeholder={`City in ${stateName}`}
            className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none ring-blue-300 focus:ring-2"
          />
        )}
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
          {remaining} characters remaining
        </span>
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
      </label>

      <label className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
        <span className="text-sm font-medium text-blue-900">Accept ESA funds?</span>
        <button
          type="button"
          role="switch"
          aria-checked={acceptsEsa}
          onClick={() => setAcceptsEsa((current) => !current)}
          className={`relative h-7 w-12 rounded-full transition ${
            acceptsEsa ? "bg-green-600" : "bg-slate-300"
          }`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
              acceptsEsa ? "left-5" : "left-0.5"
            }`}
          />
        </button>
      </label>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Thank you. Your program was submitted and is pending review.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting || !canSubmit}
        className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {submitting ? "Submitting..." : "Submit program"}
      </button>
    </form>
  );
}
