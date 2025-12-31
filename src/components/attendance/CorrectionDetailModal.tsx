'use client'

import { useState } from "react";
import { 
  X, 
  User, 
  Calendar, 
  Clock, 
  Info, 
  MessageSquare, 
  CheckCircle2, 
  XCircle,
  FileEdit
} from "lucide-react";
import ActionStatusBadge from "./ActionStatusBadge";
import { formatWFHDate } from "./EmployeeWFHHistoryTable";

export default function CorrectionDetailModal({
  data,
  onClose,
  onAction
}: {
  data: any;
  onClose: () => void;
  onAction: (a: "APPROVE" | "REJECT", c: string) => void;
}) {
  const [comment, setComment] = useState("");

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600 border border-amber-200">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 tracking-tight">Attendance Correction</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Modification Request</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          
          {/* USER & DATE HEADER */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</p>
                <p className="text-sm font-bold text-slate-800">{data.employee}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Log Date</p>
              <p className="text-sm font-bold text-slate-800">{formatWFHDate(data.date)}</p>
            </div>
          </div>

          {/* CORRECTION GRID */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Info className="w-3 h-3" /> Correction Type
              </p>
              <p className="text-sm font-bold text-slate-700">{data.type}</p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl shadow-sm shadow-blue-500/5">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> New Proposed Time
              </p>
              <p className="text-sm font-black text-blue-700 font-mono tracking-tight">{data.requested_time}</p>
            </div>
          </div>

          {/* REASON BOX */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Employee's Justification</label>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl italic text-sm text-slate-600 leading-relaxed font-medium">
              "{data.reason}"
            </div>
          </div>

          {/* CURRENT STATUS */}
          <div className="flex justify-center border-t border-slate-100 pt-6">
            <ActionStatusBadge status={data.status} />
          </div>

          {/* ADMIN COMMENT & ACTIONS */}
          {data.status === "PENDING" && (
            <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                  <MessageSquare className="w-3.5 h-3.5" /> Administrator Remarks
                </label>
                <textarea
                  placeholder="Enter notes for the employee (e.g., 'Approved based on CCTV')"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-4 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => onAction("REJECT", comment)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-rose-100 text-rose-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all active:scale-[0.98] shadow-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>

                <button
                  onClick={() => onAction("APPROVE", comment)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </button>
              </div>
            </div>
          )}
        </div>

        {/* COMPLETED FOOTER */}
        {data.status !== "PENDING" && (
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-center">
            <button 
              onClick={onClose}
              className="px-8 py-2.5 bg-slate-800 text-white font-bold text-sm rounded-xl hover:bg-slate-900 transition-all"
            >
              Dismiss Record
            </button>
          </div>
        )}

      </div>
    </div>
  );
}