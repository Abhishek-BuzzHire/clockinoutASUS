"use client";

import { useMemo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AttendanceData = {
    name: string;
    value: number;
};

type Props = {
    data: AttendanceData[];
    title?: string;
};

// ─── Constants (defined once at module level, never recreated) ────────────────

const COLORS: Record<string, string> = {
    Present: "#22c55e",
    Absent: "#ef4444",
    "On Leave": "#f59e0b",
    Remote: "#3b82f6",
};

const FALLBACK_COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899"];

const getColor = (name: string, index: number): string =>
    COLORS[name] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
// Defined outside component so React never re-mounts it on parent re-render

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const { name, value, payload: inner } = payload[0];
    const pct = inner?.total ? ((value / inner.total) * 100).toFixed(1) : "—";
    return (
        <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-lg">
            <p className="text-xs font-bold text-gray-700">{name}</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: getColor(name, 0) }}>
                {value} &middot; {pct}%
            </p>
        </div>
    );
};

// ─── Inline label renderer (module-level, referentially stable) ───────────────

const renderLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, name,
}: any) => {
    // Skip tiny slices — avoids overlapping text
    if ((percent ?? 0) < 0.05) return null;

    const R = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * R);
    const y = cy + radius * Math.sin(-midAngle * R);

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
            className="text-[11px] font-bold pointer-events-none select-none"
            style={{ fontSize: 11, fontWeight: 700 }}
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AttendanceChart({ data, title = "Employee Attendance Overview" }: Props) {
    // Derived values — only recomputed when `data` reference changes
    const total = useMemo(
        () => data.reduce((sum, d) => sum + d.value, 0),
        [data]
    );

    // Inject total into each entry so CustomTooltip can compute % without closure
    const chartData = useMemo(
        () => data.map((d) => ({ ...d, total })),
        [data, total]
    );

    // ── Empty state ───────────────────────────────────────────────────────────

    if (!data || data.length === 0) {
        return (
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 w-full">
                <h2 className="text-sm font-bold text-gray-500 tracking-tight mb-4">{title}</h2>
                <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                    No attendance data available
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 w-full">
            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-700 tracking-tight">{title}</h2>
                <span className="text-xs font-mono text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded-md">
                    {total} total
                </span>
            </div>

            {/* ── Chart + centre label ── */}
            <div className="relative w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            outerRadius="80%"
                            innerRadius="52%"   // donut — leaves room for center label
                            dataKey="value"
                            labelLine={false}
                            label={renderLabel}
                            paddingAngle={2}
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={getColor(entry.name, index)}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>

                {/* Centred total (donut hole) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                    <span className="text-2xl font-extrabold text-gray-900 leading-none">{total}</span>
                    <span className="text-[10px] text-gray-400 font-medium mt-0.5">employees</span>
                </div>
            </div>

            {/* ── Custom legend — replaces Recharts <Legend /> (lighter, no extra layout pass) ── */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                {data.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                        <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getColor(entry.name, index) }}
                        />
                        <span className="text-xs font-semibold text-gray-700">{entry.name}</span>
                        <span className="text-xs text-gray-400">{entry.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}