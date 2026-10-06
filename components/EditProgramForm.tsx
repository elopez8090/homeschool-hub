"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { findState, programPath, US_STATES } from "@/lib/states";
import {
  GRADE_LEVEL_LABELS,
  GRADE_LEVELS,
  PROGRAM_CATEGORIES,
  PROGRAM_FORMATS,
  PROGRAM_TYPES,
  type GradeLevel,
  type ProgramFormat,
  type ProgramType,
  type SocialMediaLinks,
} from "@/lib/types";
import {
  OWNER_DESCRIPTION_MAX,
  PROGRAM_SUBMISSION_CATEGORIES,
  validateOwnerProgramUpdate,
  type OwnerProgramFieldErrors,
} from "@/lib/validation";

type FormState = {
  name: string;
  description: string;
  city: string;
  state: string;
  category: string;
  contact_email: string;
  phone: string;
  website: string;
  grades_served: GradeLevel[];
  program_format: ProgramFormat[];
  program_type: ProgramType | "";
  facebook: string;
  instagram: string;
  youtube: string;
  twitter: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  city: "",
  state: "",
  category: "",
  contact_email: "",
  phone: "",
  website: "",
  grades_served: [],
  program_format: [],
  program_type: "",
  facebook: "",
  instagram: "",
  youtube: "",
  twitter: "",
};

type LoadedProgram = {
  name?: string;
  description?: string;
  city?: string;
  state?: string;
  category?: string;
  contact_email?: string;
  phone?: string | null;
  website?: string | null;
  grades_served?: GradeLevel[] | null;
  program_format?: ProgramFormat[] | null;
  program_type?: ProgramType | null;
  social_media?: SocialMediaLinks | null;
};

const INPUT_CLASS =
  "min-h-11 w-full rounded-lg border border-blue-200 bg-white px-3 py-2.5 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200";

function formFromProgram(program: LoadedProgram, stateValue?: string): FormState {
  return {
    name: program.name || "",
    description: program.description || "",
    city: program.city || "",
    state: stateValue ?? program.state ?? "",
    category: program.category || "",
    contact_email: program.contact_email || "",
    phone: program.phone || "",
    website: program.website || "",
    grades_served: program.grades_served || [],
    program_format: program.program_format || [],
    program_type: program.program_type || "",
    facebook: program.social_media?.facebook || "",
    instagram: program.social_media?.instagram || "",
    youtube: program.social_media?.youtube || "",
    twitter: program.social_media?.twitter || "",
  };
}

