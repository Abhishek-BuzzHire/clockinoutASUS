import { 
  X, 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertCircle 
} from "lucide-react";
import { formatWFHDate } from "./EmployeeWFHHistoryTable";

export default function AdminLeaveDetailModal({
  leave,
  onClose,
  onApprove,
  onReject
}: {
  leave: any;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  if (!leave) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 tracking-tight">Leave Request Review</h2>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">Reference ID: #{leave.leave_id || 'N/A'}</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="p-8 space-y-8">
          
          {/* SECTION 1: EMPLOYEE INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Employee</p>
                <p className="font-bold text-slate-800">{leave.user_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Contact Email</p>
                <p className="text-sm text-slate-800 truncate">{leave.user_email}</p>
              </div>
            </div>
          </div>

          {/* SECTION 2: LEAVE SPECIFICS */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                <Calendar className="w-3 h-3" /> Start Date
              </p>
              <p className="text-sm font-bold text-slate-700 bg-white border border-slate-100 p-3 rounded-xl shadow-sm italic">
                {formatWFHDate(leave.start_date)}
              </p>
            </div>
            <div className="space-y-1 text-center">
              <p className="flex justify-center items-center gap-1.5 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                <Clock className="w-3 h-3" /> Total Duration
              </p>
              <div className="flex justify-center items-center h-[46px] bg-blue-600 text-white font-semibold text-lg rounded-xl shadow-lg shadow-blue-100">
                {leave.total_days} <span className="text-[10px] ml-1 uppercase opacity-80">Days</span>
              </div>
            </div>
            <div className="space-y-1 text-right">
              <p className="flex justify-end items-center gap-1.5 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                End Date <Calendar className="w-3 h-3" />
              </p>
              <p className="text-sm font-bold text-slate-700 bg-white border border-slate-100 p-3 rounded-xl shadow-sm italic">
                {formatWFHDate(leave.end_date)}
              </p>
            </div>
          </div>

          {/* SECTION 3: REASON BOX */}
          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-1">
              <AlertCircle className="w-3.5 h-3.5 text-blue-500" /> Statement of Reason
            </p>
            <div className="p-5 bg-white border-2 border-dashed border-slate-200 rounded-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-2 h-full bg-slate-50" />
               <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                 "{leave.reason || "No specific reason provided."}"
               </p>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100">
          {leave.status === "PENDING" ? (
            <div className="flex gap-4">
              <button
                onClick={onReject}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-rose-100 text-rose-600 font-semibold text-xs uppercase tracking-widest rounded-xl hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all active:scale-[0.98] shadow-sm"
              >
                <XCircle className="w-4 h-4" />
                Reject Request
              </button>

              <button
                onClick={onApprove}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white font-semibold text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve Request
              </button>
            </div>
          ) : (
            <button 
              onClick={onClose}
              className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-lg shadow-slate-200"
            >
              Close Record
            </button>
          )}
        </div>

      </div>
    </div>
  );
}