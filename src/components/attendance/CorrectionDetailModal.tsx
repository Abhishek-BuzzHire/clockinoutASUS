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
  Pencil,
} from "lucide-react";
import { formatWFHDate } from "./EmployeeWFHHistoryTable";
import { apiUrl } from "@/lib/data";

/* ─── helper: format "2026-07-06 19:25" → "07:25 PM" ─── */
const formatProposedTime = (raw?: string) => {
  if (!raw) return "—";
  const timePart = raw.includes(" ") ? raw.split(" ")[1] : raw;
  const [h, m] = timePart.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;
};

/* ─── helper: format created_at → "Today, 10:43 AM" ─── */
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

/* ─── helper: format type for display ─── */
const formatType = (type?: string) => {
  if (!type) return "—";
  return type.replace(/_/g, " ");
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
      className="fixed inset-0 z-[150] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-[#f5f8ff] to-[#eef2ff] rounded-[20px] shadow-2xl w-full max-w-[520px] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ═══════════ HEADER ═══════════ */}
        <div className="flex justify-between items-start px-6 pt-6 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
              <ClipboardCheck className="w-[18px] h-[18px] text-blue-500" />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-slate-800 leading-tight">
                Attendance Correction Request
              </h2>
              <p className="text-[12px] text-slate-400 mt-0.5">
                Review the request and take appropriate action
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all mt-0.5"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* ═══════════ BODY ═══════════ */}
        <div className="px-6 pb-6 space-y-3.5">

          {/* ─── Employee + Requested For ─── */}
          <div className="bg-white rounded-2xl border border-slate-100/80 px-5 py-4">
            <div className="flex items-center justify-between">
              {/* Employee */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
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
                    <User className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                    Employee
                  </p>
                  <p className="text-[14px] font-semibold text-slate-800 leading-snug">
                    {data.employee}
                  </p>
                  {data.employee_email && data.employee_email !== data.employee && (
                    <p className="text-[11px] text-slate-400">{data.employee_email}</p>
                  )}
                </div>
              </div>

              {/* Requested For */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
                    Requested For
                  </p>
                  <p className="text-[14px] font-semibold text-slate-800 leading-snug">
                    {formatWFHDate(data.date)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Correction Type + Proposed Time ─── */}
          <div className="grid grid-cols-2 gap-3">
            {/* Correction Type — with green left accent */}
            <div className="bg-white rounded-2xl border border-slate-100/80 p-4 relative overflow-hidden">
              <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-emerald-400" />
              <div className="flex items-start gap-2.5 pl-2">
                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Correction Type
                  </p>
                  <p className="text-[14px] font-semibold text-slate-800 leading-snug mt-0.5">
                    {formatType(data.type)}
                  </p>
                </div>
              </div>
            </div>

            {/* Proposed Time — with green left accent */}
            <div className="bg-white rounded-2xl border border-emerald-100 p-4 relative overflow-hidden">
              <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-emerald-400" />
              <div className="flex items-start gap-2.5 pl-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                    New Proposed Time
                  </p>
                  <p className="text-[15px] font-bold text-slate-800 leading-snug mt-0.5">
                    {formatProposedTime(data.time_only || data.requested_time)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Employee Justification ─── */}
          <div className="bg-white rounded-2xl border border-slate-100/80 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                <MessageSquare className="w-3.5 h-3.5 text-violet-500" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider mb-1">
                  Employee&apos;s Justification
                </p>
                <p className="text-[13px] text-slate-700 font-medium italic leading-relaxed">
                  &ldquo;{data.reason}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* ─── Status + Submitted On ─── */}
          <div className="bg-white rounded-2xl border border-slate-100/80 px-5 py-4">
            <div className="flex items-center justify-between">
              {/* Status */}
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  data.status === "APPROVED"
                    ? "bg-emerald-50"
                    : data.status === "REJECTED"
                    ? "bg-red-50"
                    : "bg-amber-50"
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
                    <p className="text-[12px] font-semibold text-slate-700">
                      STATUS
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
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
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isPending
                      ? "Awaiting your review and decision"
                      : "Action taken by administrator"}
                  </p>
                </div>
              </div>

              {/* Submitted On */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                  <CalendarClock className="w-3.5 h-3.5 text-orange-500" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Request Submitted On
                  </p>
                  <p className="text-[13px] font-semibold text-slate-800 leading-snug">
                    {formatSubmittedDate(data.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Admin Remarks + Actions (PENDING only) ─── */}
          {isPending && (
            <div className="space-y-3.5 pt-1">
              {/* Admin Remarks */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Pencil className="w-3.5 h-3.5 text-slate-400" />
                  <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    Add a note
                  </label>
                </div>
                <div className="relative">
                  <textarea
                    placeholder="Enter remarks or notes for the employee..."
                    value={comment}
                    onChange={(e) =>
                      setComment(e.target.value.slice(0, maxChars))
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl p-4 text-[13px] text-slate-600 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all outline-none resize-none placeholder:text-slate-300"
                    rows={3}
                  />
                  <span className="absolute bottom-3 right-3 text-[10px] text-slate-300">
                    {comment.length}/{maxChars}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => onAction("REJECT", comment)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-red-200 text-red-500 font-semibold text-[12px] rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 active:scale-[0.97]"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Request
                </button>

                <button
                  onClick={() => onAction("APPROVE", comment)}
                  className="flex-[1.3] flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-semibold text-[12px] rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all duration-200 active:scale-[0.97]"
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
                className="px-8 py-2.5 bg-slate-800 text-white font-semibold text-sm rounded-xl hover:bg-slate-900 transition-all"
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