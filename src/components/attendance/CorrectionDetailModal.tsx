'use client'

import { useState } from "react";
import {
  X,
  User,
  Clock,
  MessageSquare,
  CheckCircle2,
  XCircle,
  CalendarDays,
  ClipboardCheck,
  RotateCcw,
  FileText,
  CalendarClock,
} from "lucide-react";
import { formatWFHDate } from "./EmployeeWFHHistoryTable";
import { apiUrl } from "@/lib/data";

/* ─── helper: format "2026-07-06 19:25" → "07:25 PM" ─── */
const formatProposedTime = (raw?: string) => {
  if (!raw) return "—";
  // raw can be "2026-07-06 19:25" or just "19:25"
  const timePart = raw.includes(" ") ? raw.split(" ")[1] : raw;
  const [h, m] = timePart.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;
};

/* ─── helper: format created_at → "Today, 10:43 AM" or "07 Jul, 10:43 AM" ─── */
const formatSubmittedDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  if (isToday) return `Today, ${timeStr}`;
  const dateStr = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
  return `${dateStr}, ${timeStr}`;
};

/* ─── helper: readable correction type label ─── */
const getCorrectionLabel = (type?: string) => {
  if (!type) return "Correction";
  if (type === "PUNCH_IN") return "Correction in punch in time";
  if (type === "PUNCH_OUT") return "Correction in punch out time";
  return type.replace(/_/g, " ");
};

const getProposedLabel = (type?: string) => {
  if (type === "PUNCH_IN") return "Proposed punch in time";
  if (type === "PUNCH_OUT") return "Proposed punch out time";
  return "Proposed time";
};

export default function CorrectionDetailModal({
  data,
  onClose,
  onAction,
}: {
  data: any;
  onClose: () => void;
  onAction: (a: "APPROVE" | "REJECT", c: string) => void;
}) {
  const [comment, setComment] = useState("");
  const [photoTimestamp] = useState(Date.now());
  const maxChars = 250;

  if (!data) return null;

  const isPending = data.status === "PENDING";

  return (
    <div
      className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-[#f8faff] to-[#f0f4ff] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ═══════════ HEADER ═══════════ */}
        <div className="flex justify-between items-center px-6 py-5">
          <div className="flex items-center gap-3">
            {/* Gradient icon container */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-sm border border-blue-200/50">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-[15px] text-slate-800 tracking-tight leading-tight">
                Attendance Correction Request
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Review the request and take appropriate action
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all border border-transparent hover:border-red-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ═══════════ BODY ═══════════ */}
        <div className="px-6 pb-6 space-y-4">

          {/* ─── Employee + Requested For Row ─── */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              {/* Left: Employee */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 border-2 border-white shadow-sm flex items-center justify-center text-slate-400 overflow-hidden">
                  {data.profile_photo ? (
                    <img
                      src={
                        data.profile_photo.includes("?")
                          ? `${apiUrl}${data.profile_photo}`
                          : `${apiUrl}${data.profile_photo}?t=${photoTimestamp}`
                      }
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.12em]">
                    Employee
                  </p>
                  <p className="text-sm font-bold text-slate-800 leading-tight">
                    {data.employee}
                  </p>
                  {data.employee_email && data.employee_email !== data.employee && (
                    <p className="text-[10px] text-slate-400 font-medium">{data.employee_email}</p>
                  )}
                </div>
              </div>

              {/* Right: Requested For */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                  <CalendarDays className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-blue-600 uppercase tracking-[0.12em]">
                    Requested For
                  </p>
                  <p className="text-sm font-bold text-slate-800 leading-tight">
                    {formatWFHDate(data.date)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">Full Day</p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Correction Type + Proposed Time Grid ─── */}
          <div className="grid grid-cols-2 gap-3">
            {/* Correction Type */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0 mt-0.5">
                  <RotateCcw className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-1">
                    Correction Type
                  </p>
                  <p className="text-[13px] font-extrabold text-slate-800 leading-tight">
                    {data.type?.replace(/_/g, " ")}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-snug">
                    {getCorrectionLabel(data.type)}
                  </p>
                </div>
              </div>
            </div>

            {/* Proposed Time */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-4 shadow-sm shadow-emerald-100/30">
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center border border-emerald-200/60 shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-[0.12em] mb-1">
                    New Proposed Time
                  </p>
                  <p className="text-[15px] font-black text-emerald-800 tracking-tight leading-tight">
                    {formatProposedTime(data.time_only || data.requested_time)}
                  </p>
                  <p className="text-[10px] text-emerald-600/70 font-medium mt-0.5 leading-snug">
                    {getProposedLabel(data.type)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Employee Justification ─── */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center border border-violet-100 shrink-0 mt-0.5">
                <MessageSquare className="w-3.5 h-3.5 text-violet-500" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-violet-600 uppercase tracking-[0.12em] mb-1.5">
                  Employee&rsquo;s Justification
                </p>
                <p className="text-sm text-slate-700 font-semibold italic leading-relaxed">
                  &ldquo;{data.reason}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* ─── Status + Submitted On Row ─── */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              {/* Left: Status */}
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 ${
                  data.status === "APPROVED"
                    ? "bg-emerald-50 border-emerald-100"
                    : data.status === "REJECTED"
                    ? "bg-red-50 border-red-100"
                    : "bg-amber-50 border-amber-100"
                }`}>
                  <FileText className={`w-4 h-4 ${
                    data.status === "APPROVED"
                      ? "text-emerald-500"
                      : data.status === "REJECTED"
                      ? "text-red-500"
                      : "text-amber-500"
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                      Status
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        data.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-700"
                          : data.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {data.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {isPending
                      ? "Awaiting your review and decision"
                      : `Action taken by administrator`}
                  </p>
                </div>
              </div>

              {/* Right: Submitted On */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center border border-orange-100 shrink-0">
                  <CalendarClock className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.12em]">
                    Request Submitted On
                  </p>
                  <p className="text-[13px] font-bold text-slate-800 leading-tight">
                    {formatSubmittedDate(data.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Admin Remarks + Actions (PENDING only) ─── */}
          {isPending && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
              {/* Admin Remarks */}
              <div>
                <div className="flex items-center gap-2 mb-2 px-0.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">
                    Administrator Remarks
                  </label>
                </div>
                <div className="relative">
                  <textarea
                    placeholder="Enter remarks or notes for the employee..."
                    value={comment}
                    onChange={(e) =>
                      setComment(e.target.value.slice(0, maxChars))
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all outline-none resize-none placeholder:text-slate-300"
                    rows={3}
                  />
                  <span className="absolute bottom-3 right-3 text-[10px] font-semibold text-slate-300">
                    {comment.length}/{maxChars}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => onAction("REJECT", comment)}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-white border-2 border-rose-200 text-rose-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all duration-200 active:scale-[0.97] shadow-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Request
                </button>

                <button
                  onClick={() => onAction("APPROVE", comment)}
                  className="flex-[1.3] flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-200 transition-all duration-200 active:scale-[0.97]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Request
                </button>
              </div>
            </div>
          )}

          {/* ─── Dismissed Footer (non-PENDING) ─── */}
          {!isPending && (
            <div className="text-center pt-2">
              <button
                onClick={onClose}
                className="px-8 py-2.5 bg-slate-800 text-white font-bold text-sm rounded-xl hover:bg-slate-900 transition-all shadow-sm"
              >
                Dismiss Record
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}