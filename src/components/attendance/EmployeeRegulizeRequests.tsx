'use client'

import { 
  User, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Eye, 
  AlertCircle,
  Hash
} from "lucide-react";
import ActionStatusBadge from "./ActionStatusBadge";
import { formatWFHDate } from "./EmployeeWFHHistoryTable";

export default function EmployeeRegulizeRequests({
  loading,
  list
}: {
  loading: boolean;
  list: any[];
}) {
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Scanning correction requests...</p>
      </div>
    );

  if (!list.length)
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="p-4 bg-slate-50 rounded-full mb-4">
          <AlertCircle className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-700">All Clear</h3>
        <p className="text-slate-400 text-sm max-w-xs italic">No attendance correction requests require attention at this moment.</p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 gap-4">
      {list.map((req) => (
        <div 
          key={req.id}
          className="group relative bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* CORRECTION DETAILS */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              
              {/* DATE */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <Calendar className="w-3 h-3" /> Target Date
                </div>
                <p className="text-sm font-bold text-slate-700">{formatWFHDate(req.date)}</p>
              </div>

              {/* REQUEST TYPE */}
              <div className="space-y-1">
                 <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <ArrowRight className="w-3 h-3" /> Correction Type
                </div>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-bold">
                  {req.type}
                </span>
              </div>

              {/* REQUESTED TIME */}
              <div className="space-y-1">
                 <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <Clock className="w-3 h-3" /> Proposed Time
                </div>
                <p className="text-sm font-black text-blue-700 font-mono tracking-tight">{req.requested_time}</p>
              </div>
            </div>

            {/* STATUS & ACTION */}
            <div className="flex items-center justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6">
              <ActionStatusBadge status={req.status} />
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}