function formatUpdated(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function EditProgramForm({ programId }: { programId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authenticated, setAuthenticated] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<OwnerProgramFieldErrors>({});
  const [saved, setSaved] = useState(false);
  const justClaimed = searchParams.get("claimed") === "1";

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        [form.category, ...PROGRAM_SUBMISSION_CATEGORIES, ...PROGRAM_CATEGORIES].filter(Boolean),
      ),
    );
  }, [form.category]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`/api/owner/programs/${programId}`);
        const payload = await response.json().catch(() => ({}));
        if (response.status === 401) {
          if (!cancelled) setAuthenticated(false);
          return;
        }
        if (response.status === 403) {
          if (!cancelled) {
            setForbidden(true);
            setError(payload.error || "You don't have permission to edit this program");
          }
          return;
        }
        if (!response.ok) {
          throw new Error(payload.error || "Could not load this program.");
        }
        const program = payload.program;
        if (!cancelled && program) {
          const matchedState = findState(program.state || "");
          setForm(
            formFromProgram(program, matchedState?.abbreviation || program.state || ""),
          );
          setUpdatedAt(formatUpdated(program.updated_at));
          setReady(true);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Could not load this program.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [programId]);

  function update(
    field: Exclude<keyof FormState, "grades_served" | "program_format" | "program_type">,
    value: string,
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSaved(false);
  }

  function updateProgramType(value: string) {
    const programType = (PROGRAM_TYPES as readonly string[]).includes(value)
      ? (value as ProgramType)
      : "";
    setForm((current) => ({ ...current, program_type: programType }));
    setFieldErrors((current) => ({ ...current, program_type: undefined }));
    setSaved(false);
  }

  function toggleGrade(value: GradeLevel) {
    setForm((current) => ({
      ...current,
      grades_served: current.grades_served.includes(value)
        ? current.grades_served.filter((item) => item !== value)
        : [...current.grades_served, value],
    }));
    setFieldErrors((current) => ({ ...current, grades_served: undefined }));
    setSaved(false);
  }

  function toggleFormat(value: ProgramFormat) {
    setForm((current) => ({
      ...current,
      program_format: current.program_format.includes(value)
        ? current.program_format.filter((item) => item !== value)
        : [...current.program_format, value],
    }));
    setFieldErrors((current) => ({ ...current, program_format: undefined }));
    setSaved(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);

    const { errors, fieldErrors: nextErrors, data } = validateOwnerProgramUpdate({
      name: form.name,
      description: form.description,
      city: form.city,
      state: form.state,
      category: form.category,
      contact_email: form.contact_email,
      phone: form.phone,
      website: form.website,
      grades_served: form.grades_served,
      program_format: form.program_format,
      program_type: form.program_type,
      social_media: {
        facebook: form.facebook,
        instagram: form.instagram,
        youtube: form.youtube,
        twitter: form.twitter,
      },
    });
    setFieldErrors(nextErrors);
    if (errors.length > 0) {
      setError("Please fix the highlighted fields and try again.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/owner/programs/${programId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await response.json().catch(() => ({}));
      if (response.status === 401) {
        setAuthenticated(false);
        router.refresh();
        return;
      }
      if (response.status === 403) {
        setForbidden(true);
        setError(payload.error || "You don't have permission to edit this program");
        return;
      }
      if (!response.ok) {
        setFieldErrors(payload.fieldErrors || {});
        throw new Error(payload.error || "Could not save this program.");
      }
      if (payload.program) {
        const matchedState = findState(payload.program.state || "");
        setForm(
          formFromProgram(
            payload.program,
            matchedState?.abbreviation || payload.program.state || form.state,
          ),
        );
        if (payload.program.updated_at) {
          setUpdatedAt(formatUpdated(payload.program.updated_at));
        }
      }
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save this program.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-600">Loading program...</p>;
  }

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-blue-100 bg-white px-6 py-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-blue-900">Edit program</h1>
        <p className="mt-3 text-base text-slate-700">Sign in to manage your programs</p>
        <Link
          href="/owner/login"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-white px-6 py-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-blue-900">Edit program</h1>
        <p className="mt-3 text-sm text-red-700">
          You don&apos;t have permission to edit this program
        </p>
        <Link
          href="/owner/dashboard"
          className="mt-6 inline-flex text-sm font-medium text-blue-700 hover:text-blue-900"
        >
          Back to your programs
        </Link>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="text-2xl font-semibold text-blue-900">Edit program</h1>
        <p className="text-sm text-red-600">{error || "Could not load this program."}</p>
        <Link href="/owner/dashboard" className="inline-flex text-sm font-medium text-blue-700 hover:text-blue-900">
          Back to your programs
        </Link>
      </div>
    );
  }

  const listingPath = form.state ? programPath(form.state, programId) : "";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/owner/dashboard" className="text-sm text-blue-700 hover:text-blue-900">
          ← Back to your programs
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-blue-900">Edit program</h1>
        {updatedAt ? (
          <p className="mt-2 text-sm text-slate-600">Last updated: {updatedAt}</p>
        ) : null}
      </div>

      {justClaimed && !saved ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          This program is claimed and verified. You can update the public details below.
        </p>
      ) : null}
      {saved ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Program updated successfully
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5 rounded-xl border border-blue-100 bg-white p-5 shadow-sm sm:p-8"
      >
        <p className="text-sm text-slate-600">
          Fields marked with <span className="text-red-600">*</span> are required.
        </p>

        <Field
          id="program-name"
          label="Program Name"
          required
          error={fieldErrors.name}
        >
          <input
            id="program-name"
            required
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            className={inputClass(Boolean(fieldErrors.name))}
          />
        </Field>

        <Field
          id="program-description"
          label="Description"
          required
          error={fieldErrors.description}
        >
          <textarea
            id="program-description"
            required
            rows={6}
            maxLength={OWNER_DESCRIPTION_MAX}
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            className={`${inputClass(Boolean(fieldErrors.description))} min-h-40 resize-y`}
          />
          <span
            className={`mt-1 block text-xs ${
              form.description.length >= OWNER_DESCRIPTION_MAX ? "text-red-600" : "text-slate-500"
            }`}
          >
            {form.description.length}/{OWNER_DESCRIPTION_MAX} characters
          </span>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="program-city" label="City" required error={fieldErrors.city}>
            <input
              id="program-city"
              required
              value={form.city}
              onChange={(event) => update("city", event.target.value)}
              className={inputClass(Boolean(fieldErrors.city))}
            />
          </Field>
          <Field id="program-state" label="State" required error={fieldErrors.state}>
            <select
              id="program-state"
              required
              value={form.state}
              onChange={(event) => update("state", event.target.value)}
              className={inputClass(Boolean(fieldErrors.state))}
            >
              <option value="">Select a state</option>
              {US_STATES.map((state) => (
                <option key={state.abbreviation} value={state.abbreviation}>
                  {state.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field id="program-category" label="Category" required error={fieldErrors.category}>
          <select
            id="program-category"
            required
            value={form.category}
            onChange={(event) => update("category", event.target.value)}
            className={inputClass(Boolean(fieldErrors.category))}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="program-email"
            label="Contact Email"
            required
            error={fieldErrors.contact_email}
          >
            <input
              id="program-email"
              required
              type="email"
              value={form.contact_email}
              onChange={(event) => update("contact_email", event.target.value)}
              className={inputClass(Boolean(fieldErrors.contact_email))}
            />
          </Field>
          <Field id="program-phone" label="Phone" error={fieldErrors.phone}>
            <input
              id="program-phone"
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
              placeholder="(555) 123-4567"
              className={inputClass(Boolean(fieldErrors.phone))}
            />
          </Field>
        </div>

        <Field id="program-website" label="Website" error={fieldErrors.website}>
          <input
            id="program-website"
            value={form.website}
            onChange={(event) => update("website", event.target.value)}
            placeholder="https://"
            className={inputClass(Boolean(fieldErrors.website))}
          />
        </Field>

        <div className="space-y-5 border-t border-blue-100 pt-5">
          <div>
            <h2 className="text-lg font-semibold text-blue-900">Program details</h2>
            <p className="mt-1 text-sm text-slate-600">
              Optional details shown on the public listing.
            </p>
          </div>

          <CheckboxGroup
            legend="Grades served"
            error={fieldErrors.grades_served}
          >
            {GRADE_LEVELS.map((grade) => (
              <CheckboxCard
                key={grade}
                checked={form.grades_served.includes(grade)}
                onChange={() => toggleGrade(grade)}
                label={GRADE_LEVEL_LABELS[grade]}
              />
            ))}
          </CheckboxGroup>

          <CheckboxGroup legend="Program format" error={fieldErrors.program_format}>
            {PROGRAM_FORMATS.map((format) => (
              <CheckboxCard
                key={format}
                checked={form.program_format.includes(format)}
                onChange={() => toggleFormat(format)}
                label={format}
              />
            ))}
          </CheckboxGroup>

          <Field id="program-type" label="Program type" error={fieldErrors.program_type}>
            <select
              id="program-type"
              value={form.program_type}
              onChange={(event) => updateProgramType(event.target.value)}
              className={inputClass(Boolean(fieldErrors.program_type))}
            >
              <option value="">Select a type</option>
              {PROGRAM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>

          <fieldset className="space-y-4">
            <legend className="text-sm font-medium text-blue-900">Social media</legend>
            {fieldErrors.social_media ? (
              <p className="text-sm text-red-600">{fieldErrors.social_media}</p>
            ) : null}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="program-facebook" label="Facebook URL" error={fieldErrors.facebook}>
                <input
                  id="program-facebook"
                  type="url"
                  inputMode="url"
                  value={form.facebook}
                  onChange={(event) => update("facebook", event.target.value)}
                  placeholder="https://facebook.com/..."
                  className={inputClass(Boolean(fieldErrors.facebook))}
                />
              </Field>
              <Field id="program-instagram" label="Instagram URL" error={fieldErrors.instagram}>
                <input
                  id="program-instagram"
                  type="url"
                  inputMode="url"
                  value={form.instagram}
                  onChange={(event) => update("instagram", event.target.value)}
                  placeholder="https://instagram.com/..."
                  className={inputClass(Boolean(fieldErrors.instagram))}
                />
              </Field>
              <Field id="program-youtube" label="YouTube URL" error={fieldErrors.youtube}>
                <input
                  id="program-youtube"
                  type="url"
                  inputMode="url"
                  value={form.youtube}
                  onChange={(event) => update("youtube", event.target.value)}
                  placeholder="https://youtube.com/..."
                  className={inputClass(Boolean(fieldErrors.youtube))}
                />
              </Field>
              <Field id="program-twitter" label="Twitter URL" error={fieldErrors.twitter}>
                <input
                  id="program-twitter"
                  type="url"
                  inputMode="url"
                  value={form.twitter}
                  onChange={(event) => update("twitter", event.target.value)}
                  placeholder="https://twitter.com/..."
                  className={inputClass(Boolean(fieldErrors.twitter))}
                />
              </Field>
            </div>
          </fieldset>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <Link
            href="/owner/dashboard"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-50"
          >
            Cancel
          </Link>
          {listingPath ? (
            <Link
              href={listingPath}
              className="inline-flex min-h-11 items-center justify-center text-sm font-medium text-blue-700 hover:text-blue-900"
            >
              View
            </Link>
          ) : null}
        </div>
      </form>
    </div>
  );
}

function inputClass(invalid: boolean) {
  return invalid
    ? `${INPUT_CLASS} border-red-400 focus:border-red-500 focus:ring-red-200`
    : INPUT_CLASS;
}

function CheckboxGroup({
  legend,
  error,
  children,
}: {
  legend: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-blue-900">{legend}</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{children}</div>
      {error ? <span className="mt-1 block text-sm text-red-600">{error}</span> : null}
    </fieldset>
  );
}

function CheckboxCard({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label
      className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
        checked
          ? "border-blue-700 bg-blue-50 font-medium text-blue-900"
          : "border-blue-200 text-slate-800 hover:bg-blue-50"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 rounded border-blue-300 text-blue-700 accent-blue-700 focus:ring-2 focus:ring-blue-200"
      />
      {label}
    </label>
  );
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1.5 block text-sm font-medium text-blue-900">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      {children}
      {error ? <span className="mt-1 block text-sm text-red-600">{error}</span> : null}
    </label>
  );
}
