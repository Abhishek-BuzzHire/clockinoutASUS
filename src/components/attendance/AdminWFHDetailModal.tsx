import { 
  X, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Info,
  ShieldCheck,
  History
} from "lucide-react";
import { formatFullDateTime, formatWFHDate } from "./EmployeeWFHHistoryTable";

export default function AdminWFHDetailModal({
  wfh,
  onClose,
  onApprove,
  onReject
}: {
  wfh: any;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  if (!wfh) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 border border-indigo-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 tracking-tight">WFH Authorization</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Request ID: #{wfh.wfh_id || 'N/A'}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-8 space-y-6">
          
          {/* PROFILE CARD */}
          <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400 mb-3 shadow-sm">
              <User className="w-8 h-8" />
            </div>
            <h3 className="font-black text-slate-800 text-lg leading-tight">{wfh.user_name}</h3>
            <p className="text-sm text-slate-500 font-medium mb-4">{wfh.user_email}</p>
            
            <div className="w-full h-px bg-slate-200 mb-4" />
            
            <div className="flex gap-8 justify-center w-full">
              <div className="text-center">
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-1">Requested For</p>
                <div className="flex items-center gap-1.5 text-blue-700 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  <Calendar className="w-3.5 h-3.5" /> {formatWFHDate(wfh.date)}
                </div>
              </div>
            </div>
          </div>

          {/* AUDIT TIMELINE */}
          <div className="space-y-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-widest px-1">
              <History className="w-3.5 h-3.5 text-indigo-500" /> Audit Trail
            </p>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                <span className="text-xs font-bold text-slate-500">Submission Timestamp</span>
                <span className="text-xs font-mono font-bold text-slate-700">{formatFullDateTime(wfh.applied_at)}</span>
              </div>
              {wfh.actioned_at && (
                <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <span className="text-xs font-bold text-slate-500">Processing Timestamp</span>
                  <span className="text-xs font-mono font-bold text-slate-700">{formatFullDateTime(wfh.actioned_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* STATUS INFO */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
             <Info className="w-5 h-5 text-amber-500 shrink-0" />
             <p className="text-xs text-amber-800 font-medium leading-relaxed">
               Approving this request will allow the employee to log work remotely for the specified date. Ensure this aligns with team coverage.
             </p>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100">
          {wfh.status === "PENDING" ? (
            <div className="flex gap-4">
              <button
                onClick={onReject}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-rose-100 text-rose-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all active:scale-[0.98] shadow-sm"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>

              <button
                onClick={onApprove}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </button>
            </div>
          ) : (
            <button 
              onClick={onClose}
              className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-lg"
            >
              Close Record
            </button>
          )}
        </div>

      </div>
    </div>
  );
}