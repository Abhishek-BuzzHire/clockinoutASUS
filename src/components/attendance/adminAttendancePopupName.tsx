import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { format } from "date-fns";
import { FileText, X, Calendar, Clock, Users, Search, CheckCircle2, ChevronDown, Download } from "lucide-react";

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

export default function AdminAttendancePopupByName({ onClose }: { onClose: () => void }) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [employees, setEmployees] = useState<{ id: number, name: string }[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [grouped, setGrouped] = useState<Record<number, any>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadEmployees = async () => {
      const token = Cookies.get("access");
      const EXCLUDED_EMP_IDS = new Set<number>([4, 5, 9, 12]);

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

  const fetchAttendance = async () => {
    if (!startDate) return alert("Select start date");

    try {
      const EXCLUDED_EMP_IDS = new Set<number>([4, 5, 9, 12]);
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
      const byEmployee: Record<number, any> = {};

      emps.forEach(emp => {
        if (EXCLUDED_EMP_IDS.has(emp.emp_id)) return;

        byEmployee[emp.emp_id] = {
          id: emp.emp_id,
          name: emp.employee_name,
          records: emp.attendance.sort((a, b) => a.date.localeCompare(b.date))
        };
      });

      setGrouped(byEmployee);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (Object.keys(grouped).length === 0) return;

    const headers = ["Employee", "Date", "Punch In", "Punch Out", "Total Time"];

    const rows = Object.values(grouped).flatMap((emp: any) =>
      emp.records.map((rec: any) => [
        `"${emp.name}"`,
        rec.date,
        rec.punch_in || "-",
        rec.punch_out || "-",
        rec.total_time || "-"
      ])
    );

    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Attendance_By_Employee_${startDate}_to_${endDate || "current"}.csv`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6">
      <div className="flex flex-col w-full max-w-5xl bg-white shadow-2xl rounded-2xl overflow-hidden max-h-[90vh]">

        {/* 1. HEADER (Sticky) */}
        <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <FileText className="w-5 h-5 text-blue-600" />
                Attendance Report
              </h2>
              <p className="text-sm text-slate-500 font-medium">Detailed logs grouped by employee</p>
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
            {/* Start Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="pl-3 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="pl-3 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
              />
            </div>

            {/* EMPLOYEE DROPDOWN */}
            <div className="flex flex-col gap-1.5 w-full max-w-xs relative" ref={dropdownRef}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Select Employees
                </label>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                  {selectedIds.length} SELECTED
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

              {/* Floating Pop-up List */}
              {isDropdownOpen && (
                <div className="absolute z-50 top-[calc(100%+4px)] left-0 w-full overflow-hidden border border-slate-200 rounded-xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-100">

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
                  <div className="flex justify-between px-3 py-2 border-t border-slate-100 bg-slate-50/30">
                    <button onClick={() => setSelectedIds([])} className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase">Clear</button>
                    <button onClick={() => setSelectedIds(employees.map(e => e.id))} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase">Select All</button>
                  </div>
                </div>
              )}
            </div>

            {/* FETCH BUTTON */}
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
          {Object.keys(grouped).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Calendar className="w-16 h-16 mb-4 opacity-10" />
              <p className="text-lg font-semibold opacity-40">No records found</p>
              <p className="text-sm opacity-40">Select dates and employees to generate report</p>
            </div>
          ) : (
            <div className="space-y-10">
              {Object.values(grouped).map((emp: any) => (
                <div key={emp.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Employee Header Row */}
                  <div className="px-5 py-3 bg-slate-800 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-500/30">
                        {emp.name.charAt(0)}
                      </div>
                      <h3 className="font-bold tracking-wide">{emp.name}</h3>
                    </div>
                    <span className="text-[10px] font-bold bg-slate-700 px-2 py-1 rounded text-slate-300 uppercase tracking-widest">
                      {emp.records.length} Working Days
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200">
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Day</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Punch In</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Punch Out</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Duration</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {emp.records.map((rec: any, idx: number) => (
                          <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-6 py-3 text-sm font-medium text-slate-600">
                              {rec.date}
                            </td>
                            <td className="px-6 py-3 text-sm font-medium text-slate-600">
                              {format(new Date(rec.date), "EEEE")}
                            </td>
                            <td className="px-6 py-3 text-sm font-mono text-slate-500">
                              {rec.punch_in || <span className="text-slate-200">--:--</span>}
                            </td>
                            <td className="px-6 py-3 text-sm font-mono text-slate-500">
                              {rec.punch_out || <span className="text-slate-200">--:--</span>}
                            </td>
                            <td className="px-6 py-3 text-right">
                              {rec.total_time ? (
                                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-md text-xs font-bold">
                                  <Clock className="w-3.5 h-3.5" />
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

        {/* 4. FOOTER */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
          <p>© 2025 BuzzHire Attendance System</p>

          {Object.keys(grouped).length > 0 && (
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
