// app/admin/programs/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Program {
  id: string;
  name: string;
  state: string;
  city: string;
  category: string;
  description?: string;
  contact_email: string;
  phone?: string;
  website?: string;
  featured: boolean;
}

const states = [
  "Florida",
  "Oklahoma",
  "Tennessee",
  "Texas",
  "California",
  "New York",
  "Georgia",
  "North Carolina",
  "Pennsylvania",
  "Ohio",
];

const categories = [
  "Classical School",
  "Classical Co-op",
  "Classical Program",
  "Microschool",
  "Private School",
  "Enrichment Program",
  "Enrichment Academy",
  "Hybrid Program",
  "Co-op",
  "Tutoring Co-op",
  "Support Group",
];

export default function ProgramForm({ params }: { params: { id: string } }) {
  const isNew = params.id === "new";
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Partial<Program>>({
    name: "",
    state: "Florida",
    city: "",
    category: "",
    contact_email: "",
    phone: "",
    website: "",
    description: "",
    featured: false,
  });

  useEffect(() => {
    if (!isNew) {
      fetchProgram();
    }
  }, [isNew]);

  const fetchProgram = async () => {
    try {
      const response = await fetch(`/api/admin/programs/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch program");

      const data = await response.json();
      setForm(data.program);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load program");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = isNew ? "/api/admin/programs" : `/api/admin/programs/${params.id}`;
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          state: form.state,
          city: form.city,
          category: form.category,
          contact_email: form.contact_email,
          phone: form.phone || null,
          website: form.website || null,
          description: form.description || null,
          featured: form.featured || false,
        }),
      });

      if (!response.ok) throw new Error("Failed to save program");

      window.location.href = "/admin/programs";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save program");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? "Add New Program" : "Edit Program"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isNew ? "Create a new homeschool program" : "Update program details"}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          {/* Program Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Program Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter program name"
            />
          </div>

          {/* State and City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                State <span className="text-red-600">*</span>
              </label>
              <select
                required
                value={form.state || "Florida"}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                City <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={form.city || ""}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter city"
              />
            </div>
          </div>

          {/* Category and Contact Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Category <span className="text-red-600">*</span>
              </label>
              <select
                required
                value={form.category || ""}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Contact Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                required
                value={form.contact_email || ""}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter contact email"
              />
            </div>
          </div>

          {/* Phone and Website */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Website
              </label>
              <input
                type="url"
                value={form.website || ""}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description
            </label>
            <textarea
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter program description"
            />
          </div>

          {/* Featured Checkbox */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={form.featured || false}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <span className="ml-2 text-sm font-medium text-gray-900">
                Featured Program (appears at the top of listings)
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : isNew ? "Create Program" : "Save Changes"}
            </button>
            <Link
              href="/admin/programs"
              className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Back link */}
        <div className="mt-8">
          <Link
            href="/admin/programs"
            className="text-blue-600 hover:text-blue-900 transition"
          >
            ← Back to Programs
          </Link>
        </div>
      </div>
    </div>
  );
}
