"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PROGRAM_CATEGORIES } from "@/lib/types";

type FormState = {
  name: string;
  description: string;
  city: string;
  category: string;
  contact_email: string;
  phone: string;
  website: string;
  state: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  city: "",
  category: "",
  contact_email: "",
  phone: "",
  website: "",
  state: "",
};

export default function EditProgramForm({ programId }: { programId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const justClaimed = searchParams.get("claimed") === "1";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`/api/owner/programs/${programId}`);
        if (response.status === 401) {
          router.replace("/owner/login");
          return;
        }
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.error || "Could not load this program.");
        }
        const program = payload.program;
        if (!cancelled && program) {
          setForm({
            name: program.name || "",
            description: program.description || "",
            city: program.city || "",
            category: program.category || "",
            contact_email: program.contact_email || "",
            phone: program.phone || "",
            website: program.website || "",
            state: program.state || "",
          });
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
  }, [programId, router]);

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const response = await fetch(`/api/owner/programs/${programId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          city: form.city,
          category: form.category,
          contact_email: form.contact_email,
          phone: form.phone,
          website: form.website,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (response.status === 401) {
        router.replace("/owner/login");
        return;
      }
      if (!response.ok) {
        throw new Error(payload.error || "Could not save this program.");
      }
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save this program.");
    } finally {
      setSaving(false);
    }
  }

  const categories = Array.from(
    new Set([form.category, ...PROGRAM_CATEGORIES].filter(Boolean)),
  );
  const listingState = form.state.trim().toLowerCase().replace(/\s+/g, "-");

  if (loading) {
    return <p className="text-sm text-slate-600">Loading program...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/owner/programs" className="text-sm text-blue-700 hover:text-blue-900">
          ← Back to your programs
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-blue-900">Edit program</h1>
      </div>

      {justClaimed && !saved ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          This program is claimed and verified. You can update the public details below.
        </p>
      ) : null}
      {saved ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Changes saved.
        </p>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-blue-100 bg-white p-5 shadow-sm sm:p-8"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-blue-900">Program name</span>
          <input
            required
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none ring-blue-300 focus:ring-2"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-blue-900">Description</span>
          <textarea
            required
            rows={6}
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none ring-blue-300 focus:ring-2"
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-blue-900">City</span>
            <input
              required
              value={form.city}
              onChange={(event) => update("city", event.target.value)}
              className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none ring-blue-300 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-blue-900">Category</span>
            <select
              required
              value={form.category}
              onChange={(event) => update("category", event.target.value)}
              className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm outline-none ring-blue-300 focus:ring-2"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-blue-900">Contact email</span>
            <input
              required
              type="email"
              value={form.contact_email}
              onChange={(event) => update("contact_email", event.target.value)}
              className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none ring-blue-300 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-blue-900">Phone</span>
            <input
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
              className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none ring-blue-300 focus:ring-2"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-blue-900">Website</span>
          <input
            value={form.website}
            onChange={(event) => update("website", event.target.value)}
            placeholder="https://"
            className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none ring-blue-300 focus:ring-2"
          />
        </label>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          {listingState ? (
            <Link
              href={`/${listingState}/${programId}`}
              className="text-sm font-medium text-blue-700 hover:text-blue-900"
            >
              View listing
            </Link>
          ) : null}
        </div>
      </form>
    </div>
  );
}
