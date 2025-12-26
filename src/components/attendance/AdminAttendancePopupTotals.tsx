import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { format } from "date-fns";
import { FileText, X, Users, ChevronDown, Search, CheckCircle2, Download, Clock } from "lucide-react";

interface AttendanceDay {
    date: string;
    total_time: string | null;
}

interface EmployeeAttendance {
    emp_id: number;
    employee_name: string;
    attendance: AttendanceDay[];
}

export default function AdminAttendancePopupTotals({ onClose }: { onClose: () => void }) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);

    const [employees, setEmployees] = useState<{ id: number, name: string }[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [totals, setTotals] = useState<
        { id: number; name: string; totalMinutes: number }[]
    >([]);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const EXCLUDED_EMP_IDS = new Set<number>([4, 5, 9, 12]);

    // ---------- Load Employee List ----------
    useEffect(() => {
        const loadEmployees = async () => {
            const token = Cookies.get("access");

            const res = await axios.get(
                "https://buzzhire.trueledgrr.com/api/admin/emp-total-details/",
                {
                    headers: { Authorization: token ? `Bearer ${token}` : "" },
                    params: { start_date: "2025-01-01" }
                }
            );

            const list = res.data.emps
                .filter((e: any) => !EXCLUDED_EMP_IDS.has(e.emp_id))
                .map((e: any) => ({
                    id: e.emp_id,
                    name: e.employee_name
                }));

            setEmployees(list);
        };

        loadEmployees();
    }, []);

    // ---------- Helpers ----------
    const toMinutes = (time: string) => {
        const parts = time.split(":").map(Number);
        if (parts.length === 3) return parts[0] * 60 + parts[1];
        if (parts.length === 2) return parts[0] * 60 + parts[1];
        return 0;
    };

    const minutesToHHMM = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };

    // ---------- Fetch ----------
    const fetchAttendance = async () => {
        if (!startDate) return alert("Select start date");

        try {
            setLoading(true);
            const token = Cookies.get("access");

            const params: any = {
                start_date: format(new Date(startDate), "yyyy-MM-dd"),
            };

            if (endDate) params.end_date = format(new Date(endDate), "yyyy-MM-dd");

            if (selectedIds.length > 0) params.ids = selectedIds.join(",");
            else params.ids = "";

            const res = await axios.get(
                "https://buzzhire.trueledgrr.com/api/admin/emp-total-details/",
                {
                    headers: { Authorization: token ? `Bearer ${token}` : "" },
                    params
                }
            );

            const emps: EmployeeAttendance[] = res.data.emps || [];

            const computed = emps
                .filter(e => !EXCLUDED_EMP_IDS.has(e.emp_id))
                .map(emp => {
                    let totalMinutes = 0;

                    emp.attendance.forEach(day => {
                        if (day.total_time)
                            totalMinutes += toMinutes(day.total_time);
                    });

                    return {
                        id: emp.emp_id,
                        name: emp.employee_name,
                        totalMinutes
                    };
                })
                .sort((a, b) => b.totalMinutes - a.totalMinutes);

            setTotals(computed);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    // ---------- CSV ----------
    const downloadCSV = () => {
        if (totals.length === 0) return;

        const headers = ["Employee Name", "Total Hours"];
        const rows = totals.map(t => [
            `"${t.name}"`,
            minutesToHHMM(t.totalMinutes)
        ]);

        const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download =
            `Total_Working_Hours_${startDate}_to_${endDate || "current"}.csv`;
        link.click();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6">
            <div className="flex flex-col w-full max-w-4xl bg-white shadow-2xl rounded-2xl overflow-hidden max-h-[90vh]">

                {/* 1. HEADER (Sticky) */}
                <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
                    <div className="px-6 py-4 flex items-center justify-between bg-slate-50/50">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Total Working Hours
                            </h2>
                            <p className="text-sm text-slate-500 font-medium">
                                Sum of working hours in selected range
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* 2. FILTER BAR */}
                    <div className="px-6 py-4 flex flex-wrap items-end gap-6 bg-white">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="pl-3 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="pl-3 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
                            />
                        </div>

                        {/* EMPLOYEE SELECT DROPDOWN (Floating Style) */}
                        <div className="flex flex-col gap-1.5 w-full max-w-xs relative" ref={dropdownRef}>
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5" /> Select Employees
                                </label>
                                <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase">
                                    {selectedIds.length} Selected
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`w-full flex items-center justify-between px-3 py-2 text-sm border rounded-lg bg-white transition-all shadow-sm
                          ${isDropdownOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-300 hover:border-slate-400'}`}
                            >
                                <span className="text-slate-700 truncate">
                                    {selectedIds.length === 0 ? "Choose team members..." : `${selectedIds.length} team members`}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute z-50 top-[calc(100%+4px)] left-0 w-full overflow-hidden border border-slate-200 rounded-xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-100">
                                    {/* Search in Dropdown */}
                                    {/* List */}
                                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                                        {employees.map(emp => {
                                            const checked = selectedIds.includes(emp.id);
                                            return (
                                                <label key={emp.id} className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all mb-0.5 ${checked ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-slate-50 text-slate-600"}`}>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                                                            checked={checked}
                                                            onChange={() => {
                                                                if (checked) setSelectedIds(selectedIds.filter(i => i !== emp.id));
                                                                else setSelectedIds([...selectedIds, emp.id]);
                                                            }}
                                                        />
                                                        <span className="text-sm">{emp.name}</span>
                                                    </div>
                                                    {checked && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {/* Dropdown Footer */}
                                    <div className="flex justify-between px-3 py-2 border-t border-slate-100 bg-slate-50/30">
                                        <button onClick={() => setSelectedIds([])} className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase px-2 py-1">Clear</button>
                                        <button onClick={() => setSelectedIds(employees.map(e => e.id))} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase px-2 py-1">Select All</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={fetchAttendance}
                            disabled={loading}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-all shadow-md shadow-blue-100 ml-auto"
                        >
                            {loading ? "Fetching..." : "Fetch Data"}
                        </button>
                    </div>
                </div>

                {/* 3. DATA BODY */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar">
                    {totals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                            <Clock className="w-16 h-16 mb-4 opacity-10" />
                            <p className="text-lg font-semibold opacity-40">No data loaded</p>
                            <p className="text-sm opacity-40">Select date range and employees to calculate totals</p>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Employee Name</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Accumulated Hours</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {totals.map(emp => (
                                        <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-slate-700">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold border border-slate-200">
                                                        {emp.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700">{emp.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold">
                                                    <Clock className="w-4 h-4" />
                                                    {minutesToHHMM(emp.totalMinutes)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* 4. FOOTER */}
                <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
                    <p>© 2025 BuzzHire Attendance System</p>

                    {totals.length > 0 && (
                        <button onClick={downloadCSV} className="flex items-center gap-1 text-blue-600 font-bold hover:underline">
                            <Download className="w-3 h-3" />
                            Download CSV
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
