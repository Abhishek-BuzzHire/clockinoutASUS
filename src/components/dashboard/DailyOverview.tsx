"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { apiUrl } from "@/lib/data";
import { format, subDays, addDays, isToday } from "date-fns";
import { Users, CalendarOff, UserX, X, Clock, ChevronLeft, ChevronRight, Trash2, Pencil } from "lucide-react";
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
  const [deletingEmpId, setDeletingEmpId] = useState<number | null>(null);
  const [confirmDeleteEmpId, setConfirmDeleteEmpId] = useState<number | null>(null);

  const [editingEmpId, setEditingEmpId] = useState<number | null>(null);
  const [editPunchIn, setEditPunchIn] = useState<string>("");
  const [editPunchOut, setEditPunchOut] = useState<string>("");
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const handleDeleteAttendance = async (empId: number) => {
    setDeletingEmpId(empId);
    try {
      const token = Cookies.get("access");
      await axios.post(
        `${apiUrl}/api/admin/attendance/delete/`,
        { emp_id: empId, date: dateStr },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (typeof window !== "undefined") {
        localStorage.removeItem(`daily_overview_cache_${dateStr}`);
      }
      mutate(`${apiUrl}/api/admin/emp-total-details/?start_date=${dateStr}&end_date=${dateStr}`);
      setConfirmDeleteEmpId(null);
    } catch (err) {
      console.error("Failed to delete attendance", err);
    } finally {
      setDeletingEmpId(null);
    }
  };

  const startEditing = (emp: EmpDetail) => {
    setEditingEmpId(emp.emp_id);
    setConfirmDeleteEmpId(null);
    setEditPunchIn(emp.punch_in || "09:30");
    setEditPunchOut(emp.punch_out || "");
  };

  const handleEditTime = async (empId: number) => {
    setIsSavingEdit(true);
    try {
      const token = Cookies.get("access");
      await axios.post(
        `${apiUrl}/api/admin/attendance/edit-time/`,
        {
          emp_id: empId,
          date: dateStr,
          punch_in_time: editPunchIn,
          punch_out_time: editPunchOut || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (typeof window !== "undefined") {
        localStorage.removeItem(`daily_overview_cache_${dateStr}`);
      }
      mutate(`${apiUrl}/api/admin/emp-total-details/?start_date=${dateStr}&end_date=${dateStr}`);
      setEditingEmpId(null);
    } catch (err) {
      console.error("Failed to edit attendance time", err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const [effectiveData, setEffectiveData] = useState<any | undefined>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`daily_overview_cache_${dateStr}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse cached daily overview data", e);
        }
      }
    }
    return undefined;
  });

  const { data, isLoading, mutate } = useSWR(
    `${apiUrl}/api/admin/emp-total-details/?start_date=${dateStr}&end_date=${dateStr}`,
    fetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: false
    }
  );

  useEffect(() => {
    if (data) {
      setEffectiveData(data);
      if (typeof window !== "undefined") {
        localStorage.setItem(`daily_overview_cache_${dateStr}`, JSON.stringify(data));
      }
    }
  }, [data, dateStr]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`daily_overview_cache_${dateStr}`);
      if (stored) {
        try {
          setEffectiveData(JSON.parse(stored));
          return;
        } catch (e) {
          console.error("Error parsing cache for date", dateStr, e);
        }
      }
    }
    setEffectiveData(undefined);
  }, [dateStr]);

  const finalData = isMounted ? effectiveData : undefined;

  let p = 0, l = 0, a = 0;
  const presentList: EmpDetail[] = [];
  const leaveList: EmpDetail[] = [];
  const absentList: EmpDetail[] = [];

  if (finalData?.emps) {
    const EXCLUDED_EMP_IDS = new Set<number>([4, 5, 9, 12]);

    finalData.emps.forEach((emp: any) => {
      if (EXCLUDED_EMP_IDS.has(emp.emp_id)) return;

      // Skip employees who joined AFTER this date
      if (emp.joining_date && dateStr < emp.joining_date) return;

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

        {!isMounted || (isLoading && !effectiveData) ? (
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
                  <div key={emp.emp_id} className="flex items-center justify-between py-3 group">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{emp.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingEmpId === emp.emp_id ? (
                        <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-lg border border-gray-200">
                          <input
                            type="time"
                            value={editPunchIn}
                            onChange={(e) => setEditPunchIn(e.target.value)}
                            className="px-1.5 py-0.5 border border-gray-300 text-xs rounded text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            title="Punch In Time"
                          />
                          <span className="text-xs text-gray-400">-</span>
                          <input
                            type="time"
                            value={editPunchOut}
                            onChange={(e) => setEditPunchOut(e.target.value)}
                            className="px-1.5 py-0.5 border border-gray-300 text-xs rounded text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            title="Punch Out Time (Optional)"
                          />
                          <button
                            onClick={() => handleEditTime(emp.emp_id)}
                            disabled={isSavingEdit}
                            className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                          >
                            {isSavingEdit ? "..." : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingEmpId(null)}
                            className="p-0.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-200 transition-colors"
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          {emp.punch_in && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock size={12} />
                              <span>{emp.punch_in}{emp.punch_out ? ` — ${emp.punch_out}` : isToday(selectedDate) ? " (active)" : ""}</span>
                            </div>
                          )}
                          {confirmDeleteEmpId === emp.emp_id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteAttendance(emp.emp_id)}
                                disabled={deletingEmpId === emp.emp_id}
                                className="px-2 py-0.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                              >
                                {deletingEmpId === emp.emp_id ? "..." : "Confirm"}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteEmpId(null)}
                                className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            /* Hidden for now: Admin edit and delete attendance buttons
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              <button
                                onClick={() => startEditing(emp)}
                                className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all"
                                title="Edit punch time"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteEmpId(emp.emp_id)}
                                className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                                title="Delete attendance"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            */
                            null
                          )}
                        </>
                      )}
                    </div>
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
