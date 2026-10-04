"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { US_STATES } from "@/lib/states";
import {
  PROGRAM_SUBMISSION_CATEGORIES,
  validateProgramSubmission,
  type ProgramSubmissionFieldErrors,
} from "@/lib/validation";

const DESCRIPTION_MAX = 500;

const INPUT_CLASS =
  "min-h-11 w-full rounded-lg border border-blue-200 bg-white px-3 py-2.5 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200";

const EMPTY_FORM = {
  name: "",
  description: "",
  city: "",
  state: "",
  category: "",
  contactEmail: "",
  phone: "",
  website: "",
  certified: false,
};

type FormState = typeof EMPTY_FORM;

type SubmittedProgram = {
  name: string;
  description: string;
  city: string;
  stateName: string;
  category: string;
  contactEmail: string;
  phone: string;
  website: string;
};

function stateNameFor(abbreviation: string) {
  return US_STATES.find((item) => item.abbreviation === abbreviation)?.name ?? abbreviation;
}

export default function SubmitProgramPage() {
  const nameRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<ProgramSubmissionFieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<SubmittedProgram | null>(null);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    const errorKey = field === "contactEmail" ? "contactEmail" : field;
    setFieldErrors((current) => ({ ...current, [errorKey]: undefined }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setFormError("");
    setSubmitted(null);
    window.requestAnimationFrame(() => nameRef.current?.focus());
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const { errors, fieldErrors: nextErrors, data } = validateProgramSubmission({
      name: form.name,
      description: form.description,
      city: form.city,
      state: form.state,
      category: form.category,
      contact_email: form.contactEmail,
      phone: form.phone,
      website: form.website,
      certified: form.certified,
    });

    setFieldErrors(nextErrors);
    if (errors.length > 0) {
      setFormError("Please fix the highlighted fields and try again.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          city: data.city,
          state: data.state,
          category: data.category,
          contact_email: data.contact_email,
          phone: data.phone,
          website: data.website,
          certified: true,
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        message?: string;
        fieldErrors?: ProgramSubmissionFieldErrors;
      };

      if (!response.ok) {
        if (payload.fieldErrors) setFieldErrors(payload.fieldErrors);
        throw new Error(payload.error || payload.message || "Unable to submit this program.");
      }

      setSubmitted({
        name: data.name,
        description: data.description,
        city: data.city,
        stateName: stateNameFor(data.state),
        category: data.category,
        contactEmail: data.contact_email,
        phone: data.phone ?? "",
        website: data.website ?? "",
      });
      setFieldErrors({});
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit this program.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex-1">
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-200">
            Free directory
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-balance sm:text-5xl">
            Submit Your Program
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Add your homeschool program to our free directory
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5 lg:gap-10">
          <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8 lg:col-span-3">
            {submitted ? (
                <div role="status" className="space-y-6">
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm leading-6 text-green-800">
                  <p>
                    Thank you for submitting your program! Our team will review it and get
                    back to you within 3-5 business days.
                  </p>
                  <p className="mt-3">
                    We&apos;ll send updates to{" "}
                    <span className="font-semibold">{submitted.contactEmail}</span>.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-blue-900">
                    Submitted program details
                  </h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="font-medium text-blue-700">Program name</dt>
                      <dd className="mt-0.5 text-slate-800">{submitted.name}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-blue-700">Description</dt>
                      <dd className="mt-0.5 whitespace-pre-wrap text-slate-800">
                        {submitted.description}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-blue-700">Location</dt>
                      <dd className="mt-0.5 text-slate-800">
                        {submitted.city}, {submitted.stateName}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-blue-700">Category</dt>
                      <dd className="mt-0.5 text-slate-800">{submitted.category}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-blue-700">Contact email</dt>
                      <dd className="mt-0.5 break-all text-slate-800">{submitted.contactEmail}</dd>
                    </div>
                    {submitted.phone ? (
                      <div>
                        <dt className="font-medium text-blue-700">Phone</dt>
                        <dd className="mt-0.5 text-slate-800">{submitted.phone}</dd>
                      </div>
                    ) : null}
                    {submitted.website ? (
                      <div>
                        <dt className="font-medium text-blue-700">Website</dt>
                        <dd className="mt-0.5 break-all text-slate-800">{submitted.website}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                  >
                    Submit Another Program
                  </button>
                  <Link
                    href="/"
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-50"
                  >
                    Browse All Programs
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-blue-900">Program details</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Fields marked with <span className="text-red-600">*</span> are required.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
                  <label className="block" htmlFor="program-name">
                    <span className="mb-1.5 block text-sm font-medium text-blue-700">
                      Program Name <span className="text-red-600">*</span>
                    </span>
                    <input
                      ref={nameRef}
                      id="program-name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      placeholder="e.g., Sunshine Academy Online"
                      aria-invalid={fieldErrors.name ? true : undefined}
                      aria-describedby={fieldErrors.name ? "program-name-error" : undefined}
                      onChange={(event) => updateField("name", event.target.value)}
                      className={`${INPUT_CLASS} ${fieldErrors.name ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`}
                    />
                    {fieldErrors.name ? (
                      <span id="program-name-error" className="mt-1 block text-sm text-red-600">
                        {fieldErrors.name}
                      </span>
                    ) : null}
                  </label>

                  <label className="block" htmlFor="program-description">
                    <span className="mb-1.5 block text-sm font-medium text-blue-700">
                      Description <span className="text-red-600">*</span>
                    </span>
                    <textarea
                      id="program-description"
                      name="description"
                      required
                      rows={6}
                      maxLength={DESCRIPTION_MAX}
                      value={form.description}
                      placeholder="Tell families what makes your program special"
                      aria-invalid={fieldErrors.description ? true : undefined}
                      aria-describedby={
                        fieldErrors.description
                          ? "program-description-count program-description-error"
                          : "program-description-count"
                      }
                      onChange={(event) => updateField("description", event.target.value)}
                      className={`${INPUT_CLASS} min-h-40 resize-y ${fieldErrors.description ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`}
                    />
                    <span
                      id="program-description-count"
                      className={`mt-1 block text-xs ${
                        form.description.length >= DESCRIPTION_MAX ? "text-red-600" : "text-slate-500"
                      }`}
                    >
                      {form.description.length}/{DESCRIPTION_MAX} characters
                    </span>
                    {fieldErrors.description ? (
                      <span id="program-description-error" className="mt-1 block text-sm text-red-600">
                        {fieldErrors.description}
                      </span>
                    ) : null}
                  </label>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <label className="block" htmlFor="program-city">
                      <span className="mb-1.5 block text-sm font-medium text-blue-700">
                        City <span className="text-red-600">*</span>
                      </span>
                      <input
                        id="program-city"
                        name="city"
                        type="text"
                        required
                        value={form.city}
                        placeholder="e.g., Springfield"
                        aria-invalid={fieldErrors.city ? true : undefined}
                        aria-describedby={fieldErrors.city ? "program-city-error" : undefined}
                        onChange={(event) => updateField("city", event.target.value)}
                        className={`${INPUT_CLASS} ${fieldErrors.city ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`}
                      />
                      {fieldErrors.city ? (
                        <span id="program-city-error" className="mt-1 block text-sm text-red-600">
                          {fieldErrors.city}
                        </span>
                      ) : null}
                    </label>

                    <label className="block" htmlFor="program-state">
                      <span className="mb-1.5 block text-sm font-medium text-blue-700">
                        State <span className="text-red-600">*</span>
                      </span>
                      <select
                        id="program-state"
                        name="state"
                        required
                        value={form.state}
                        aria-invalid={fieldErrors.state ? true : undefined}
                        aria-describedby={fieldErrors.state ? "program-state-error" : undefined}
                        onChange={(event) => updateField("state", event.target.value)}
                        className={`${INPUT_CLASS} ${fieldErrors.state ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`}
                      >
                        <option value="">Select a state</option>
                        {US_STATES.map((state) => (
                          <option key={state.abbreviation} value={state.abbreviation}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.state ? (
                        <span id="program-state-error" className="mt-1 block text-sm text-red-600">
                          {fieldErrors.state}
                        </span>
                      ) : null}
                    </label>
                  </div>

                  <label className="block" htmlFor="program-category">
                    <span className="mb-1.5 block text-sm font-medium text-blue-700">
                      Category <span className="text-red-600">*</span>
                    </span>
                    <select
                      id="program-category"
                      name="category"
                      required
                      value={form.category}
                      aria-invalid={fieldErrors.category ? true : undefined}
                      aria-describedby={fieldErrors.category ? "program-category-error" : undefined}
                      onChange={(event) => updateField("category", event.target.value)}
                      className={`${INPUT_CLASS} ${fieldErrors.category ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`}
                    >
                      <option value="">Select a category</option>
                      {PROGRAM_SUBMISSION_CATEGORIES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.category ? (
                      <span id="program-category-error" className="mt-1 block text-sm text-red-600">
                        {fieldErrors.category}
                      </span>
                    ) : null}
                  </label>

                  <label className="block" htmlFor="program-email">
                    <span className="mb-1.5 block text-sm font-medium text-blue-700">
                      Contact Email <span className="text-red-600">*</span>
                    </span>
                    <input
                      id="program-email"
                      name="contact_email"
                      type="email"
                      required
                      autoComplete="email"
                      value={form.contactEmail}
                      placeholder="We'll use this to verify your program"
                      aria-invalid={fieldErrors.contactEmail ? true : undefined}
                      aria-describedby={
                        fieldErrors.contactEmail ? "program-email-error" : undefined
                      }
                      onChange={(event) => updateField("contactEmail", event.target.value)}
                      className={`${INPUT_CLASS} ${fieldErrors.contactEmail ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`}
                    />
                    {fieldErrors.contactEmail ? (
                      <span id="program-email-error" className="mt-1 block text-sm text-red-600">
                        {fieldErrors.contactEmail}
                      </span>
                    ) : null}
                  </label>

                  <label className="block" htmlFor="program-phone">
                    <span className="mb-1.5 block text-sm font-medium text-blue-700">
                      Phone <span className="font-normal text-slate-500">(optional)</span>
                    </span>
                    <input
                      id="program-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      placeholder="e.g., (555) 123-4567"
                      aria-invalid={fieldErrors.phone ? true : undefined}
                      aria-describedby={fieldErrors.phone ? "program-phone-error" : undefined}
                      onChange={(event) => updateField("phone", event.target.value)}
                      className={`${INPUT_CLASS} ${fieldErrors.phone ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`}
                    />
                    {fieldErrors.phone ? (
                      <span id="program-phone-error" className="mt-1 block text-sm text-red-600">
                        {fieldErrors.phone}
                      </span>
                    ) : null}
                  </label>

                  <label className="block" htmlFor="program-website">
                    <span className="mb-1.5 block text-sm font-medium text-blue-700">
                      Website <span className="font-normal text-slate-500">(optional)</span>
                    </span>
                    <input
                      id="program-website"
                      name="website"
                      type="url"
                      inputMode="url"
                      value={form.website}
                      placeholder="e.g., https://example.com"
                      aria-invalid={fieldErrors.website ? true : undefined}
                      aria-describedby={fieldErrors.website ? "program-website-error" : undefined}
                      onChange={(event) => updateField("website", event.target.value)}
                      className={`${INPUT_CLASS} ${fieldErrors.website ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`}
                    />
                    {fieldErrors.website ? (
                      <span id="program-website-error" className="mt-1 block text-sm text-red-600">
                        {fieldErrors.website}
                      </span>
                    ) : null}
                  </label>

                  <div>
                    <label className="flex items-start gap-3 text-sm text-slate-700" htmlFor="program-certified">
                      <input
                        id="program-certified"
                        name="certified"
                        type="checkbox"
                        checked={form.certified}
                        aria-invalid={fieldErrors.certified ? true : undefined}
                        aria-describedby={
                          fieldErrors.certified ? "program-certified-error" : undefined
                        }
                        onChange={(event) => updateField("certified", event.target.checked)}
                        className="mt-0.5 h-5 w-5 shrink-0 rounded border-blue-300 text-blue-700 focus:ring-2 focus:ring-blue-200"
                      />
                      <span>
                        <span className="font-medium text-blue-800">
                          I certify this is accurate information
                        </span>{" "}
                        <span className="text-red-600">*</span>
                      </span>
                    </label>
                    {fieldErrors.certified ? (
                      <span id="program-certified-error" className="mt-1 block text-sm text-red-600">
                        {fieldErrors.certified}
                      </span>
                    ) : null}
                  </div>

                  {formError ? (
                    <p
                      role="alert"
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                    >
                      {formError}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    {submitting ? "Submitting..." : "Submit Program"}
                  </button>
                </form>
              </>
            )}
          </section>

          <aside className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">
            <h2 className="text-xl font-semibold text-blue-900">Why Submit?</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <li className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-blue-900">
                Your program will be reviewed for quality and accuracy
              </li>
              <li className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-blue-900">
                Once approved, you can claim and verify your listing
              </li>
            </ul>

            <div className="mt-6 rounded-xl border border-blue-200 bg-white px-4 py-4">
              <p className="text-sm font-semibold text-blue-800">Your info is safe with us</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                We use your contact details to review the listing and follow up about
                this submission. We don&apos;t sell your information.
              </p>
            </div>

            <p className="mt-6 text-sm text-slate-600">
              Questions?{" "}
              <Link href="/contact" className="font-medium text-blue-700 underline-offset-2 hover:underline">
                Contact us
              </Link>
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
