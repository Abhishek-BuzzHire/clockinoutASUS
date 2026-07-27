import { 
  Eye, 
  Calendar, 
  Clock, 
  User as UserIcon, 
  ChevronRight, 
  FileText 
} from "lucide-react";
import LeaveStatusBadge from "./LeaveStatusBadge";
import { formatWFHDate } from "./EmployeeWFHHistoryTable";

export default function AdminLeaveListTable({
  loading,
  leaves,
  onView
}: {
  loading: boolean;
  leaves: any[];
  onView: (leave: any) => void;
}) {
  // --- LOADING STATE ---
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Retrieving leave requests...</p>
      </div>
    );

  // --- EMPTY STATE ---
  if (!leaves.length)
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="p-4 bg-slate-50 rounded-full mb-4">
          <FileText className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-700">No Pending Requests</h3>
        <p className="text-slate-400 text-sm max-w-xs">There are currently no leave applications requiring your attention.</p>
      </div>
    );

  return (
    <div className="space-y-4">
      {/* HEADER INFO */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
           <div className="w-1 h-6 bg-blue-600 rounded-full" />
           <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Leave Applications</h2>
        </div>
        <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-1 rounded-md border border-slate-200 uppercase tracking-tighter">
          {leaves.length} Total
        </span>
      </div>

      {/* CARD LIST */}
      <div className="grid grid-cols-1 gap-3">
        {leaves.map((l) => (
          <div 
            key={l.leave_id}
            className="group relative bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* LEFT: EMPLOYEE PROFILE */}
              <div className="flex items-center gap-4 min-w-[250px]">
                <div className="relative">
                   <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 border border-slate-100">
                      <UserIcon className="w-6 h-6" />
                   </div>
                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Active Employee" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                    {l.user_name}
                  </h4>
                  <p className="text-sm text-slate-600 truncate max-w-[180px]">
                    {l.user_email}
                  </p>
                </div>
              </div>

              {/* MIDDLE: LEAVE DETAILS */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
                
                {/* DURATION */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    <Calendar className="w-3 h-3" /> Duration
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    {formatWFHDate(l.start_date)} <span className="text-slate-300 mx-1 font-normal">→</span> {formatWFHDate(l.end_date)}
                  </p>
                </div>

                {/* DAYS & REASON */}
                <div className="flex flex-col gap-1">
                   <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    <Clock className="w-3 h-3" /> Total Days
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-blue-700">{l.total_days} Days</span>
                    <span className="text-slate-200">|</span>
                    <p className="text-xs text-slate-500 italic truncate max-w-[120px]" title={l.reason}>
                      "{l.reason}"
                    </p>
                  </div>
                </div>

                {/* STATUS BADGE */}
                <div className="flex sm:justify-center lg:justify-end">
                  <LeaveStatusBadge status={l.status} />
                </div>
              </div>

              {/* RIGHT: ACTION BUTTON */}
              <div className="flex items-center md:pl-4 border-l border-slate-100">
                <button
                  onClick={() => onView(l)}
                  className="flex items-center justify-center gap-2 w-full md:w-auto px-5 py-2.5 bg-slate-50 hover:bg-blue-600 text-slate-600 hover:text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-sm border border-slate-200 hover:border-blue-600 active:scale-95"
                >
                  <Eye className="w-4 h-4" />
                  View Request
                  <ChevronRight className="w-3.5 h-3.5 ml-1 opacity-50" />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}