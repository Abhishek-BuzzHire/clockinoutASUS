import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { format } from "date-fns";
// Optional: If you use lucide-react for icons
import { Calendar, FileText, X, Clock, User, Download, Users, Search, CheckCircle2, ChevronDown } from "lucide-react";

interface AttendanceDay {
    date: string;
    punch_in: string | null;
    punch_out: string | null;
    total_time: string | null;
}

interface EmployeeAttendance {
    emp_id: number;
    employee_name: string;
    attendance: AttendanceDay[];
}

export default function AdminAttendancePopupByDate({ onClose }: { onClose: () => void }) {
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [grouped, setGrouped] = useState<Record<string, any[]>>({});
    const [employees, setEmployees] = useState<{ id: number, name: string }[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadEmployees = async () => {
            const token = Cookies.get("access");
            const EXCLUDED_EMP_IDS = new Set<number>([4, 5, 9, 12]);

            const res = await axios.get(
                "https://buzzhire.trueledgrr.com/api/admin/emp-total-details/",
                {
                    headers: { Authorization: token ? `Bearer ${token}` : "" },
                    params: { start_date: "2025-01-01" } // any valid — just to get list
                }
            );

            const list = res.data.emps
                .filter((e: any) => !EXCLUDED_EMP_IDS.has(e.emp_id))   // ⬅️ filter here
                .map((e: any) => ({
                    id: e.emp_id,
                    name: e.employee_name
                }));

            setEmployees(list);
        };

        loadEmployees();
    }, []);


    const downloadCSV = () => {
        if (Object.keys(grouped).length === 0) return;

        // 1. Define CSV Headers
        const headers = ["Date", "Employee Name", "Punch In", "Punch Out", "Total Time"];

        // 2. Build the rows
        const rows = Object.keys(grouped)
            .sort()
            .flatMap((date) =>
                grouped[date].map((rec) => [
                    date,
                    `"${rec.employee_name}"`, // Wrap in quotes in case a name has a comma
                    rec.punch_in || "-",
                    rec.punch_out || "-",
                    rec.total_time || "-",
                ])
            );

        // 3. Combine headers and rows into a single string
        const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");

        // 4. Create a Blob and trigger download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.setAttribute("href", url);
        link.setAttribute("download", `Attendance_Report_${startDate}_to_${endDate}.csv`);
        link.style.visibility = "hidden";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const fetchAttendance = async () => {
        if (!startDate) return alert("Select start date");

        try {
            const EXCLUDED_EMP_IDS = new Set<number>([4, 5, 9, 12]);
            setLoading(true);
            const token = Cookies.get("access");

            const params: any = {
                start_date: format(new Date(startDate), "yyyy-MM-dd"),
            };

            if (endDate) {
                params.end_date = format(new Date(endDate), "yyyy-MM-dd");
            }

            if (selectedIds.length > 0) {
                params.ids = selectedIds.join(",");
            } else {
                params.ids = "";   // fetch all
            }

            const res = await axios.get(
                "https://buzzhire.trueledgrr.com/api/admin/emp-total-details/",
                {
                    headers: { Authorization: token ? `Bearer ${token}` : "" },
                    params
                }
            );

            const emps: EmployeeAttendance[] = res.data.emps || [];
            const byDate: Record<string, any[]> = {};

            emps.forEach(emp => {
                if (EXCLUDED_EMP_IDS.has(emp.emp_id)) return;
                emp.attendance.forEach(day => {
                    if (!byDate[day.date]) byDate[day.date] = [];
                    byDate[day.date].push({
                        emp_id: emp.emp_id,
                        employee_name: emp.employee_name,
                        punch_in: day.punch_in,
                        punch_out: day.punch_out,
                        total_time: day.total_time
                    });
                });
            });

            setGrouped(byDate);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch attendance");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6">
            <div className="flex flex-col w-full max-w-5xl bg-white shadow-2xl rounded-2xl overflow-hidden max-h-[90vh]">

                {/* MODAL HEADER & FILTERS (Sticky) */}
                <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
                    <div className="px-6 py-4 flex items-center justify-between bg-slate-50/50">
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Attendance Report
                            </h2>
                            <p className="text-sm text-slate-500">Grouped records by date</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-red-200 rounded-full transition-colors text-slate-400 hover:text-red-600"
                        >
                            <X className="w-5 h-5 hover:text-red-600" />
                        </button>
                    </div>

                    <div className="px-6 py-4 flex flex-wrap items-end gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Start Date</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    className="pl-3 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">End Date</label>
                            <input
                                type="date"
                                className="pl-3 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 w-full max-w-xs relative" ref={dropdownRef}>
                            {/* 1. Label & Counter */}
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5" />
                                    Select Employees
                                </label>
                                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase">
                                    {selectedIds.length} Selected
                                </span>
                            </div>

                            {/* 2. Dropdown Trigger Button */}
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`w-full flex items-center justify-between px-3 py-2 text-sm border rounded-lg bg-white transition-all shadow-sm
      ${isDropdownOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-300 hover:border-slate-400'}`}
                            >
                                <span className="text-slate-700 truncate">
                                    {selectedIds.length === 0 ? 'Choose team members...' : `${selectedIds.length} employees selected`}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* 3. The Floating List (Pops up when isDropdownOpen is true) */}
                            {isDropdownOpen && (
                                <div className="absolute z-50 top-[calc(100%+4px)] left-0 w-full overflow-hidden border border-slate-200 rounded-xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-100">

                                    {/* Search Header */}
                                    <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                                        <Search className="w-3.5 h-3.5 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search team..."
                                            className="bg-transparent text-xs outline-none w-full text-slate-600"
                                            autoFocus
                                        />
                                    </div>

                                    {/* Scrollable List */}
                                    <div className="max-h-[220px] overflow-y-auto custom-scrollbar p-1">
                                        {employees.map((emp) => {
                                            const isSelected = selectedIds.includes(emp.id);
                                            return (
                                                <label
                                                    key={emp.id}
                                                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all mb-0.5
                ${isSelected ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                                                            checked={isSelected}
                                                            onChange={() => {
                                                                if (isSelected) {
                                                                    setSelectedIds(selectedIds.filter(id => id !== emp.id));
                                                                } else {
                                                                    setSelectedIds([...selectedIds, emp.id]);
                                                                }
                                                            }}
                                                        />
                                                        <span className="text-sm">{emp.name}</span>
                                                    </div>
                                                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-500 shadow-sm" />}
                                                </label>
                                            );
                                        })}
                                    </div>

                                    {/* Footer / Quick Actions */}
                                    <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center">
                                        <button
                                            onClick={() => setSelectedIds([])}
                                            className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase px-2 py-1"
                                        >
                                            Clear All
                                        </button>
                                        <button
                                            onClick={() => setSelectedIds(employees.map(e => e.id))}
                                            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase px-2 py-1"
                                        >
                                            Select All
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={fetchAttendance}
                            disabled={loading}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-all shadow-md shadow-blue-200"
                        >
                            {loading ? "Fetching..." : "Fetch Data"}
                        </button>
                    </div>

                </div>

                {/* SCROLLABLE DATA AREA */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                    {Object.keys(grouped).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <Calendar className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium">No records to display</p>
                            <p className="text-sm">Select a date range and click fetch</p>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {Object.keys(grouped)
                                .sort()
                                .map(date => (
                                    <div key={date} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                        {/* Date Section Header */}
                                        <div className="px-4 py-3 bg-slate-800 text-white flex items-center justify-between">
                                            <h3 className="font-semibold tracking-wide flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-blue-400" />
                                                {format(new Date(date), "EEEE, MMMM do, yyyy")}
                                            </h3>
                                            <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300 uppercase">
                                                {grouped[date].length} Employees
                                            </span>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50 border-b border-slate-200">
                                                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Employee</th>
                                                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Punch In</th>
                                                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Punch Out</th>
                                                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-right">Hours</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {grouped[date].map((rec: any, idx) => (
                                                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                                        {rec.employee_name.charAt(0)}
                                                                    </div>
                                                                    <span className="text-sm font-medium text-slate-700">{rec.employee_name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-slate-600 font-mono">
                                                                {rec.punch_in || <span className="text-slate-300 italic">--:--</span>}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-slate-600 font-mono">
                                                                {rec.punch_out || <span className="text-slate-300 italic">--:--</span>}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-right font-semibold text-slate-800">
                                                                {rec.total_time ? (
                                                                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded">
                                                                        <Clock className="w-3 h-3" />
                                                                        {rec.total_time}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-slate-300">--</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
                    <p>© 2025 BuzzHire Attendance System</p>
                    <div className="flex gap-4">
                        {Object.keys(grouped).length > 0 && (
                            <button onClick={downloadCSV} className="flex items-center gap-1 text-blue-600 font-bold hover:underline">
                                <Download className="w-3 h-3" />
                                Download CSV
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}