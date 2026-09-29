// app/admin/programs/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Program {
  id: string;
  name: string;
  state: string;
  city: string;
  category: string;
  contact_email: string;
  phone?: string;
  featured: boolean;
  created_at: string;
}

export default function ProgramsManagement() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [availableStates, setAvailableStates] = useState<string[]>([]);

  useEffect(() => {
    fetchPrograms();
  }, [selectedState, searchTerm]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (selectedState) query.append("state", selectedState);
      if (searchTerm) query.append("search", searchTerm);

      const url = `/api/admin/programs?${query.toString()}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch programs");

      const data = await response.json();
      setPrograms(data.programs);

      // Extract unique states from programs
      const states = Array.from(new Set(data.programs.map((p: Program) => p.state)))
        .sort() as string[];
      setAvailableStates(states);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const response = await fetch(`/api/admin/programs/${id}`, {
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
      const program = programs.find((p) => p.id === id);
      if (!program) return;

      const response = await fetch(`/api/admin/programs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: program.name,
          state: program.state,
          city: program.city,
          category: program.category,
          contact_email: program.contact_email,
          phone: program.phone || null,
          featured: !currentFeatured,
        }),
      });

      if (!response.ok) throw new Error("Failed to update program");

      setPrograms(
        programs.map((p) =>
          p.id === id ? { ...p, featured: !currentFeatured } : p
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update program");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
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
            {availableStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Programs Table */}
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
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    State
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[130px]">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Featured
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] sticky right-0 bg-gray-50">
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
                      {program.city}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {program.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {program.contact_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {program.phone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() =>
                          toggleFeatured(program.id, program.featured)
                        }
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition ${
                          program.featured
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {program.featured ? "★ Featured" : "Not Featured"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2 sticky right-0 bg-white">
                      <Link
                        href={`/admin/programs/${program.id}`}
                        className="text-blue-600 hover:text-blue-900 transition font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(program.id, program.name)}
                        className="text-red-600 hover:text-red-900 transition font-medium"
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

        {/* Stats */}
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
                {programs.filter((p) => p.featured).length}
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

        {/* Back to Dashboard */}
        <div className="mt-8">
          <Link
            href="/admin/dashboard"
            className="text-blue-600 hover:text-blue-900 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
