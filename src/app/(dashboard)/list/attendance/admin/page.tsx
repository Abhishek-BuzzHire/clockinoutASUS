"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, isAfter, isWeekend, isToday, isBefore, startOfDay } from "date-fns";
import axios from "axios";
import Cookies from "js-cookie";

import type { AttendanceRecord, CalendarDay, NewEmployee, ShiftConfig } from "@/lib/types";
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
import { AdminAttendancePivotReport, AdminHolidayOverridePage, AdminHolidayPage, AdminWorkingRulesPage } from "../../createNew/companyWork/page";
import AdminAttendancePivotReportModal from "@/components/attendance/AttendancePivotReportModel";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

type DaySummary = {
  present: number;
  absent: number;
  leave: number;
};

export type AttendanceDay = {
  records: AttendanceRecord[];
  summary: DaySummary;
};

export const SHIFT_CONFIG: ShiftConfig = {
  startTime: "09:30",
  endTime: "19:00",
};

export const toMinutes = (time: string) => {
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
    if (user && user.role !== "admin") {
      router.push("/list/attendance/employee");
      return;
    }
  }, [user, loading, router]);

  const [calendarMap, setCalendarMap] = useState<Record<string, CalendarDay>>({});

  const tabs = ["Attendance", "Leave", "Regularization", "Company Holidays & Rules"];
  const [activeTab, setActiveTab] = useState("Attendance");
  const [loadingPage, setLoadingPage] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [employees, setEmployees] = useState<NewEmployee[]>([]);
  const [openPopupDate, setOpenPopupDate] = useState(false);
  const [openPopupName, setOpenPopupName] = useState(false);
  const [openPopupTotal, setOpenPopupTotal] = useState(false);
  const [openPopupPivot, setOpenPopupPivot] = useState(false);

  const [list, setList] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");

  const [selected, setSelected] = useState<any | null>(null);
  const [detail, setDetail] = useState<any | null>(null);

  const [leaves, setLeaves] = useState<any[]>([]);
  const [statusFilterLeaves, setStatusFilterLeaves] = useState<string>("PENDING");

  const [selectedLeave, setSelectedLeave] = useState<any | null>(null);

  const [wfhList, setWfhList] = useState<any[]>([]);
  const [statusFilterWfh, setStatusFilterWfh] = useState("PENDING");
  const [selectedWFH, setSelectedWFH] = useState<any | null>(null);

  // 🔥 This now stores REAL backend attendance
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, AttendanceDay>
  >({});

  const fetchCompanyCalendar = async (date: Date) => {
    try {
      const token = Cookies.get("access");

      const start = format(startOfMonth(date), "yyyy-MM-dd");
      const end = format(endOfMonth(date), "yyyy-MM-dd");

      const res = await axios.get(
        `${apiUrl}/api/company-calendar`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          params: {
            start_date: start,
            end_date: end,
          },
        }
      );

      const map: Record<string, CalendarDay> = {};
      res.data.calendar.forEach((day: CalendarDay) => {
        map[day.date] = day;
      });

      setCalendarMap(map);
    } catch (err) {
      console.error("Calendar Fetch Failed", err);
    }
  };

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

      const mapped: Record<string, AttendanceDay> = {};

      apiData.forEach((emp: any) => {
        if (EXCLUDED_EMP_IDS.has(emp.emp_id)) return;

        emp.attendance.forEach((day: any) => {
          const dateKey = day.date;
          const thisDate = new Date(dateKey);
          const today = new Date();

          const calendarDay = calendarMap[dateKey];

          const isWorkingDay = calendarDay?.is_working_day ?? true;
          const isLeave = day.work_status === "LEAVE";
          const isWFH = day.work_status === "WFH";
          const isWFO = day.work_status === "WFO";
          const hasPunch = !!day.punch_in;
          const isPastDay = isBefore(startOfDay(thisDate), startOfDay(today));
          const isFutureDay = isAfter(startOfDay(thisDate), startOfDay(today));

          let status: "present" | "absent" | "leave" | null = null;
          let lateBy: string | null = null;

          if (isLeave) {
            status = "leave";
          }

          // Future days → only leave allowed
          else if (isFutureDay) {
            status = null;
          }

          // Past days (excluding today)
          else if (isPastDay) {
            if (!hasPunch) {
              // No punch-in at all
              status = "absent";
            }
            else if (hasPunch && !day.punch_out) {
              // Punch-in but no punch-out
              status = "absent";
            }
            else {
              // Both punch-in and punch-out
              status = "present";

              // Late calculation (optional)
              const shiftStart = toMinutes(SHIFT_CONFIG.startTime);
              const punchMinutes = toMinutes(day.punch_in);

              if (punchMinutes > shiftStart + 30) {
                const diff = punchMinutes - shiftStart;
                const hrs = Math.floor(diff / 60);
                const mins = diff % 60;
                lateBy = `${hrs > 0 ? `${hrs}h ` : ""}${mins}m`;
              }
            }
          }

          // Today
          else {
            if (hasPunch) {
              // Punch-in today → present even if not punched out yet
              status = "present";

              const shiftStart = toMinutes(SHIFT_CONFIG.startTime);
              const punchMinutes = toMinutes(day.punch_in);

              if (punchMinutes > shiftStart + 30) {
                const diff = punchMinutes - shiftStart;
                const hrs = Math.floor(diff / 60);
                const mins = diff % 60;
                lateBy = `${hrs > 0 ? `${hrs}h ` : ""}${mins}m`;
              }
            } else {
              // No punch yet today → don't mark absent yet
              status = null;
            }
          }

          if (!mapped[dateKey]) {
            mapped[dateKey] = {
              records: [],
              summary: { present: 0, absent: 0, leave: 0 }
            };
          }

          const record = {
            employeeId: String(emp.emp_id),
            date: dateKey,
            status,
            lateBy,
            workStatus: day.work_status || null,
            checkInTime: day.punch_in || undefined,
            checkOutTime: day.punch_out || undefined,
            hoursWorked: day.total_time || undefined,
          };

          mapped[dateKey].records.push(record);

          if (isFutureDay) {
            if (status === "leave") {
              mapped[dateKey].summary.leave++;
            }
          } else {
            if (status === "present") mapped[dateKey].summary.present++;
            if (status === "absent") mapped[dateKey].summary.absent++;
            if (status === "leave") mapped[dateKey].summary.leave++;
          }
        });
      });
      setAttendanceRecords(mapped);
      //   console.log("Admin Attendance Fetched", mapped);
    } catch (err) {
      console.error("Admin Attendance Fetch Failed", err);
    }
  };

  // Load once initially
  useEffect(() => {
    const load = async () => {
      await fetchCompanyCalendar(currentDate);
      await fetchAdminAttendance(currentDate);
    };
    load();
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
  const handleMonthChange = async (newMonth: Date) => {
    setCurrentDate(newMonth);
    setSelectedDate(newMonth);
    await fetchCompanyCalendar(newMonth);
    await fetchAdminAttendance(newMonth);
  };

  const recordsForSelectedDate =
    attendanceRecords[format(selectedDate, "yyyy-MM-dd")]?.records || [];

  const renderContent = () => {
    switch (activeTab) {
      case "Attendance":
        return (
          <div className="flex flex-col min-h-screen gap-8">
            <div className="text-2xl text-gray-900 space-x-4 flex justify-between">
              Attendance Management
              <div className="flex gap-4">
                <Button variant={"default"} onClick={() => setOpenPopupDate(true)} className="bg-blue-700 text-white">
                  Attendnace Report (Date Wise)
                </Button>
                {openPopupDate && <AdminAttendancePopupByDate onClose={() => setOpenPopupDate(false)} />}

                <Button variant={"default"} onClick={() => setOpenPopupName(true)} className="bg-blue-700 text-white">
                  Attendnace Report (Name Wise)
                </Button>
                {openPopupName && <AdminAttendancePopupByName onClose={() => setOpenPopupName(false)} />}

                <Button variant={"outline"} onClick={() => setOpenPopupTotal(true)} className="bg-blue-700 text-white">
                  Total Logged Hours
                </Button>
                {openPopupTotal && <AdminAttendancePopupTotals onClose={() => setOpenPopupTotal(false)} />}

                <Button variant={"default"} onClick={() => setOpenPopupPivot(true)} className="bg-success text-white hover:bg-success/90">
                  Attendance Report
                </Button>
                {openPopupPivot && <AdminAttendancePivotReportModal onClose={() => setOpenPopupPivot(false)} />}
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
                    calendarMap={calendarMap}
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

      case "Leave":

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

      case "Regularization":
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

      case "Company Holidays & Rules":
        return (
          <>
            <AdminWorkingRulesPage />
            <AdminHolidayPage />
            <AdminHolidayOverridePage />
            <AdminAttendancePivotReport />
          </>
        )

      default:
        return <></>;
    }
  };

  // Don't render admin UI until we know user is admin (prevents flash for employees)
  if (loading || !user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-sky-50">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

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
