import { CalendarDay } from "@/lib/types";
import type { employeeAttendance } from "@/lib/types";
import { Calendar, X, Send, Download, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/* ================================================================
   TYPES
================================================================ */

type EmployeeAttendanceSheetProps = {
    onClose: () => void;
    onSubmit: (start: string, end: string) => void;
    calendarMap?: Record<string, CalendarDay>;
    data: employeeAttendance[];
    loading?: boolean;
    error?: string;
};

/* ================================================================
   STATUS TYPES
================================================================ */
type StatusKey =
    | "PRESENT"
    | "WFH"
    | "LEAVE"
    | "INCOMPLETE"
    | "ABSENT"
    | "HOLIDAY"
    | "WEEKEND"
    | "FUTURE";

interface StatusMeta {
    key: StatusKey;
    label: string;
    badgeClass: string;
    rowClass: string;
    dotClass: string;
}

const STATUS_META: Record<StatusKey, Omit<StatusMeta, "key" | "label">> = {
    PRESENT: {
        badgeClass: "bg-emerald-100 text-emerald-700 border border-emerald-200",
        rowClass: "bg-emerald-50/40 hover:bg-emerald-50",
        dotClass: "bg-emerald-500",
    },
    WFH: {
        badgeClass: "bg-violet-100 text-violet-700 border border-violet-200",
        rowClass: "bg-violet-50/40 hover:bg-violet-50",
        dotClass: "bg-violet-500",
    },
    LEAVE: {
        badgeClass: "bg-orange-100 text-orange-700 border border-orange-200",
        rowClass: "bg-orange-50/40 hover:bg-orange-50",
        dotClass: "bg-orange-500",
    },
    INCOMPLETE: {
        badgeClass: "bg-amber-100 text-amber-700 border border-amber-200",
        rowClass: "bg-amber-50/40 hover:bg-amber-50",
        dotClass: "bg-amber-400",
    },
    ABSENT: {
        badgeClass: "bg-rose-100 text-rose-700 border border-rose-200",
        rowClass: "bg-rose-50/40 hover:bg-rose-50",
        dotClass: "bg-rose-500",
    },
    HOLIDAY: {
        badgeClass: "bg-sky-100 text-sky-700 border border-sky-200",
        rowClass: "bg-sky-50/40 hover:bg-sky-50",
        dotClass: "bg-sky-400",
    },
    WEEKEND: {
        badgeClass: "bg-slate-100 text-slate-500 border border-slate-200",
        rowClass: "bg-slate-50/30 hover:bg-slate-50",
        dotClass: "bg-slate-400",
    },
    FUTURE: {
        badgeClass: "bg-gray-100 text-gray-400 border border-gray-200",
        rowClass: "bg-white hover:bg-gray-50",
        dotClass: "bg-gray-300",
    },
};

/* ================================================================
   API FIELD ADAPTER
   Your API returns snake_case fields. employeeAttendance uses camelCase.
   This adapter reads BOTH so the component works regardless of which
   shape arrives — no need to change your type or API.
================================================================ */

function getFields(entry: employeeAttendance & Record<string, any>) {
    return {
        punchIn: entry.punch_in_time ?? entry.checkInTime ?? null,
        punchOut: entry.punch_out_time ?? entry.checkOutTime ?? null,
        workingTime: entry.working_time ?? entry.hoursWorked ?? null,
        workStatus: (entry.work_status ?? entry.workStatus ?? entry.status ?? "")
            .toString().trim().toUpperCase(),
    };
}
// for the resolvestatus
function normalizeDateKey(date: string) {
    return date?.slice(0, 10);
}



function resolveStatus(
    entry: employeeAttendance & Record<string, any>,
    calendarDay: CalendarDay | undefined,
    today: string
): StatusMeta {

    // 1. Holiday
    if (calendarDay?.holiday_name == null || calendarDay.holiday_name.trim() === "") {
        // No holiday name, proceed to next check
    } else {
        return build("HOLIDAY", calendarDay.holiday_name);
    }


    // 2. Weekend — three-way guard so missing calendarMap entries never fall to ABSENT
    const dow = new Date(entry.date).getDay(); // 0 = Sun, 6 = Sat
    if (
        calendarDay?.is_working_day === false ||
        calendarDay?.calendar_type === "WEEKEND" ||
        (!calendarDay && (dow === 0 || dow === 6))
    ) {
        return build("WEEKEND", "Weekend");
    }

    // 3. Future
    if (entry.date > today) {
        return build("FUTURE", "Upcoming");
    }

    // 4–8: Past working day
    const { punchIn, punchOut, workStatus } = getFields(entry);

    if (workStatus === "LEAVE") return build("LEAVE", "On Leave");
    if (workStatus === "WFH") return build("WFH", "Work From Home");

    // WFO = came to office — still check punch state for INCOMPLETE
    if (punchIn && punchOut) return build("PRESENT", "Present");
    if (punchIn && !punchOut) return build("INCOMPLETE", "Incomplete");

    // WFO but somehow no punch recorded — treat as present if work_status confirms it
    if (workStatus === "WFO") return build("PRESENT", "Present");

    return build("ABSENT", "Absent");
}

function build(key: StatusKey, label: string): StatusMeta {
    return { key, label, ...STATUS_META[key] };
}

/* ================================================================
   SUMMARY STATS
================================================================ */

interface SummaryStats {
    present: number;
    absent: number;
    leave: number;
    wfh: number;
    holiday: number;
    weekend: number;
    incomplete: number;
}

/* ================================================================
   COMPONENT
================================================================ */

export default function EmployeeAttendanceSheet({
    onClose,
    onSubmit,
    calendarMap,
    data,
    loading,
    error,
}: EmployeeAttendanceSheetProps) {

    const today = new Date().toISOString().split("T")[0];

    const [localStart, setLocalStart] = useState("");
    const [localEnd, setLocalEnd] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusKey | "ALL">("ALL");

    /* ── calendar warning for date pickers ── */
    const calendarWarning = (date?: string): string | null => {
        if (!date || !calendarMap) return null;
        const cal = calendarMap[date];
        if (!cal) return null;
        if (cal.holiday_name) return `Holiday: ${cal.holiday_name}`;
        if (!cal.is_working_day) return "Non-working day";
        return null;
    };

    /* ── resolve + memoize rows ── */
    const rows = useMemo(() => {
        return (data ?? []).map((entry) => {
            const calendarDay = calendarMap?.[normalizeDateKey(entry.date)];
            const meta = resolveStatus(entry as any, calendarDay, today);
            return { entry, calendarDay, meta };
        });
    }, [data, calendarMap, today]);

    /* ── summary stats ── */
    const stats = useMemo<SummaryStats>(() => {
        const s: SummaryStats = {
            present: 0, absent: 0, leave: 0, wfh: 0,
            holiday: 0, weekend: 0, incomplete: 0,
        };
        rows.forEach(({ meta }) => {
            if (meta.key === "PRESENT") s.present++;
            else if (meta.key === "ABSENT") s.absent++;
            else if (meta.key === "LEAVE") s.leave++;
            else if (meta.key === "WFH") s.wfh++;
            else if (meta.key === "HOLIDAY") s.holiday++;
            else if (meta.key === "WEEKEND") s.weekend++;
            else if (meta.key === "INCOMPLETE") s.incomplete++;
        });
        return s;
    }, [rows]);

    /* ── filtered rows ── */
    const filteredRows = useMemo(() => {
        if (statusFilter === "ALL") return rows;
        return rows.filter((r) => r.meta.key === statusFilter);
    }, [rows, statusFilter]);

    const toggle = (key: StatusKey) =>
        setStatusFilter((prev) => (prev === key ? "ALL" : key));

    /* ── submit ── */
    const handleSubmit = () => {
        if (!localStart || !localEnd) {
            alert("Please select both start and end dates.");
            return;
        }
        onSubmit(localStart, localEnd);
    };

    /* ── excel export ── */
    const handleDownloadExcel = () => {
        const exportData = rows.map(({ entry, meta }) => {
            const f = getFields(entry as any);
            return {
                Date: formatDate(entry.date),
                Day: getWeekday(entry.date),
                "Check In": f.punchIn ?? "—",
                "Check Out": f.punchOut ?? "—",
                "Working Time": f.workingTime ?? "—",
                Status: meta.label,
            };
        });



        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

        const buf = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([buf], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, `attendance-${localStart || "all"}-to-${localEnd || "all"}.xlsx`);
    };

    /* ================================================================
       RENDER
    ================================================================ */

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[88vh] flex flex-col overflow-hidden border border-slate-200">

                {/* ── HEADER ── */}
                <div className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl text-white shadow-sm shadow-blue-200">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-base tracking-tight">
                                Attendance Sheet
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {localStart && localEnd
                                    ? `${formatDate(localStart)} → ${formatDate(localEnd)}`
                                    : "Select a date range to load data"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── DATE RANGE ── */}
                <div className="px-6 py-4 border-b bg-white grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={localStart}
                            max={localEnd || today}
                            onChange={(e) => setLocalStart(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {calendarWarning(localStart) && (
                            <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {calendarWarning(localStart)}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={localEnd}
                            min={localStart || undefined}
                            max={today}
                            onChange={(e) => setLocalEnd(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {calendarWarning(localEnd) && (
                            <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {calendarWarning(localEnd)}
                            </p>
                        )}
                    </div>
                </div>

                {/* ── SUMMARY / FILTER BAR ── */}
                {!loading && rows.length > 0 && (
                    <div className="px-6 py-3 border-b bg-slate-50 flex items-center gap-2 flex-wrap">
                        <TrendingUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <StatPill label="Present" count={stats.present} dot="bg-emerald-500" active={statusFilter === "PRESENT"} onClick={() => toggle("PRESENT")} />
                        <StatPill label="Absent" count={stats.absent} dot="bg-rose-500" active={statusFilter === "ABSENT"} onClick={() => toggle("ABSENT")} />
                        <StatPill label="WFH" count={stats.wfh} dot="bg-violet-500" active={statusFilter === "WFH"} onClick={() => toggle("WFH")} />
                        <StatPill label="Leave" count={stats.leave} dot="bg-orange-500" active={statusFilter === "LEAVE"} onClick={() => toggle("LEAVE")} />
                        <StatPill label="Incomplete" count={stats.incomplete} dot="bg-amber-400" active={statusFilter === "INCOMPLETE"} onClick={() => toggle("INCOMPLETE")} />
                        <StatPill label="Holiday" count={stats.holiday} dot="bg-sky-400" active={statusFilter === "HOLIDAY"} onClick={() => toggle("HOLIDAY")} />
                        <StatPill label="Weekend" count={stats.weekend} dot="bg-slate-400" active={statusFilter === "WEEKEND"} onClick={() => toggle("WEEKEND")} />
                        {statusFilter !== "ALL" && (
                            <button
                                onClick={() => setStatusFilter("ALL")}
                                className="ml-auto text-xs text-blue-600 hover:underline"
                            >
                                Clear filter
                            </button>
                        )}
                    </div>
                )}

                {/* ── BODY ── */}
                <div className="flex-1 overflow-y-auto p-4">

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-400">
                            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                            <p className="text-sm font-medium">Fetching attendance data…</p>
                        </div>
                    )}

                    {!loading && !error && rows.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
                            <Clock className="w-8 h-8" />
                            <p className="text-sm font-medium">
                                No data yet. Select a date range and hit Fetch Data.
                            </p>
                        </div>
                    )}

                    {!loading && filteredRows.length > 0 && (
                        <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                                        <th className="px-4 py-3 text-left">Date</th>
                                        <th className="px-4 py-3 text-left">Day</th>
                                        <th className="px-4 py-3 text-left">Check In</th>
                                        <th className="px-4 py-3 text-left">Check Out</th>
                                        <th className="px-4 py-3 text-left">Hours</th>
                                        <th className="px-4 py-3 text-left">Late By</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredRows.map(({ entry, meta }, i) => {
                                        const f = getFields(entry as any);
                                        const isOffDay = meta.key === "WEEKEND" || meta.key === "HOLIDAY";
                                        return (
                                            <tr key={i} className={`transition-colors ${meta.rowClass}`}>
                                                <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                                                    {formatDate(entry.date)}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                                    {getWeekday(entry.date)}
                                                </td>
                                                <td className="px-4 py-3 text-slate-700 font-mono text-xs">
                                                    {isOffDay ? <span className="text-slate-300">—</span> : (f.punchIn ?? "—")}
                                                </td>
                                                <td className="px-4 py-3 text-slate-700 font-mono text-xs">
                                                    {isOffDay ? <span className="text-slate-300">—</span> : (f.punchOut ?? "—")}
                                                </td>
                                                <td className="px-4 py-3 text-slate-700 font-mono text-xs">
                                                    {isOffDay ? <span className="text-slate-300">—</span> : (f.workingTime ?? "—")}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 text-xs">
                                                    {isOffDay ? <span className="text-slate-300">—</span> : (getLateBy(f.punchIn) ?? "—")}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.badgeClass}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dotClass}`} />
                                                        {meta.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && rows.length > 0 && filteredRows.length === 0 && (
                        <div className="text-center py-10 text-slate-400 text-sm">
                            No records match this filter.
                        </div>
                    )}
                </div>

                {/* ── FOOTER ── */}
                <div className="flex gap-3 px-6 py-4 border-t bg-slate-50">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleDownloadExcel}
                        disabled={rows.length === 0 || !!loading}
                        className="flex-1 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export Excel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!!loading}
                        className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        {loading ? "Loading…" : "Fetch Data"}
                    </button>
                </div>

            </div>
        </div>
    );
}

/* ================================================================
   SUB-COMPONENTS
================================================================ */

function StatPill({
    label, count, dot, active, onClick,
}: {
    label: string;
    count: number;
    dot: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${active
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            {label}
            <span className={`ml-0.5 font-bold ${active ? "text-white/80" : "text-slate-400"}`}>
                {count}
            </span>
        </button>
    );
}

/* ================================================================
   UTILS
================================================================ */

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getWeekday(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, { weekday: "short" });
}


const getLateBy = (punchIn?: string | null): string | null => {
    const SHIFT_START = "10:00";

    if (!punchIn) return null;

    const [inH, inM] = punchIn.split(":").map(Number);
    const [startH, startM] = SHIFT_START.split(":").map(Number);

    const inMinutes = inH * 60 + inM;
    const startMinutes = startH * 60 + startM;

    // Not late
    if (inMinutes <= startMinutes) return null;

    const diff = inMinutes - startMinutes;

    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;

    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
};