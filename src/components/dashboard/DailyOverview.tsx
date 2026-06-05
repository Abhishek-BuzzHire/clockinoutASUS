"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import Cookies from "js-cookie";
import { apiUrl } from "@/lib/data";
import { format } from "date-fns";
import { Users, UserCheck, Home, CalendarOff, UserX } from "lucide-react";

export default function DailyOverview() {
  const [stats, setStats] = useState({ present: 0, wfh: 0, leave: 0, absent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = Cookies.get("access");
        const today = format(new Date(), "yyyy-MM-dd");

        const res = await axios.get(`${apiUrl}/api/admin/emp-total-details/`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { start_date: today, end_date: today }
        });

        let p = 0;
        let w = 0;
        let l = 0;
        let a = 0;

        const EXCLUDED_EMP_IDS = new Set<number>([4, 5, 9, 12]);

        res.data.emps?.forEach((emp: any) => {
          if (EXCLUDED_EMP_IDS.has(emp.emp_id)) return;
          
          const day = emp.attendance?.find((d: any) => d.date === today);
          if (!day) {
            a++;
            return;
          }

          if (day.work_status === "LEAVE") {
            l++;
          } else if (day.work_status === "WFH") {
            w++;
          } else if (day.punch_in) {
            p++;
          } else {
            a++;
          }
        });

        setStats({ present: p, wfh: w, leave: l, absent: a });
      } catch (error) {
        console.error("Failed to fetch daily overview", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const total = stats.present + stats.wfh + stats.leave + stats.absent;
  
  // Calculate widths for the segmented bar (ensure at least a little visibility if > 0)
  const getWidth = (val: number) => total === 0 ? 0 : Math.max((val / total) * 100, val > 0 ? 2 : 0);

  return (
    <Card className="w-full border-none shadow-sm rounded-xl overflow-hidden bg-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              Today's Pulse
            </h2>
            <p className="text-sm text-gray-500 mt-1">Live snapshot of workforce availability</p>
          </div>
        </div>

        {loading ? (
          <div className="h-16 flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
            <span className="text-sm text-gray-400">Syncing data...</span>
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            {/* SEGMENTED PROGRESS BAR */}
            <div className="h-4 flex rounded-full overflow-hidden bg-gray-100 w-full shadow-inner">
              <div 
                className="bg-emerald-500 transition-all duration-1000 ease-out" 
                style={{ width: `${getWidth(stats.present)}%` }} 
                title={`Present: ${stats.present}`}
              />
              <div 
                className="bg-blue-500 transition-all duration-1000 ease-out border-l border-white/20" 
                style={{ width: `${getWidth(stats.wfh)}%` }}
                title={`WFH: ${stats.wfh}`} 
              />
              <div 
                className="bg-amber-400 transition-all duration-1000 ease-out border-l border-white/20" 
                style={{ width: `${getWidth(stats.leave)}%` }} 
                title={`Leave: ${stats.leave}`}
              />
              <div 
                className="bg-slate-300 transition-all duration-1000 ease-out border-l border-white/20" 
                style={{ width: `${getWidth(stats.absent)}%` }} 
                title={`Absent: ${stats.absent}`}
              />
            </div>

            {/* CUSTOM UNIQUE LEGEND INSTEAD OF CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <UserCheck size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800 leading-none">{stats.present}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">Present</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Home size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800 leading-none">{stats.wfh}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">Remote</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                  <CalendarOff size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800 leading-none">{stats.leave}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">On Leave</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <UserX size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800 leading-none">{stats.absent}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">Absent</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
