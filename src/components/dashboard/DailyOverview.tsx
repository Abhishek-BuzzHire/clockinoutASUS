"use client";

import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { apiUrl } from "@/lib/data";
import { format, subDays, addDays, isToday } from "date-fns";
import { Users, CalendarOff, UserX, X, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import useSWR from "swr";

interface EmpDetail {
  name: string;
  emp_id: number;
  punch_in?: string;
  punch_out?: string;
  work_status?: string;
}

type StatCategory = "present" | "leave" | "absent";

const fetcher = async (url: string) => {
  const token = Cookies.get("access");
  const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};



export default function DailyOverview() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeModal, setActiveModal] = useState<StatCategory | null>(null);

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const { data, isLoading } = useSWR(
    `${apiUrl}/api/admin/emp-total-details/?start_date=${dateStr}&end_date=${dateStr}`,
    fetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: true
    }
  );

  let p = 0, l = 0, a = 0;
  const presentList: EmpDetail[] = [];
  const leaveList: EmpDetail[] = [];
  const absentList: EmpDetail[] = [];

  if (data?.emps) {
    const EXCLUDED_EMP_IDS = new Set<number>([4, 5, 9, 12]);

    data.emps.forEach((emp: any) => {
      if (EXCLUDED_EMP_IDS.has(emp.emp_id)) return;

      const day = emp.attendance?.find((d: any) => d.date === dateStr);
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
        p++;
        presentList.push(detail);
      } else if (day.punch_in) {
        p++;
        presentList.push(detail);
      } else {
        a++;
        absentList.push(detail);
      }
    });
  }

  const stats = { present: p, leave: l, absent: a };
  const empsByCategory = { present: presentList, leave: leaveList, absent: absentList };

  const goBack = () => setSelectedDate(prev => subDays(prev, 1));
  const goForward = () => {
    if (!isToday(selectedDate)) {
      setSelectedDate(prev => addDays(prev, 1));
    }
  };

  const modalConfig: Record<StatCategory, { title: string; color: string; bgColor: string; borderColor: string }> = {
    present: { title: "Present", color: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
    leave: { title: "On Leave", color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
    absent: { title: "Absent", color: "text-slate-700", bgColor: "bg-slate-50", borderColor: "border-slate-200" },
  };

  const cards: { key: StatCategory; label: string; icon: React.ReactNode; borderClass: string; iconBg: string; iconColor: string }[] = [
    { key: "present", label: "Present", icon: <Users size={20} />, borderClass: "border-l-[3px] border-l-green-500", iconBg: "bg-green-50", iconColor: "text-green-600" },
    { key: "leave", label: "On Leave", icon: <CalendarOff size={20} />, borderClass: "border-l-[3px] border-l-amber-400", iconBg: "bg-amber-50", iconColor: "text-amber-600" },
    { key: "absent", label: "Absent", icon: <UserX size={20} />, borderClass: "border-l-[3px] border-l-red-500", iconBg: "bg-red-50", iconColor: "text-red-500" },
  ];

  const dateLabel = isToday(selectedDate)
    ? "Today's Activity"
    : `${format(selectedDate, "MMM d")} Activity`;

  return (
    <>
      <div className="bg-white border border-[#E9EBF0] rounded-xl p-8">
        {/* Header with arrows */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-2xl font-medium text-gray-900 tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>{dateLabel}</p>
            <p className="text-sm text-gray-500 mt-1.5">
              {isToday(selectedDate) ? "Live snapshot" : "Historical data"} · {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={goBack}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goForward}
              disabled={isToday(selectedDate)}
              className={`w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center transition-colors ${isToday(selectedDate) ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-50"
                }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {isLoading && !data ? (
          <div className="h-16 flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
            <span className="text-sm text-gray-400">Syncing data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {cards.map((c) => (
              <button
                key={c.key}
                onClick={() => setActiveModal(c.key)}
                className={`bg-[#F8F9FB] border border-[#EAECF0] ${c.borderClass} rounded-xl p-5 flex items-center gap-4 text-left hover:bg-[#F0F2F5] transition-colors cursor-pointer`}
              >
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${c.iconBg} ${c.iconColor} shrink-0`}>
                  {c.icon}
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 leading-none" style={{ fontFamily: "'Sora', sans-serif" }}>{stats[c.key]}</p>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mt-1.5">{c.label}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[70vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between px-6 py-4 border-b ${modalConfig[activeModal].borderColor} ${modalConfig[activeModal].bgColor}`}>
              <h3 className={`text-base font-bold ${modalConfig[activeModal].color}`}>
                {modalConfig[activeModal].title} — {isToday(selectedDate) ? "Today" : format(selectedDate, "MMM d")} ({empsByCategory[activeModal].length})
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-3 divide-y divide-gray-100">
              {empsByCategory[activeModal].length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">No employees in this category.</p>
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
                        <span>{emp.punch_in}{emp.punch_out ? ` — ${emp.punch_out}` : isToday(selectedDate) ? " (active)" : ""}</span>
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
