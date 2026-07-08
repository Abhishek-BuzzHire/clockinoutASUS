import { useState, useEffect } from "react";
import { 
  X, 
  User, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Info,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  Clock,
  Timer
} from "lucide-react";
import { formatFullDateTime, formatWFHDate } from "./EmployeeWFHHistoryTable";
import { apiUrl } from "@/lib/data";

const statusTheme: Record<string, {
  badge: string;
  badgeText: string;
  icon: any;
  label: string;
}> = {
  PENDING: {
    badge: "bg-amber-50 border-amber-200",
    badgeText: "text-amber-600",
    icon: Clock,
    label: "Awaiting Review",
  },
  APPROVED: {
    badge: "bg-emerald-50 border-emerald-200",
    badgeText: "text-emerald-600",
    icon: CheckCircle2,
    label: "Approved",
  },
  REJECTED: {
    badge: "bg-rose-50 border-rose-200",
    badgeText: "text-rose-600",
    icon: XCircle,
    label: "Rejected",
  },
};

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
  const [photoTimestamp] = useState(Date.now());

  useEffect(() => {
    if (document.getElementById('wfh-modal-keyframes')) return;
    const style = document.createElement('style');
    style.id = 'wfh-modal-keyframes';
    style.textContent = `
      @keyframes modalSlideIn {
        from { opacity: 0; transform: translateY(20px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  if (!wfh) return null;

  const theme = statusTheme[wfh.status] || statusTheme.PENDING;
  const StatusIcon = theme.icon;
  const isProcessed = wfh.status === "APPROVED" || wfh.status === "REJECTED";

  return (
    <div 
      className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: "modalSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 border border-indigo-200 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 tracking-tight">WFH Request</h2>
              <p className="text-[10px] text-slate-400 font-mono font-semibold">
                REQUEST #{wfh.wfh_id || '—'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>



        {/* CONTENT */}
        <div className="px-6 py-6 space-y-5">

          {/* PROFILE */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
                {wfh.profile_photo ? (
                  <img 
                    src={
                      wfh.profile_photo.includes('?')
                        ? `${apiUrl}${wfh.profile_photo}`
                        : `${apiUrl}${wfh.profile_photo}?t=${photoTimestamp}`
                    } 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User className="w-7 h-7 text-slate-400" />
                )}
              </div>
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-800 leading-tight truncate">{wfh.user_name}</h3>
              <p className="text-xs text-slate-400 font-medium truncate">{wfh.user_email}</p>
            </div>
          </div>

          {/* DATE CARD */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-[0.15em] mb-1">
                  Requested For
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-lg font-black text-slate-800 tracking-tight">
                    {formatWFHDate(wfh.date)}
                  </span>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${theme.badge}`}>
                <StatusIcon className={`w-3 h-3 ${theme.badgeText}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.badgeText}`}>
                  {theme.label}
                </span>
              </div>
            </div>
          </div>

          {/* TIMELINE — only show when processed (approved/rejected) */}
          {isProcessed && wfh.actioned_at && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] px-1 mb-3 flex items-center gap-1.5">
                <Timer className="w-3 h-3 text-slate-400" />
                Activity Timeline
              </p>
              
              <div className="relative pl-5">
                {/* Vertical connector line */}
                <div className="absolute left-[7px] top-3 h-[calc(100%-24px)] w-px bg-gradient-to-b from-blue-300 to-emerald-300" />

                {/* Submitted */}
                <div className="relative flex items-start gap-3 pb-4">
                  <div className="absolute left-[-13px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white shadow-sm z-10" />
                  <div className="flex-1 flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-[11px] font-semibold text-slate-500">Submitted</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-600">
                      {formatFullDateTime(wfh.applied_at)}
                    </span>
                  </div>
                </div>

                {/* Actioned */}
                <div className="relative flex items-start gap-3">
                  <div className={`absolute left-[-13px] top-1.5 w-2.5 h-2.5 rounded-full ${wfh.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-rose-500'} border-2 border-white shadow-sm z-10`} />
                  <div className="flex-1 flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      {wfh.status === 'APPROVED' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      )}
                      <span className="text-[11px] font-semibold text-slate-500">
                        {wfh.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-600">
                      {formatFullDateTime(wfh.actioned_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INFO BANNER */}
          {wfh.status === "PENDING" && (
            <div className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
              <div className="shrink-0 mt-0.5">
                <Info className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                Approving lets this employee log remote attendance for the above date. Check it aligns with your team&apos;s coverage.
              </p>
            </div>
          )}

          {wfh.status === "APPROVED" && (
            <div className="flex gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">
                This WFH request has been approved. The employee can log remote work for the specified date.
              </p>
            </div>
          )}

          {wfh.status === "REJECTED" && (
            <div className="flex gap-3 p-4 rounded-xl bg-rose-50 border border-rose-100">
              <div className="shrink-0 mt-0.5">
                <XCircle className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed font-medium">
                This WFH request has been rejected. The employee will need to submit a new request if needed.
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 pb-6 pt-2">
          {wfh.status === "PENDING" ? (
            <div className="flex gap-3">
              <button
                onClick={onReject}
                className="group/btn flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-white border-2 border-rose-100 text-rose-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all duration-300 active:scale-[0.97] shadow-sm"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>

              <button
                onClick={onApprove}
                className="group/btn flex-[1.3] relative overflow-hidden flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all duration-300 active:scale-[0.97]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                <CheckCircle2 className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Approve</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={onClose}
              className="w-full py-3.5 bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-900 transition-all duration-300 active:scale-[0.98] shadow-lg"
            >
              Close Record
            </button>
          )}
        </div>

      </div>
    </div>
  );
}