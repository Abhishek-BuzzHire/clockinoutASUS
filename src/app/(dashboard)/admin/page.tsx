"use client";

import CVCount, { CVUserData } from "@/components/dashboard/CVCount";
import Pipeline from "@/components/dashboard/Pipeline";
import WeeklyStats from "@/components/dashboard/WeeklyStats";
import AttendanceChart from "@/components/dashboard/AttendanceChart";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { apiUrl } from "@/lib/data";
import { format } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CVCountData {
    date: string;
    users: CVUserData[];
}

interface TotalHrsResponse {
    present: number;
    absent: number;
    leave: number;
    remote: number;
}

interface AttendanceEntry {
    name: string;
    value: number;
}

// ─── Mock data (used when API is unavailable / during development) ────────────

const MOCK_CV_DATA: CVUserData[] = [
    { id: 1, name: "Nitin Sharma", cv_count: 18 },
    { id: 2, name: "Priya Verma", cv_count: 12 },
    { id: 3, name: "Amit Patel", cv_count: 9 },
    { id: 4, name: "Sunita Rao", cv_count: 15 },
    { id: 5, name: "Vikram Singh", cv_count: 7 },
];

const MOCK_ATTENDANCE_DATA: AttendanceEntry[] = [
    { name: "Present", value: 142 },
    { name: "Absent", value: 28 },
    { name: "On Leave", value: 19 },
    { name: "Remote", value: 31 },
];

// Set to true during development to skip real API calls
const USE_MOCK = process.env.NODE_ENV === "development";

// ─── Component ────────────────────────────────────────────────────────────────

export const AdminDashboard = () => {
    const [todayCVData, setTodayCVData] = useState<CVUserData[]>([]);
    const [attendanceData, setAttendanceData] = useState<AttendanceEntry[]>([]);
    const [loading, setLoading] = useState(true);

    // ── Fetch: CV counts ──────────────────────────────────────────────────────

    const fetchTodayCVCounts = async () => {
        if (USE_MOCK) {
            setTodayCVData(MOCK_CV_DATA);
            return;
        }
        try {
            const token = Cookies.get("access");
            const today = format(new Date(), "yyyy-MM-dd");

            const { data } = await axios.get<CVCountData[]>(
                `${apiUrl}/api/cv-count/`,
                {
                    params: { start_date: today },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (data.length > 0) setTodayCVData(data[0].users);
        } catch (err) {
            console.error("Error fetching CV counts:", err);
            setTodayCVData(MOCK_CV_DATA); // graceful fallback
        }
    };

    // ── Fetch: Attendance totals ──────────────────────────────────────────────

    const fetchAttendanceData = async () => {
        if (USE_MOCK) {
            setAttendanceData(MOCK_ATTENDANCE_DATA);
            return;
        }
        try {
            const token = Cookies.get("access");

            const { data } = await axios.get<TotalHrsResponse>(
                `${apiUrl}/total-hrs`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setAttendanceData([
                { name: "Present", value: data.present },
                { name: "Absent", value: data.absent },
                { name: "On Leave", value: data.leave },
                { name: "Remote", value: data.remote },
            ]);
        } catch (err) {
            console.error("Error fetching attendance data:", err);
            setAttendanceData(MOCK_ATTENDANCE_DATA); // graceful fallback
        }
    };

    // ── Bootstrap ─────────────────────────────────────────────────────────────

    useEffect(() => {
        Promise.all([fetchTodayCVCounts(), fetchAttendanceData()]).finally(() =>
            setLoading(false)
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Page header */}
            <div className="bg-white border-b border-gray-100 px-6 py-4">
                <p className="text-[10px] font-bold tracking-widest uppercase text-indigo-500 mb-0.5">
                    Admin Portal
                </p>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                    Recruitment Dashboard
                </h1>
            </div>

            <div className="p-4 md:p-6 flex flex-col gap-5">

                {/* Row 1 — Pipeline (full width) */}
                <Pipeline />

                {/* Row 2 — Stats + Attendance (left 2/3) · CVCount (right 1/3) */}
                <div className="flex flex-col lg:flex-row gap-5">

                    {/* Left column */}
                    <div className="w-full lg:w-2/3 flex flex-col gap-5">
                        <WeeklyStats />
                        <AttendanceChart data={attendanceData} />
                    </div>

                    {/* Right column */}
                    <div className="w-full lg:w-1/3">
                        <CVCount data={todayCVData} loading={loading} />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;