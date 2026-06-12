'use client'

import { useEffect } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import axios from "axios";
import Cookies from "js-cookie";

import CVCount from "@/components/dashboard/CVCount";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import RecentRequests from "@/components/dashboard/RecentRequests";
import DailyOverview from "@/components/dashboard/DailyOverview";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const AdminDashboard = () => {
    useEffect(() => {
        if (typeof window === "undefined") return;

        const currentDate = new Date();
        const cacheKey = `attendance_local_cache_${format(currentDate, "yyyy-MM")}`;
        const stored = localStorage.getItem(cacheKey);

        if (!stored) {
            const prewarmCache = async () => {
                try {
                    const token = Cookies.get("access");
                    if (!token) return;
                    
                    const start = format(startOfMonth(currentDate), "yyyy-MM-dd");
                    const end = format(endOfMonth(currentDate), "yyyy-MM-dd");
                    const headers = { Authorization: `Bearer ${token}` };

                    console.log("⚡ Pre-warming attendance cache in background...");
                    const [calRes, attRes] = await Promise.all([
                        axios.get(`${apiUrl}/api/company-calendar`, { headers, params: { start_date: start, end_date: end } }),
                        axios.get(`${apiUrl}/api/admin/emp-total-details/`, { headers, params: { start_date: start, end_date: end } })
                    ]);

                    const payload = { calendar: calRes.data, attendance: attRes.data };
                    localStorage.setItem(cacheKey, JSON.stringify(payload));
                    console.log("⚡ Attendance cache pre-warmed successfully!");
                } catch (e) {
                    console.error("Failed to pre-warm attendance cache:", e);
                }
            };
            prewarmCache();
        }
    }, []);

    return (
        <div className='p-6 flex flex-col gap-5 bg-[#F4F5F7] min-h-screen'>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
                {/* LEFT COLUMN */}
                <div className="flex flex-col gap-5">
                    <DailyOverview />
                    <RecentRequests />
                </div>

                {/* RIGHT COLUMN */}
                <div className="flex flex-col gap-5">
                    <CVCount />
                    <UpcomingEvents />
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard