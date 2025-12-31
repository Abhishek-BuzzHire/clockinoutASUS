"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, isAfter, isWeekend, isToday, isBefore, startOfDay } from "date-fns";
import axios from "axios";
import Cookies from "js-cookie";

import type { AttendanceRecord, NewEmployee, ShiftConfig } from "@/lib/types";
import AttendanceCalendar from "@/components/attendance/attendanceCalender";
import AttendanceSidebar from "@/components/attendance/attendanceSidebar";
import CompanyHolidays from "@/components/attendance/CompanyHolidays";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AdminAttendancePopupByDate from "@/components/attendance/adminAttendancePopupDate";
import AdminAttendancePopupByName from "@/components/attendance/adminAttendancePopupName";
import AdminAttendancePopupTotals from "@/components/attendance/AdminAttendancePopupTotals";
import { Button } from "@/components/ui/button";
import CorrectionDetailModal from "@/components/attendance/CorrectionDetailModal";
import CorrectionListTable from "@/components/attendance/CorrectionListTable";
import LeaveManagement from "@/components/attendance/leavesManagement";
import AdminLeaveListTable from "@/components/attendance/AdminLeaveListTable";
import AdminLeaveDetailModal from "@/components/attendance/AdminLeaveDetailModal";
import AdminWFHDetailModal from "@/components/attendance/AdminWFHDetailModal";
import AdminWFHListTable from "@/components/attendance/AdminWFHListTable";
import { CheckSquare, ChevronRight, ClipboardList, Filter, Home, Search, Settings2 } from "lucide-react";

const apiUrl = "https://buzzhire.trueledgrr.com"

const ADMIN_EMAIL_WHITELIST = new Set<string>([
  "atul.s.kant@gmail.com",
  "satyajeet@buzzhire.in",
  "ankit@buzzhire.in",
  "saurabh@buzzhire.in",
  "abhishek.buzzhire@gmail.com",
]);


