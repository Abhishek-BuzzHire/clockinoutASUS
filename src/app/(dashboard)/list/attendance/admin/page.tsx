"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { format, startOfMonth, endOfMonth, isAfter, isWeekend, isToday, isBefore, startOfDay } from "date-fns";
import axios from "axios";
import Cookies from "js-cookie";
import useSWR from "swr";
import Pusher from "pusher-js";

import type { AttendanceRecord, CalendarDay, NewEmployee, ShiftConfig } from "@/lib/types";
import AttendanceCalendar from "@/components/attendance/attendanceCalender";
import AttendanceSidebar from "@/components/attendance/attendanceSidebar";
import CompanyHolidays from "@/components/attendance/CompanyHolidays";
import { useRouter, useSearchParams } from "next/navigation";
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

const AdminAttendanceContent = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const searchParams = useSearchParams();

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

  const tabs = ["Attendance", "Leave", "Regularization", "Company Holidays & Rules"];
  const [activeTab, setActiveTab] = useState("Attendance");
  const [loadingPage, setLoadingPage] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
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

  useEffect(() => {
    const tab = searchParams.get("tab");
    const wfhId = searchParams.get("wfhId");
    const regularizationToken = searchParams.get("regularizationToken");
    const leaveId = searchParams.get("leaveId");

    // 1. Handle Active Tab
    // Map URL tab param to the text used in your 'tabs' array
    const tabNameMap: { [key: string]: string } = {
      attendance: "Attendance",
      leave: "Leave",
      regularization: "Regularization",
      settings: "Company Holidays & Rules",
    };

    if (tab && tabNameMap[tab]) {
      setActiveTab(tabNameMap[tab]);
    } else {
      // Default to the first tab if none is specified
      setActiveTab("Attendance");
    }

    // 2. Handle WFH Modal
    if (wfhId && wfhList.length > 0) {
      const wfhRequest = wfhList.find((item) => String(item.wfh_id) === wfhId);
      if (wfhRequest) {
        setSelectedWFH(wfhRequest);
      } else {
        // If the ID is not in the list, remove it from the URL
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete("wfhId");
        router.replace(`?${newParams.toString()}`);
      }
    }

    // 3. Handle Regularization Modal
    if (regularizationToken && list.length > 0) {
      // The 'openDetail' function already fetches and sets the modal data
      openDetail(regularizationToken);
    }

    // You can add similar logic for 'leaveId' here if needed
    if (leaveId && leaves.length > 0) {
      const leaveRequest = leaves.find((item) => String(item.leave_id) === leaveId);
      if (leaveRequest) {
        setSelectedLeave(leaveRequest);
      } else {
        // Optional: Clean up URL if ID is invalid
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete("leaveId");
        router.replace(`?${newParams.toString()}`);
      }
    }

  }, [searchParams, wfhList, list, leaves]);

  const [isMounted, setIsMounted] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Listen for Pusher event to refresh cache globally
    const pusher = new Pusher("4dd64d9dc091254c62be", {
      cluster: "ap2",
    });

    const channel = pusher.subscribe("dashboard-channel");
    channel.bind("force_sync", (data: any) => {
      console.log("Global force sync received!", data);
      // Clear localStorage cache for attendance
      const keys = Object.keys(localStorage);
      for (const k of keys) {
        if (k.startsWith("attendance_local_cache_")) {
          localStorage.removeItem(k);
        }
      }
      window.location.reload();
    });

    return () => {
      channel.unbind("force_sync");
      pusher.unsubscribe("dashboard-channel");
    };
  }, []);

  const handleForceSync = async () => {
    try {
      setSyncing(true);
      const token = Cookies.get("access");
      await axios.post(`${apiUrl}/api/attendance/force-sync/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // The pusher event will trigger window.location.reload()
    } catch (error) {
      console.error("Force sync failed:", error);
      alert("Failed to force sync");
      setSyncing(false);
    }
  };

  const [localCache, setLocalCache] = useState<any | undefined>(() => {
    if (typeof window !== "undefined") {
      const cacheKey = `attendance_local_cache_${format(new Date(), "yyyy-MM")}`;
      const stored = localStorage.getItem(cacheKey);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse local attendance cache on mount", e);
        }
      }
    }
    return undefined;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cacheKey = `attendance_local_cache_${format(currentDate, "yyyy-MM")}`;
      const stored = localStorage.getItem(cacheKey);
      if (stored) {
        try {
          setLocalCache(JSON.parse(stored));
          return;
        } catch (e) {
          console.error("Error parsing local cache on date change", e);
        }
      }
    }
    setLocalCache(undefined);
  }, [currentDate]);

  // ⚡ SWR: Cache attendance data in browser RAM for nano-second loading
  const swrAttendanceKey = `attendance_${format(currentDate, "yyyy-MM")}`;

  const swrFetcher = async () => {
    const token = Cookies.get("access");
    const start = format(startOfMonth(currentDate), "yyyy-MM-dd");
    const end = format(endOfMonth(currentDate), "yyyy-MM-dd");
    const headers = { Authorization: token ? `Bearer ${token}` : "" };

    const [calRes, attRes] = await Promise.all([
      axios.get(`${apiUrl}/api/company-calendar`, { headers, params: { start_date: start, end_date: end } }),
      axios.get(`${apiUrl}/api/admin/emp-total-details/`, { headers, params: { start_date: start, end_date: end } })
    ]);

    return { calendar: calRes.data, attendance: attRes.data };
  };

  const { data: swrData, mutate } = useSWR(swrAttendanceKey, swrFetcher, {
    revalidateOnFocus: false, // Prevents excessive refetches on focus
    keepPreviousData: true,
    refreshInterval: 30000, // silently refresh every 30 seconds
  });

  useEffect(() => {
    if (swrData && typeof window !== "undefined") {
      const cacheKey = `attendance_local_cache_${format(currentDate, "yyyy-MM")}`;
      localStorage.setItem(cacheKey, JSON.stringify(swrData));
    }
  }, [swrData, currentDate]);

  const effectiveData = isMounted ? (swrData || localCache) : undefined;

  const { calendarMap, employees, attendanceRecords } = useMemo(() => {
    if (!effectiveData) {
      return {
        calendarMap: {} as Record<string, CalendarDay>,
        employees: [] as NewEmployee[],
        attendanceRecords: {} as Record<string, AttendanceDay>
      };
    }

    // Process calendar
    const calMap: Record<string, CalendarDay> = {};
    effectiveData.calendar.calendar?.forEach((day: CalendarDay) => {
      calMap[day.date] = day;
    });

    // Process attendance
    const EXCLUDED_EMP_IDS = new Set<number>([4, 5, 9, 12]);
    const apiData = effectiveData.attendance.emps || [];

    const empList: NewEmployee[] = apiData.map((e: any) => ({
      id: String(e.emp_id),
      name: e.employee_name,
    }));

    const mapped: Record<string, AttendanceDay> = {};

    apiData.forEach((emp: any) => {
      if (EXCLUDED_EMP_IDS.has(emp.emp_id)) return;

      emp.attendance?.forEach((day: any) => {
        const dateKey = day.date;
        const thisDate = new Date(dateKey);
        const today = new Date();

        const calendarDay = calMap[dateKey];

        const isWorkingDay = calendarDay?.is_working_day ?? true;
        const isLeave = day.work_status === "LEAVE";
        const hasPunch = !!day.punch_in;
        const isPastDay = isBefore(startOfDay(thisDate), startOfDay(today));
        const isFutureDay = isAfter(startOfDay(thisDate), startOfDay(today));

        let attendanceStatus: "present" | "absent" | "leave" | "off" | "upcoming" = "absent";
        let lateBy: string | null = null;

        if (isLeave) {
          attendanceStatus = "leave";
        } else if (isFutureDay) {
          attendanceStatus = "upcoming";
        } else if (isPastDay) {
          if (!hasPunch) {
            attendanceStatus = isWorkingDay ? "absent" : "off";
          } else if (hasPunch && !day.punch_out) {
            attendanceStatus = "absent";
          } else {
            attendanceStatus = "present";
            const shiftStart = toMinutes(SHIFT_CONFIG.startTime);
            const punchMinutes = toMinutes(day.punch_in);
            if (punchMinutes > shiftStart + 30) {
              const diff = punchMinutes - shiftStart;
              const hrs = Math.floor(diff / 60);
              const mins = diff % 60;
              lateBy = `${hrs > 0 ? `${hrs}h ` : ""}${mins}m`;
            }
          }
        } else { // TODAY
          if (hasPunch) {
            attendanceStatus = "present";
            const shiftStart = toMinutes(SHIFT_CONFIG.startTime);
            const punchMinutes = toMinutes(day.punch_in);
            if (punchMinutes > shiftStart + 30) {
              const diff = punchMinutes - shiftStart;
              const hrs = Math.floor(diff / 60);
              const mins = diff % 60;
              lateBy = `${hrs > 0 ? `${hrs}h ` : ""}${mins}m`;
            }
          } else {
            attendanceStatus = isWorkingDay ? "absent" : "off";
          }
        }

        if (!mapped[dateKey]) {
          mapped[dateKey] = { records: [], summary: { present: 0, absent: 0, leave: 0, off: 0, upcoming: 0 } as any };
        }

        if (attendanceStatus) {
          (mapped[dateKey].summary as any)[attendanceStatus]++;
        }

        mapped[dateKey].records.push({
          employeeId: String(emp.emp_id),
          date: dateKey,
          checkInTime: day.punch_in || undefined,
          checkOutTime: day.punch_out || undefined,
          status: attendanceStatus,
          lateBy: lateBy,
          hoursWorked: day.total_time || undefined,
          workStatus: day.work_status || null,
          canGrantPastPermission: day.can_grant_past_permission,
          pastPermissionGranted: day.past_permission_granted,
        } as AttendanceRecord);
      });
    });

    return { calendarMap: calMap, employees: empList, attendanceRecords: mapped };
  }, [effectiveData]);

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
      console.error("Failed to load regularization requests:", err);
      // Backend not connected yet - silently handle
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
      console.error("Failed to fetch leave requests:", err);
      // Backend not connected yet - silently handle
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
      console.error("Failed to load WFH requests:", err);
      // Backend not connected yet - silently handle
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


  // When month changes via calendar — SWR auto-fetches based on currentDate
  const handleMonthChange = (newMonth: Date) => {
    setCurrentDate(newMonth);
    setSelectedDate(newMonth);
    // SWR key changes with currentDate, so it auto-fetches or serves from cache ⚡
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
                  Attendance Report (Date Wise)
                </Button>
                {openPopupDate && <AdminAttendancePopupByDate onClose={() => setOpenPopupDate(false)} />}

                <Button variant={"default"} onClick={() => setOpenPopupName(true)} className="bg-blue-700 text-white">
                  Attendance Report (Name Wise)
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
                    onRefresh={() => mutate()}
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
                  onView={(leave) => {
                    const currentTab = 'leave'; // This is under the Leave tab
                    router.push(`/list/attendance/admin?tab=${currentTab}&leaveId=${leave.leave_id}`);
                  }}
                />
              </div>
            </div>

            {/* MODAL OVERLAY */}
            {selectedLeave && (
              <AdminLeaveDetailModal
                leave={selectedLeave}
                onClose={() => {
                  // Remove the leaveId from the URL, keeping the active tab
                  setSelectedLeave(null);
                  router.push(`/list/attendance/admin?tab=leave`);
                }}
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
                  onView={(token) => {
                    const currentTab = 'regularization';
                    router.push(`/list/attendance/admin?tab=${currentTab}&regularizationToken=${token}`);
                  }}
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
                  onView={(req) => {
                    const currentTab = 'regularization'; // This is under the Regularization tab
                    router.push(`/list/attendance/admin?tab=${currentTab}&wfhId=${req.wfh_id}`);
                  }}
                />
              </div>
            </div>

            {/* MODALS */}
            {detail && (
              <CorrectionDetailModal
                data={detail}
                onClose={() => {
                  // Just remove the wfhId from the URL
                  setDetail(null);
                  router.push(`/list/attendance/admin?tab=regularization`);
                }}
                onAction={takeAction}
              />
            )}

            {selectedWFH && (
              <AdminWFHDetailModal
                wfh={selectedWFH}
                onClose={() => {
                  // Just remove the wfhId from the URL
                  setSelectedWFH(null);
                  router.push(`/list/attendance/admin?tab=regularization`);
                }}
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
      <div className="absolute top-4 right-4 z-50">
        <Button 
          variant={"destructive"} 
          onClick={handleForceSync} 
          disabled={syncing}
          className="bg-red-600 text-white shadow-lg animate-pulse hover:animate-none"
        >
          {syncing ? "Syncing..." : "Force Sync (Global)"}
        </Button>
      </div>
      <div className="text-lg">
        <div className="flex space-x-8 text-xs font-bold border-b border-gray-300 mb-12">
          {
            tabs.map((tab) => (
              <button
                key={tab}
                // ⬇️ CHANGE this onClick
                onClick={() => {
                  const tabIdMap: { [key: string]: string } = {
                    Attendance: "attendance",
                    Leave: "leave",
                    Regularization: "regularization",
                    "Company Holidays & Rules": "settings",
                  };
                  const newTabId = tabIdMap[tab];
                  router.push(`/list/attendance/admin?tab=${newTabId}`);
                }}
                className={`p-2 ${activeTab === tab
                  ? "border-b-2 border-blue-600"
                  : "text-gray-500"
                  }`}
              >
                {tab.toUpperCase()}
              </button>
            ))};
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

const AdminAttendancePage = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-sky-50">
        <p className="text-slate-500">Loading...</p>
      </div>
    }>
      <AdminAttendanceContent />
    </Suspense>
  );
};

export default AdminAttendancePage;
