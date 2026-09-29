# PowerShell Script to Add Program Management to Admin Panel
# Run from your project root folder

Write-Host "Setting up Program Management..." -ForegroundColor Green

# Create directory structure
Write-Host "Creating directories..." -ForegroundColor Cyan

$dirs = @(
    "app/admin/programs",
    "app/admin/programs/[id]",
    "app/api/admin/programs",
    "app/api/admin/programs/[id]"
)

foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "[OK] $dir" -ForegroundColor Green
    } else {
        Write-Host "[EXISTS] $dir" -ForegroundColor Yellow
    }
}

# 1. Programs Management Page
$programsPage = @"
// app/admin/programs/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Program {
  id: string;
  name: string;
  state: string;
  email: string;
  phone: string;
  website?: string;
  is_featured: boolean;
  created_at: string;
}

export default function ProgramsManagement() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

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

  useEffect(() => {
    fetchPrograms();
  }, [selectedState, searchTerm]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (selectedState) query.append("state", selectedState);
      if (searchTerm) query.append("search", searchTerm);

      const response = await fetch(`/api/admin/programs?`);
      if (!response.ok) throw new Error("Failed to fetch programs");

      const data = await response.json();
      setPrograms(data.programs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "`+name+`"`?")) return;

    try {
      const response = await fetch(`/api/admin/programs/`+id, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete program");

      setPrograms(programs.filter((p) => p.id !== id));
      alert("Program deleted successfully");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete program");
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const response = await fetch(`/api/admin/programs/`+id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_featured: !currentFeatured }),
      });

      if (!response.ok) throw new Error("Failed to update program");

      setPrograms(
        programs.map((p) =>
          p.id === id ? { ...p, is_featured: !currentFeatured } : p
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update program");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Program Management
              </h1>
              <p className="text-gray-600 mt-1">
                Add, edit, and manage homeschool programs
              </p>
            </div>
            <Link
              href="/admin/programs/new"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
            >
              + Add Program
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All States</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading programs...</p>
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600 mb-4">No programs found</p>
            <Link
              href="/admin/programs/new"
              className="text-blue-600 hover:underline"
            >
              Create the first program
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    State
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {programs.map((program) => (
                  <tr key={program.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {program.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {program.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {program.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {program.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() =>
                          toggleFeatured(program.id, program.is_featured)
                        }
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition `+(program.is_featured ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" : "bg-gray-100 text-gray-800 hover:bg-gray-200")}
                      >
                        {program.is_featured ? "★ Featured" : "Not Featured"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <Link
                        href={`/admin/programs/`+program.id}
                        className="text-blue-600 hover:text-blue-900 transition"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(program.id, program.name)}
                        className="text-red-600 hover:text-red-900 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && programs.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Total Programs</p>
              <p className="text-2xl font-bold text-gray-900">
                {programs.length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Featured</p>
              <p className="text-2xl font-bold text-yellow-600">
                {programs.filter((p) => p.is_featured).length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">States</p>
              <p className="text-2xl font-bold text-blue-600">
                {new Set(programs.map((p) => p.state)).size}
              </p>
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/admin/dashboard"
            className="text-blue-600 hover:text-blue-900 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
"@

Set-Content -Path "app/admin/programs/page.tsx" -Value $programsPage -Encoding UTF8
Write-Host "[OK] app/admin/programs/page.tsx" -ForegroundColor Green

# 2. Program Form Page
$programForm = @"
// app/admin/programs/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Program {
  id: string;
  name: string;
  state: string;
  email: string;
  phone: string;
  website?: string;
  description?: string;
  is_featured: boolean;
}

export default function ProgramForm() {
  const router = useRouter();
  const params = useParams();
  const isNewProgram = params.id === "new";

  const [formData, setFormData] = useState<Omit<Program, "id">>({
    name: "",
    state: "",
    email: "",
    phone: "",
    website: "",
    description: "",
    is_featured: false,
  });

  const [loading, setLoading] = useState(!isNewProgram);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => {
    if (!isNewProgram) {
      fetchProgram();
    }
  }, [isNewProgram]);

  const fetchProgram = async () => {
    try {
      const response = await fetch(`/api/admin/programs/`+params.id);
      if (!response.ok) throw new Error("Failed to fetch program");

      const data = await response.json();
      setFormData(data.program);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load program");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const method = isNewProgram ? "POST" : "PUT";
      const url = isNewProgram
        ? "/api/admin/programs"
        : `/api/admin/programs/`+params.id;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save program");

      alert(
        isNewProgram
          ? "Program created successfully!"
          : "Program updated successfully!"
      );
      router.push("/admin/programs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save program");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading program...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isNewProgram ? "Add New Program" : "Edit Program"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isNewProgram
              ? "Create a new homeschool program"
              : "Update program information"}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Christian Classical Academy"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@example.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell us about this program..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Featured Program
                </span>
              </label>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition"
            >
              {saving
                ? "Saving..."
                : isNewProgram
                  ? "Create Program"
                  : "Update Program"}
            </button>
            <Link
              href="/admin/programs"
              className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-6 rounded-lg transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
"@

Set-Content -Path "app/admin/programs/[id]/page.tsx" -Value $programForm -Encoding UTF8
Write-Host "[OK] app/admin/programs/[id]/page.tsx" -ForegroundColor Green

# 3. Programs API Route
$programsApi = @"
// app/api/admin/programs/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state");
    const search = searchParams.get("search");

    let query = supabase
      .from("programs")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (state) {
      query = query.eq("state", state);
    }

    if (search) {
      query = query.or(
        `name.ilike.%`+search+`%,email.ilike.%`+search+`%,phone.ilike.%`+search+`%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ programs: data || [] });
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("programs")
      .insert([
        {
          name: body.name,
          state: body.state,
          email: body.email,
          phone: body.phone,
          website: body.website || null,
          description: body.description || null,
          is_featured: body.is_featured || false,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ program: data }, { status: 201 });
  } catch (error) {
    console.error("Error creating program:", error);
    return NextResponse.json(
      { error: "Failed to create program" },
      { status: 500 }
    );
  }
}
"@

Set-Content -Path "app/api/admin/programs/route.ts" -Value $programsApi -Encoding UTF8
Write-Host "[OK] app/api/admin/programs/route.ts" -ForegroundColor Green

# 4. Program ID API Route
$programIdApi = @"
// app/api/admin/programs/[id]/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from("programs")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ program: data });
  } catch (error) {
    console.error("Error fetching program:", error);
    return NextResponse.json(
      { error: "Failed to fetch program" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("programs")
      .update({
        name: body.name,
        state: body.state,
        email: body.email,
        phone: body.phone,
        website: body.website || null,
        description: body.description || null,
        is_featured: body.is_featured,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ program: data });
  } catch (error) {
    console.error("Error updating program:", error);
    return NextResponse.json(
      { error: "Failed to update program" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from("programs")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ message: "Program deleted successfully" });
  } catch (error) {
    console.error("Error deleting program:", error);
    return NextResponse.json(
      { error: "Failed to delete program" },
      { status: 500 }
    );
  }
}
"@

Set-Content -Path "app/api/admin/programs/[id]/route.ts" -Value $programIdApi -Encoding UTF8
Write-Host "[OK] app/api/admin/programs/[id]/route.ts" -ForegroundColor Green

Write-Host ""
Write-Host "Success! Program Management files created." -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to http://localhost:3000/admin/programs" -ForegroundColor White
Write-Host "2. Click '+ Add Program' to create new programs" -ForegroundColor White
Write-Host "3. Click 'Edit' or 'Delete' to manage existing programs" -ForegroundColor White
Write-Host "4. Use the star button to toggle featured status" -ForegroundColor White