export const SHIFT_CONFIG: ShiftConfig = {
  startTime: "09:30",
  endTime: "19:00",
};

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const AdminAttendancePage = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user?.email && !ADMIN_EMAIL_WHITELIST.has(user?.email)) {
      router.push("/attendance");   // <-- create this page OR redirect home
      return;
    }
  }, [user, loading, router]);

  const tabs = ["Attendance Management", "Leaves Management", "Regulizer Management"];
  const [activeTab, setActiveTab] = useState("Attendance Management");
  const [loadingPage, setLoadingPage] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [employees, setEmployees] = useState<NewEmployee[]>([]);
  const [openPopupDate, setOpenPopupDate] = useState(false);
  const [openPopupName, setOpenPopupName] = useState(false);
  const [openPopupTotal, setOpenPopupTotal] = useState(false);

  const [list, setList] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [selected, setSelected] = useState<any | null>(null);
  const [detail, setDetail] = useState<any | null>(null);

  const [leaves, setLeaves] = useState<any[]>([]);
  const [statusFilterLeaves, setStatusFilterLeaves] = useState<string>("");

  const [selectedLeave, setSelectedLeave] = useState<any | null>(null);

  const [wfhList, setWfhList] = useState<any[]>([]);
  const [statusFilterWfh, setStatusFilterWfh] = useState("");
  const [selectedWFH, setSelectedWFH] = useState<any | null>(null);

  // 🔥 This now stores REAL backend attendance
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, AttendanceRecord[]>
  >({});

  // ✅ Fetch Admin Attendance API
  const fetchAdminAttendance = async (date: Date) => {
    try {
      // EMP IDs to exclude
      const EXCLUDED_EMP_IDS = new Set<number>([4, 5, 9, 12]);

      const token = Cookies.get("access");

      const start = format(startOfMonth(date), "yyyy-MM-dd");
      const end = format(endOfMonth(date), "yyyy-MM-dd");

      const res = await axios.get(
        `${apiUrl}/api/admin/emp-total-details/`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          params: {
            start_date: start,
            end_date: end,
          },
        }
      );

      const apiData = res.data.emps;

      // Build employee list
      setEmployees(
        apiData.map((e: any) => ({
          id: String(e.emp_id),
          name: e.employee_name,
        }))
      );

      const mapped: Record<string, AttendanceRecord[]> = {};

      apiData.forEach((emp: any) => {
        if (EXCLUDED_EMP_IDS.has(emp.emp_id)) return;
        emp.attendance.forEach((day: any) => {
          const dateKey = day.date;
          const thisDate = new Date(dateKey);
          const today = new Date();

          //  Skip weekends
          if (isWeekend(thisDate) && !day.punch_in) return;

          //  Skip future dates
          if (isAfter(thisDate, today)) return;

          if (!mapped[dateKey]) mapped[dateKey] = [];

          mapped[dateKey].push({
            employeeId: String(emp.emp_id),
            date: dateKey,   // ⬅️ REQUIRED

            status: (() => {
              const thisDate = new Date(dateKey);
              const today = new Date();

              const isTodayDate = isToday(thisDate);
              const isPastDay =
                isBefore(
                  startOfDay(thisDate),
                  startOfDay(today)
                );


              if (isPastDay && !day.punch_out) {
                return "absent"
              }
              // 1️⃣ ABSENT — no punch in
              if (!day.punch_in) { return "absent"; };

              // 3️⃣ SHIFT BASED LATE CHECK
              const shiftStart = toMinutes(SHIFT_CONFIG.startTime);  // 09:30 → 570 mins
              const punchInMinutes = toMinutes(day.punch_in);        // example 09:45 → 585 mins

              if (punchInMinutes > shiftStart) return "late";

              // 4️⃣ OTHERWISE PRESENT
              return "present";
            })(),

            checkInTime: day.punch_in || undefined,
            checkOutTime: day.punch_out || undefined,

            hoursWorked: day.total_time
              ? day.total_time
              : undefined,
          });

        });
      });

      setAttendanceRecords(mapped);
      console.log("Admin Attendance Fetched", mapped);
    } catch (err) {
      console.error("Admin Attendance Fetch Failed", err);
    }
  };

  // Load once initially
  useEffect(() => {
    fetchAdminAttendance(currentDate);
  }, []);

  const loadList = async () => {
    try {
      setLoadingPage(true);

      const token = Cookies.get("access");

      const res = await axios.get(`${apiUrl}/api/admin/attendance-regularization/requests/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: statusFilter ? { status: statusFilter } : {}
      });

      setList(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load requests");
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    loadList();
  }, [statusFilter]);

  const openDetail = async (token: string) => {
    try {
      const tkn = Cookies.get("access");
      const res = await axios.get(`${apiUrl}/api/admin/attendance-approval/${token}`, {
        headers: { Authorization: `Bearer ${tkn}` }
      });
      setSelected(token);
      setDetail(res.data.data);
    } catch (err) {
      alert("Failed to fetch detail");
    }
  };

  const takeAction = async (action: "APPROVE" | "REJECT", comment: string) => {
    try {
      const token = Cookies.get("access");

      const res = await axios.post(
        `${apiUrl}/api/admin/attendance-approval/${selected}/action/`,
        {
          action,
          admin_comment: comment
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(res.data.message);
      setDetail(null);
      setSelected(null);
      loadList();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Action failed");
    }
  };

  const loadLeaves = async () => {
    try {
      setLoadingPage(true);
      const token = Cookies.get("access");

      const res = await axios.get(
        `${apiUrl}/api/admin/leaves/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: statusFilterLeaves ? { status: statusFilterLeaves } : {}
        }
      );

      setLeaves(res.data.results || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch leave requests");
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [statusFilterLeaves]);

  const takeActionLeaves = async (leaveId: number, action: "APPROVE" | "REJECT") => {
    try {
      const token = Cookies.get("access");

      const res = await axios.post(
        `${apiUrl}/api/admin/leaves/${leaveId}/action/`,
        { action },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert(res.data.message);
      setSelectedLeave(null);
      loadLeaves();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Action failed");
    }
  };

  const loadWFHRequests = async () => {
    try {
      setLoadingPage(true);
      const token = Cookies.get("access");

      const res = await axios.get(
        `${apiUrl}/wfh/admin/requests/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: statusFilterWfh ? { status: statusFilterWfh } : {}
        }
      );

      setWfhList(res.data.results || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load WFH requests");
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    loadWFHRequests();
  }, [statusFilterWfh]);

  const takeActionWfh = async (wfhId: number, action: "APPROVE" | "REJECT") => {
    try {
      const token = Cookies.get("access");

      const res = await axios.post(
        `${apiUrl}/wfh/admin/action/${wfhId}/`,
        { action },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert(res.data.message);
      setSelectedWFH(null);
      loadWFHRequests();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Action failed");
    }
  };


  // When month changes via calendar
  const handleMonthChange = (newMonth: Date) => {
    setCurrentDate(newMonth);
    fetchAdminAttendance(newMonth);
    setSelectedDate(newMonth);
  };

  const recordsForSelectedDate =
    attendanceRecords[format(selectedDate, "yyyy-MM-dd")] || [];

  const renderContent = () => {
    switch (activeTab) {
      case "Attendance Management":
        return (
          <div className="flex flex-col min-h-screen gap-8">
            <div className="text-2xl text-gray-900 space-x-4 flex justify-between">
              Attendance Manangement
              <div className="flex gap-4">
                <Button variant={"default"} onClick={() => setOpenPopupDate(true)} className="bg-blue-700 text-white">
                  View Full Attendance Grouped By Date
                </Button>

                {openPopupDate && <AdminAttendancePopupByDate onClose={() => setOpenPopupDate(false)} />}

                <Button variant={"default"} onClick={() => setOpenPopupName(true)} className="bg-blue-700 text-white">
                  View Full Attendance Grouped By Name
                </Button>

                {openPopupName && <AdminAttendancePopupByName onClose={() => setOpenPopupName(false)} />}
                <Button variant={"outline"} onClick={() => setOpenPopupTotal(true)} className="bg-blue-700 text-white">
                  View Total Working Hours
                </Button>

                {openPopupTotal && <AdminAttendancePopupTotals onClose={() => setOpenPopupTotal(false)} />}
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="grid grid-cols-1 xl:grid-cols-3 xl:gap-4">
                <div className="xl:col-span-2 mb-8">
                  <AttendanceCalendar
                    currentDate={currentDate}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    onMonthChange={handleMonthChange}
                    attendanceRecords={attendanceRecords}
                    totalEmployees={employees.length}
                  />
                </div>

                <div className="pb-4 xl:p-0 xl:pr-4 space-y-4">
                  <AttendanceSidebar
                    selectedDate={selectedDate}
                    dailyRecords={recordsForSelectedDate}
                    employees={employees}
                  />

                  <CompanyHolidays />
                </div>
              </div>
            </div>
          </div>
        );

      case "Leaves Management":

        return (
          <div className="flex flex-col min-h-screen gap-6 bg-slate-50/50 p-6">

            {/* PAGE HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl tracking-tight flex items-center gap-2">
                  Leaves Management
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  Review and process employee absence requests across the organization.
                </p>
              </div>

              {/* QUICK STATS (Optional visual flair) */}
              <div className="hidden lg:flex items-center gap-4">
                <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Requests</p>
                  <p className="text-lg font-black text-slate-800 text-right">{leaves.length}</p>
                </div>
              </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

              {/* FILTER BAR */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search employee or reason..."
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5" /> Filter Status:
                  </label>
                  <select
                    value={statusFilterLeaves}
                    onChange={e => setStatusFilterLeaves(e.target.value)}
                    className="flex-1 sm:flex-none border border-slate-200 bg-white rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer hover:border-blue-300"
                  >
                    <option value="">All Applications</option>
                    <option value="PENDING">Pending Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* TABLE/CARD CONTAINER */}
              <div className="p-6">
                <div className="mb-4 flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <ClipboardList className="w-3.5 h-3.5" />
                  Request Queue
                </div>

                <AdminLeaveListTable
                  loading={loading}
                  leaves={leaves}
                  onView={(leave) => setSelectedLeave(leave)}
                />
              </div>
            </div>

            {/* MODAL OVERLAY */}
            {selectedLeave && (
              <AdminLeaveDetailModal
                leave={selectedLeave}
                onClose={() => setSelectedLeave(null)}
                onApprove={() => takeActionLeaves(selectedLeave.leave_id, "APPROVE")}
                onReject={() => takeActionLeaves(selectedLeave.leave_id, "REJECT")}
              />
            )}
          </div>
        );

      case "Regulizer Management":
        return (
          <div className="flex flex-col min-h-screen gap-8 bg-slate-50/50 p-6">

            {/* PAGE TITLE & BREADCRUMBS */}
            <div className="px-2">
              <h1 className="text-2xl text-slate-800 tracking-tight">Request Management</h1>
            </div>

            {/* --- SECTION 1: ATTENDANCE CORRECTION --- */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-semibold text-slate-800 leading-tight">Attendance Corrections</h2>
                    <p className="text-xs text-slate-400 uppercase tracking-widest">Adjustment Queue</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Filter className="w-3 h-3" /> Filter
                  </label>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="flex-1 sm:flex-none border border-slate-200 bg-white rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer hover:border-blue-300"
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="p-6">
                <CorrectionListTable
                  loading={loadingPage}
                  list={list}
                  onView={openDetail}
                />
              </div>
            </div>

            {/* --- SECTION 2: WFH REQUESTS --- */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <Home className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-semibold text-slate-800 leading-tight">WFH Requests</h2>
                    <p className="text-xs text-slate-400 uppercase tracking-widest">Remote Work Log</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Filter className="w-3 h-3" /> Filter
                  </label>
                  <select
                    value={statusFilterWfh}
                    onChange={e => setStatusFilterWfh(e.target.value)}
                    className="flex-1 sm:flex-none border border-slate-200 bg-white rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer hover:border-indigo-300"
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING"> Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="p-6">
                <AdminWFHListTable
                  loading={loadingPage}
                  list={wfhList}
                  onView={(req) => setSelectedWFH(req)}
                />
              </div>
            </div>

            {/* MODALS */}
            {detail && (
              <CorrectionDetailModal
                data={detail}
                onClose={() => setDetail(null)}
                onAction={takeAction}
              />
            )}

            {selectedWFH && (
              <AdminWFHDetailModal
                wfh={selectedWFH}
                onClose={() => setSelectedWFH(null)}
                onApprove={() => takeActionWfh(selectedWFH.wfh_id, "APPROVE")}
                onReject={() => takeActionWfh(selectedWFH.wfh_id, "REJECT")}
              />
            )}
          </div>
        );

      default:
        return <></>;
    }
  };

  return (
    <div className="w-full bg-sky-50 p-4 relative">
      <div className="text-lg">
        <div className="flex space-x-8 text-xs font-bold border-b border-gray-300 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`p-2 ${activeTab === tab
                ? "border-b-2 border-blue-600"
                : "text-gray-500"
                }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default AdminAttendancePage;
