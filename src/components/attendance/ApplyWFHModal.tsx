import { useState } from "react";
import { X, Calendar, Send, Home, Info, Laptop } from "lucide-react";

export default function ApplyWFHModal({
  onClose,
  onSubmit
}: {
  onClose: () => void;
  onSubmit: (date: string) => void;
}) {
  const [date, setDate] = useState("");
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 tracking-tight">Request WFH</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Remote Work Log</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
          
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <Calendar className="w-3.5 h-3.5" /> Proposed Date
            </label>
            <div className="relative">
              <input
                type="date"
                className="w-full border border-slate-200 bg-slate-50/30 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                value={date}
                min={today}
                onChange={e => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* HELPER INFO */}
          <div className="flex gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-indigo-800 uppercase tracking-tight">Policy Notice</p>
              <p className="text-xs text-indigo-600 leading-relaxed font-medium">
                Remote work requests are subject to team capacity and manager approval. Please ensure your tasks are documented.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center gap-3 border-t border-slate-100 p-6 bg-slate-50/30">
          <button 
            onClick={onClose} 
            className="flex-1 px-5 py-2.5 border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition-all active:scale-[0.98]"
          >
            Cancel
          </button>

          <button
            className="flex-[2] flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
            onClick={() => onSubmit(date)}
            disabled={!date}
          >
            <Send className="w-4 h-4" />
            Submit Request
          </button>
        </div>

      </div>
    </div>
  );
}