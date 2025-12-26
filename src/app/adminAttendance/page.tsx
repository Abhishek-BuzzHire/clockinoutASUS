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
import AdminAttendancePopup from "@/components/attendance/adminAttendancePopupDate";
import { Button } from "@/components/ui/button";

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

  const tabs = ["Attendance Management", "Leaves Management"];
  const [activeTab, setActiveTab] = useState("Attendance Management");

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [employees, setEmployees] = useState<NewEmployee[]>([]);
  const [openPopup, setOpenPopup] = useState(false);


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
        "https://buzzhire.trueledgrr.com/api/admin/emp-total-details/",
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
              <Button variant={"default"} onClick={() => setOpenPopup(true)}>
                View Full Attendance
              </Button>

              {openPopup && <AdminAttendancePopup onClose={() => setOpenPopup(false)} />}
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
          <div className="flex flex-col min-h-screen gap-8">
            <div className="text-2xl text-gray-900 space-x-4">
              Leaves Manangement
            </div>
          </div>
        );

      default:
        return <></>;
    }
  };

  return (
    <div className="w-full bg-blueLight-50 p-4 relative">
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
