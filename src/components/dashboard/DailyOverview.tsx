"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import Cookies from "js-cookie";
import { apiUrl } from "@/lib/data";
import { format } from "date-fns";
import { UserCheck, Home, CalendarOff, UserX, X, Clock } from "lucide-react";

interface EmpDetail {
  name: string;
  emp_id: number;
  punch_in?: string;
  punch_out?: string;
  work_status?: string;
}

type StatCategory = "present" | "wfh" | "leave" | "absent";

export default function DailyOverview() {
  const [stats, setStats] = useState({ present: 0, wfh: 0, leave: 0, absent: 0 });
  const [empsByCategory, setEmpsByCategory] = useState<Record<StatCategory, EmpDetail[]>>({
    present: [], wfh: [], leave: [], absent: []
  });
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<StatCategory | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = Cookies.get("access");
        const today = format(new Date(), "yyyy-MM-dd");

        const res = await axios.get(`${apiUrl}/api/admin/emp-total-details/`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { start_date: today, end_date: today }
        });

        let p = 0, w = 0, l = 0, a = 0;
        const presentList: EmpDetail[] = [];
        const wfhList: EmpDetail[] = [];
        const leaveList: EmpDetail[] = [];
        const absentList: EmpDetail[] = [];

        const EXCLUDED_EMP_IDS = new Set<number>([4, 5, 9, 12]);

        res.data.emps?.forEach((emp: any) => {
          if (EXCLUDED_EMP_IDS.has(emp.emp_id)) return;

          const day = emp.attendance?.find((d: any) => d.date === today);
          const detail: EmpDetail = {
            name: emp.employee_name || `Employee #${emp.emp_id}`,
            emp_id: emp.emp_id,
            punch_in: day?.punch_in || undefined,
            punch_out: day?.punch_out || undefined,
            work_status: day?.work_status || undefined,
          };

          if (!day) {
            a++;
            absentList.push(detail);
            return;
          }

          if (day.work_status === "LEAVE") {
            l++;
            leaveList.push(detail);
          } else if (day.work_status === "WFH") {
            w++;
            wfhList.push(detail);
          } else if (day.punch_in) {
            p++;
            presentList.push(detail);
          } else {
            a++;
            absentList.push(detail);
          }
        });

        setStats({ present: p, wfh: w, leave: l, absent: a });
        setEmpsByCategory({ present: presentList, wfh: wfhList, leave: leaveList, absent: absentList });
      } catch (error) {
        console.error("Failed to fetch daily overview", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const modalConfig: Record<StatCategory, { title: string; color: string; bgColor: string; borderColor: string }> = {
    present: { title: "Present Today", color: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
    wfh: { title: "WFH Today", color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
    leave: { title: "On Leave Today", color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
    absent: { title: "Absent Today", color: "text-slate-700", bgColor: "bg-slate-50", borderColor: "border-slate-200" },
  };

  return (
    <>
      <Card className="w-full border-none shadow-sm rounded-xl overflow-hidden bg-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Today&apos;s Pulse</h2>
              <p className="text-sm text-gray-500 mt-1">Live snapshot of workforce availability</p>
            </div>
          </div>

          {loading ? (
            <div className="h-16 flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
              <span className="text-sm text-gray-400">Syncing data...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* PRESENT */}
              <button
                onClick={() => setActiveModal("present")}
                className="flex items-center gap-3 p-4 rounded-xl border border-transparent hover:border-emerald-200 hover:bg-emerald-50/50 transition-all duration-200 cursor-pointer text-left group"
              >
                <div className="h-11 w-11 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <UserCheck size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800 leading-none">{stats.present}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">Present</p>
                </div>
              </button>

              {/* WFH */}
              <button
                onClick={() => setActiveModal("wfh")}
                className="flex items-center gap-3 p-4 rounded-xl border border-transparent hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer text-left group"
              >
                <div className="h-11 w-11 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Home size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800 leading-none">{stats.wfh}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">WFH</p>
                </div>
              </button>

              {/* ON LEAVE */}
              <button
                onClick={() => setActiveModal("leave")}
                className="flex items-center gap-3 p-4 rounded-xl border border-transparent hover:border-amber-200 hover:bg-amber-50/50 transition-all duration-200 cursor-pointer text-left group"
              >
                <div className="h-11 w-11 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                  <CalendarOff size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800 leading-none">{stats.leave}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">On Leave</p>
                </div>
              </button>

              {/* ABSENT */}
              <button
                onClick={() => setActiveModal("absent")}
                className="flex items-center gap-3 p-4 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-100/50 transition-all duration-200 cursor-pointer text-left group"
              >
                <div className="h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
                  <UserX size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800 leading-none">{stats.absent}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">Absent</p>
                </div>
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DETAIL MODAL */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[70vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${modalConfig[activeModal].borderColor} ${modalConfig[activeModal].bgColor}`}>
              <h3 className={`text-base font-bold ${modalConfig[activeModal].color}`}>
                {modalConfig[activeModal].title} ({empsByCategory[activeModal].length})
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-3 divide-y divide-gray-100">
              {empsByCategory[activeModal].length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">No employees in this category today.</p>
              ) : (
                empsByCategory[activeModal].map((emp) => (
                  <div key={emp.emp_id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{emp.name}</span>
                    </div>
                    {emp.punch_in && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{emp.punch_in}{emp.punch_out ? ` — ${emp.punch_out}` : " (active)"}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
