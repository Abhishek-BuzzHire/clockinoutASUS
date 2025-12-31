import { useState } from "react";
import { 
  Calendar, 
  FileText, 
  X, 
  Info, 
  Send, 
  ChevronRight,
  Clock
} from "lucide-react";

export default function ApplyLeaveModal({
  onClose,
  onSubmit
}: {
  onClose: () => void;
  onSubmit: (data: {
    start_date: string;
    end_date: string;
    reason: string;
  }) => void;
}) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 tracking-tight">Request Leave</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Absence Management</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM BODY */}
        <div className="p-6 space-y-6">
          
          {/* DATE RANGE SELECTOR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Start Date
              </label>
              <div className="relative group">
                <input
                  type="date"
                  className="w-full border border-slate-200 bg-slate-50/30 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                  value={start}
                  min={today}
                  onChange={e => setStart(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5" /> End Date
              </label>
              <div className="relative group">
                <input
                  type="date"
                  className="w-full border border-slate-200 bg-slate-50/30 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                  value={end}
                  min={start || today}
                  onChange={e => setEnd(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* REASON TEXTAREA */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Reason for Absence
            </label>
            <textarea
              className="w-full border border-slate-200 bg-slate-50/30 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none min-h-[120px]"
              rows={4}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Provide a brief explanation for your leave request..."
            />
          </div>

          {/* HELPER INFO */}
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
              Your request will be forwarded to your immediate supervisor for approval. 
              Please ensure you have enough remaining leave balance before submitting.
            </p>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center gap-3 border-t border-slate-100 p-6 bg-slate-50/30">
          <button 
            onClick={onClose} 
            className="flex-1 px-5 py-2.5 border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition-all active:scale-[0.98]"
          >
            Cancel
          </button>

          <button
            className="flex-[2] flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-[0.98]"
            onClick={() => onSubmit({
              start_date: start,
              end_date: end,
              reason
            })}
          >
            <Send className="w-4 h-4" />
            Submit Request
          </button>
        </div>

      </div>
    </div>
  );
}