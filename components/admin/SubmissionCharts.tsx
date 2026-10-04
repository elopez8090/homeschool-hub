"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { stateAbbreviation, stateDisplayName } from "@/lib/states";

const NAVY = "#1b365d";
const SELECTED = "#2563eb";
const CATEGORY_COLORS = ["#1b365d", "#24558f", "#3b82c4", "#60a5fa", "#7dd3fc", "#93c5fd", "#bfdbfe", "#1d4ed8"];

type SubmissionChartsProps = {
  byState: Record<string, number>;
  byCategory: Record<string, number>;
  activeState: string;
  activeCategory: string;
  onStateClick: (state: string) => void;
  onCategoryClick: (category: string) => void;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ value?: number; name?: string; payload?: { label?: string; percent?: number } }>;
  label?: string;
};

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const title = item.payload?.label || item.name || label || "";
  const percent = item.payload?.percent;
  return (
    <div className="rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-navy">{title}</p>
      <p className="text-gray-600">
        {item.value} pending
        {typeof percent === "number" ? ` · ${percent}%` : ""}
      </p>
    </div>
  );
}

export default function SubmissionCharts({
  byState,
  byCategory,
  activeState,
  activeCategory,
  onStateClick,
  onCategoryClick,
}: SubmissionChartsProps) {
  const stateRows = Object.entries(byState)
    .map(([state, count]) => ({
      state,
      label: stateDisplayName(state),
      short: stateAbbreviation(state),
      count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const topStates = stateRows.slice(0, 10);
  const categoryTotal = Object.values(byCategory).reduce((sum, count) => sum + count, 0);
  const categoryRows = Object.entries(byCategory)
    .map(([category, count]) => ({
      category,
      label: category,
      count,
      percent: categoryTotal === 0 ? 0 : Math.round((count / categoryTotal) * 100),
    }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));

  const chartHeight = Math.max(180, topStates.length * 36 + 24);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">Submissions by state</h2>
        <p className="mt-1 text-sm text-gray-500">
          {activeState
            ? `Filtered to ${stateDisplayName(activeState)}. Click again to clear.`
            : "Top 10 states with pending submissions. Click a bar to filter."}
        </p>
        {topStates.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-500">No pending submissions to chart.</p>
        ) : (
          <div className="mt-4" style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topStates} layout="vertical" margin={{ top: 4, right: 36, left: 4, bottom: 0 }}>
                <CartesianGrid stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="short"
                  width={36}
                  tick={{ fill: NAVY, fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#eff6ff" }} />
                <Bar
                  dataKey="count"
                  radius={[0, 4, 4, 0]}
                  barSize={18}
                  onClick={(_entry, index) => {
                    const state = topStates[index]?.state;
                    if (state) onStateClick(state);
                  }}
                >
                  {topStates.map((entry) => (
                    <Cell
                      key={entry.state}
                      fill={entry.state === activeState ? SELECTED : NAVY}
                      cursor="pointer"
                    />
                  ))}
                  <LabelList dataKey="count" position="right" fill="#4b5563" fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {stateRows.length > 10 && (
          <p className="mt-2 text-xs text-gray-500">Showing 10 of {stateRows.length} states.</p>
        )}
      </section>

      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">Submissions by category</h2>
        <p className="mt-1 text-sm text-gray-500">
          {activeCategory
            ? `Filtered to ${activeCategory}. Click again to clear.`
            : "Pending submissions by category. Click a slice to filter."}
        </p>
        {categoryRows.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-500">No pending submissions to chart.</p>
        ) : (
          <>
            <div className="mt-2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryRows}
                    dataKey="count"
                    nameKey="category"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={2}
                    onClick={(_entry, index) => {
                      const category = categoryRows[index]?.category;
                      if (category) onCategoryClick(category);
                    }}
                  >
                    {categoryRows.map((entry, index) => (
                      <Cell
                        key={entry.category}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        stroke={entry.category === activeCategory ? SELECTED : "#ffffff"}
                        strokeWidth={entry.category === activeCategory ? 3 : 1}
                        cursor="pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 space-y-1">
              {categoryRows.map((entry, index) => {
                const selected = entry.category === activeCategory;
                return (
                  <li key={entry.category}>
                    <button
                      type="button"
                      onClick={() => onCategoryClick(entry.category)}
                      className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-blue-50 ${
                        selected ? "bg-blue-50 font-medium text-navy" : "text-gray-700"
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                      />
                      <span className="min-w-0 flex-1 truncate">{entry.category}</span>
                      <span className="text-gray-500">{entry.percent}%</span>
                      <span className="w-8 text-right font-medium text-gray-900">{entry.count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
