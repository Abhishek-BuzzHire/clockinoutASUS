import { 
  User, 
  Calendar, 
  Clock, 
  Eye, 
  History,
  Mail
} from "lucide-react";
import WFHStatusBadge from "./WFHStatusBadge";
import { formatFullDateTime, formatWFHDate } from "./EmployeeWFHHistoryTable";

export default function AdminWFHListTable({
  loading,
  list,
  onView
}: {
  loading: boolean;
  list: any[];
  onView: (wfh: any) => void;
}) {
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Scanning WFH requests...</p>
      </div>
    );

  if (!list.length)
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="p-4 bg-slate-50 rounded-full mb-4">
          <Calendar className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-700">No Pending WFH</h3>
        <p className="text-slate-400 text-sm max-w-xs">All remote work applications have been processed.</p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 gap-4">
      {list.map((wfh) => (
        <div 
          key={wfh.wfh_id}
          className="group relative bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* EMPLOYEE PROFILE */}
            <div className="flex items-center gap-4 min-w-[250px]">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                  {wfh.user_name}
                </h4>
                <div className="flex items-center gap-1 mt-0.5">
                   <Mail className="w-3 h-3 text-slate-300" />
                   <span className="text-sm text-slate-400 font-medium truncate max-w-[150px]">{wfh.user_email}</span>
                </div>
              </div>
            </div>

            {/* WFH DETAILS */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              
              {/* TARGET DATE */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  <Calendar className="w-3 h-3" /> WFH Date
                </div>
                <p className="text-sm font-black text-slate-700 tracking-tight">
                  {formatWFHDate(wfh.date)}
                </p>
              </div>

              {/* TIMELINE */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  <Clock className="w-3 h-3" /> Applied At
                </div>
                <p className="text-sm font-bold text-slate-500 italic">
                  {formatFullDateTime(wfh.applied_at)}
                </p>
              </div>

              {/* STATUS */}
              <div className="flex sm:justify-end lg:pr-6">
                <WFHStatusBadge status={wfh.status} />
              </div>

            </div>

            {/* ACTION BUTTON */}
            <div className="flex items-center pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6">
              <button
                onClick={() => onView(wfh)}
                className="w-full lg:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md active:scale-95"
              >
                <Eye className="w-4 h-4" />
                Review Request
              </button>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}