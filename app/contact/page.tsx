"use client";

import { useRef, useState } from "react";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import {
  CONTACT_CATEGORIES,
  validateContact,
  type ContactFieldErrors,
} from "@/lib/validation";

const SUPPORT_EMAIL = "support@christianhomeschoolshub.com";

const INPUT_CLASS =
  "w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-blue-300 placeholder:text-slate-400 focus:ring-2";

const EMPTY_FORM = {
  name: "",
  email: "",
  subject: "",
  category: "",
  message: "",
};

export default function ContactPage() {
  const nameRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function updateField(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setFormError("");
    setSuccess(false);
    nameRef.current?.focus();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccess(false);

    const { errors, fieldErrors: nextErrors, data } = validateContact({
      name: form.name,
      email: form.email,
      subject: form.subject,
      message: form.message,
      category: form.category ? (form.category as (typeof CONTACT_CATEGORIES)[number]) : null,
    });

    setFieldErrors(nextErrors);
    if (errors.length > 0) {
      setFormError("Please fix the highlighted fields and try again.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = (await response.json()) as {
        error?: string;
        fieldErrors?: ContactFieldErrors;
      };

      if (!response.ok) {
        if (payload.fieldErrors) setFieldErrors(payload.fieldErrors);
        throw new Error(payload.error || "Unable to send your message.");
      }

      setForm(EMPTY_FORM);
      setFieldErrors({});
      setSuccess(true);
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to send your message.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white text-slate-800">
      <Navigation />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-200">
              Support
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-balance sm:text-5xl">
              Contact Us
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-blue-100">
              Questions about a listing, a submission, or the directory? Send a
              message and we will get back to you.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5 lg:gap-10">
            <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">
              <h2 className="text-2xl font-semibold text-blue-900">Get in Touch</h2>
              <p className="mt-3 text-slate-600">
                Write us about the directory, a program listing, or something
                that is not working as expected.
              </p>

              <dl className="mt-8 space-y-6">
                <div>
                  <dt className="text-sm font-medium text-blue-700">Email</dt>
                  <dd className="mt-1">
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="break-all text-base font-medium text-blue-800 underline-offset-2 hover:underline"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-blue-700">Response time</dt>
                  <dd className="mt-1 text-slate-600">
                    We typically respond within 24-48 hours.
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8 lg:col-span-3">
              <h2 className="text-2xl font-semibold text-blue-900">Send a message</h2>
              <p className="mt-2 text-sm text-slate-600">
                Fields marked with <span className="text-red-600">*</span> are required.
              </p>

              {success ? (
                <div
                  role="status"
                  className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
                >
                  <p className="font-medium">
                    Thank you! We&apos;ll get back to you soon.
                  </p>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="mt-3 inline-flex rounded-lg border border-green-300 bg-white px-3 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100"
                  >
                    Send another message
                  </button>
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <label className="block" htmlFor="contact-name">
                    <span className="mb-1.5 block text-sm font-medium text-blue-700">
                      Name <span className="text-red-600">*</span>
                    </span>
                    <input
                      ref={nameRef}
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={form.name}
                      placeholder="Your name"
                      aria-invalid={fieldErrors.name ? true : undefined}
                      aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
                      onChange={(event) => updateField("name", event.target.value)}
                      className={`${INPUT_CLASS} ${fieldErrors.name ? "border-red-400" : ""}`}
                    />
                    {fieldErrors.name ? (
                      <span id="contact-name-error" className="mt-1 block text-xs text-red-600">
                        {fieldErrors.name}
                      </span>
                    ) : null}
                  </label>

                  <label className="block" htmlFor="contact-email">
                    <span className="mb-1.5 block text-sm font-medium text-blue-700">
                      Email <span className="text-red-600">*</span>
                    </span>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={form.email}
                      placeholder="you@example.com"
                      aria-invalid={fieldErrors.email ? true : undefined}
                      aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
                      onChange={(event) => updateField("email", event.target.value)}
                      className={`${INPUT_CLASS} ${fieldErrors.email ? "border-red-400" : ""}`}
                    />
                    {fieldErrors.email ? (
                      <span id="contact-email-error" className="mt-1 block text-xs text-red-600">
                        {fieldErrors.email}
                      </span>
                    ) : null}
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <label className="block" htmlFor="contact-subject">
                    <span className="mb-1.5 block text-sm font-medium text-blue-700">
                      Subject <span className="text-red-600">*</span>
                    </span>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      required
                      value={form.subject}
                      placeholder="How can we help?"
                      aria-invalid={fieldErrors.subject ? true : undefined}
                      aria-describedby={fieldErrors.subject ? "contact-subject-error" : undefined}
                      onChange={(event) => updateField("subject", event.target.value)}
                      className={`${INPUT_CLASS} ${fieldErrors.subject ? "border-red-400" : ""}`}
                    />
                    {fieldErrors.subject ? (
                      <span id="contact-subject-error" className="mt-1 block text-xs text-red-600">
                        {fieldErrors.subject}
                      </span>
                    ) : null}
                  </label>

                  <label className="block" htmlFor="contact-category">
                    <span className="mb-1.5 block text-sm font-medium text-blue-700">
                      Category
                    </span>
                    <select
                      id="contact-category"
                      name="category"
                      value={form.category}
                      aria-invalid={fieldErrors.category ? true : undefined}
                      aria-describedby={fieldErrors.category ? "contact-category-error" : undefined}
                      onChange={(event) => updateField("category", event.target.value)}
                      className={`${INPUT_CLASS} ${fieldErrors.category ? "border-red-400" : ""}`}
                    >
                      <option value="">Select a category (optional)</option>
                      {CONTACT_CATEGORIES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.category ? (
                      <span id="contact-category-error" className="mt-1 block text-xs text-red-600">
                        {fieldErrors.category}
                      </span>
                    ) : null}
                  </label>
                </div>

                <label className="block" htmlFor="contact-message">
                  <span className="mb-1.5 block text-sm font-medium text-blue-700">
                    Message <span className="text-red-600">*</span>
                  </span>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={6}
                    value={form.message}
                    placeholder="Tell us a little about your question."
                    aria-invalid={fieldErrors.message ? true : undefined}
                    aria-describedby={fieldErrors.message ? "contact-message-error" : undefined}
                    onChange={(event) => updateField("message", event.target.value)}
                    className={`${INPUT_CLASS} min-h-40 resize-y ${fieldErrors.message ? "border-red-400" : ""}`}
                  />
                  {fieldErrors.message ? (
                    <span id="contact-message-error" className="mt-1 block text-xs text-red-600">
                      {fieldErrors.message}
                    </span>
                  ) : null}
                </label>

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
                  className="inline-flex w-full justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300 sm:w-auto"
                >
                  {submitting ? "Sending..." : "Send message"}
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
