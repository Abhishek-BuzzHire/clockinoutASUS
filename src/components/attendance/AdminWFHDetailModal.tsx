import { useState, useEffect } from "react";
import { 
  X, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Info,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  Timer
} from "lucide-react";
import { formatFullDateTime, formatWFHDate } from "./EmployeeWFHHistoryTable";
import { apiUrl } from "@/lib/data";

const statusTheme: Record<string, {
  gradient: string;
  badge: string;
  badgeText: string;
  glow: string;
  icon: any;
  label: string;
}> = {
  PENDING: {
    gradient: "from-amber-500/20 via-orange-500/10 to-yellow-500/20",
    badge: "bg-amber-500/15 border-amber-400/30",
    badgeText: "text-amber-300",
    glow: "shadow-amber-500/20",
    icon: Clock,
    label: "Awaiting Review",
  },
  APPROVED: {
    gradient: "from-emerald-500/20 via-teal-500/10 to-green-500/20",
    badge: "bg-emerald-500/15 border-emerald-400/30",
    badgeText: "text-emerald-300",
    glow: "shadow-emerald-500/20",
    icon: CheckCircle2,
    label: "Approved",
  },
  REJECTED: {
    gradient: "from-rose-500/20 via-red-500/10 to-pink-500/20",
    badge: "bg-rose-500/15 border-rose-400/30",
    badgeText: "text-rose-300",
    glow: "shadow-rose-500/20",
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

  // Inject animation keyframes once
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
      className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-white/[0.08] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: "modalSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* AMBIENT GLOW BACKGROUND */}
        <div className={`absolute top-0 left-0 right-0 h-72 bg-gradient-to-b ${theme.gradient} opacity-60 blur-2xl pointer-events-none`} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* HEADER BAR */}
        <div className="relative flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/30 rounded-xl blur-md" />
              <div className="relative p-2.5 bg-blue-500/20 border border-blue-400/20 rounded-xl backdrop-blur-sm">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">WFH Authorization</h2>
              <p className="text-[10px] text-slate-500 font-mono font-semibold">
                REQUEST #{wfh.wfh_id || '—'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* DIVIDER */}
        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* CONTENT */}
        <div className="relative px-6 py-6 space-y-5">

          {/* PROFILE SECTION */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center overflow-hidden shadow-lg">
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
                  <User className="w-7 h-7 text-slate-500" />
                )}
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-slate-900 rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              </div>
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white leading-tight truncate">{wfh.user_name}</h3>
              <p className="text-xs text-slate-500 font-medium truncate">{wfh.user_email}</p>
            </div>
          </div>

          {/* WFH DATE CARD */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 via-indigo-600/15 to-violet-600/20 border border-blue-400/15 p-[1px]">
            <div className="rounded-2xl bg-slate-900/80 backdrop-blur-xl px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-blue-400/70 uppercase tracking-[0.15em] mb-1">
                    Requested For
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-lg font-black text-white tracking-tight">
                      {formatWFHDate(wfh.date)}
                    </span>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${theme.badge} backdrop-blur-sm`}>
                  <StatusIcon className={`w-3 h-3 ${theme.badgeText}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.badgeText}`}>
                    {theme.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TIMELINE */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] px-1 mb-3 flex items-center gap-1.5">
              <Timer className="w-3 h-3 text-slate-600" />
              Activity Timeline
            </p>
            
            <div className="relative pl-5">
              {/* Vertical connector line */}
              <div className={`absolute left-[7px] top-3 w-px ${isProcessed ? 'h-[calc(100%-24px)]' : 'h-0'} bg-gradient-to-b from-blue-500/40 to-emerald-500/40 transition-all duration-500`} />

              {/* Submitted */}
              <div className="relative flex items-start gap-3 pb-4">
                <div className="absolute left-[-13px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-slate-900 shadow-sm shadow-blue-500/50 z-10" />
                <div className="flex-1 flex items-center justify-between bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 hover:bg-white/[0.06] transition-colors">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[11px] font-semibold text-slate-400">Submitted</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-300">
                    {formatFullDateTime(wfh.applied_at)}
                  </span>
                </div>
              </div>

              {/* Processed - Only show when actually actioned */}
              {isProcessed && wfh.actioned_at && (
                <div className="relative flex items-start gap-3">
                  <div className={`absolute left-[-13px] top-1.5 w-2.5 h-2.5 rounded-full ${wfh.status === 'APPROVED' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-rose-500 shadow-rose-500/50'} border-2 border-slate-900 shadow-sm z-10`} />
                  <div className="flex-1 flex items-center justify-between bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 hover:bg-white/[0.06] transition-colors">
                    <div className="flex items-center gap-2">
                      {wfh.status === 'APPROVED' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      )}
                      <span className="text-[11px] font-semibold text-slate-400">
                        {wfh.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-300">
                      {formatFullDateTime(wfh.actioned_at)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* INFO BANNER */}
          {wfh.status === "PENDING" && (
            <div className="flex gap-3 p-4 rounded-xl bg-blue-500/[0.07] border border-blue-400/10">
              <div className="shrink-0 mt-0.5">
                <Info className="w-4 h-4 text-blue-400/70" />
              </div>
              <p className="text-[11px] text-blue-300/70 leading-relaxed font-medium">
                Approving lets this employee log remote attendance for the above date. Check it aligns with your team&apos;s coverage.
              </p>
            </div>
          )}

          {wfh.status === "APPROVED" && (
            <div className="flex gap-3 p-4 rounded-xl bg-emerald-500/[0.07] border border-emerald-400/10">
              <div className="shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-emerald-400/70" />
              </div>
              <p className="text-[11px] text-emerald-300/70 leading-relaxed font-medium">
                This WFH request has been approved. The employee can log remote work for the specified date.
              </p>
            </div>
          )}

          {wfh.status === "REJECTED" && (
            <div className="flex gap-3 p-4 rounded-xl bg-rose-500/[0.07] border border-rose-400/10">
              <div className="shrink-0 mt-0.5">
                <XCircle className="w-4 h-4 text-rose-400/70" />
              </div>
              <p className="text-[11px] text-rose-300/70 leading-relaxed font-medium">
                This WFH request has been rejected. The employee will need to submit a new request if needed.
              </p>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="relative px-6 pb-6 pt-2">
          {wfh.status === "PENDING" ? (
            <div className="flex gap-3">
              {/* REJECT */}
              <button
                onClick={onReject}
                className="group/btn flex-1 relative overflow-hidden flex items-center justify-center gap-2 px-5 py-3.5 bg-white/[0.05] border border-rose-500/20 text-rose-400 font-bold text-xs uppercase tracking-wider rounded-2xl hover:bg-rose-500/15 hover:border-rose-500/40 transition-all duration-300 active:scale-[0.97]"
              >
                <XCircle className="w-4 h-4 transition-transform group-hover/btn:rotate-90 duration-300" />
                Reject
              </button>

              {/* APPROVE */}
              <button
                onClick={onApprove}
                className="group/btn flex-[1.3] relative overflow-hidden flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/25 transition-all duration-300 active:scale-[0.97]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                <CheckCircle2 className="w-4 h-4 relative z-10 transition-transform group-hover/btn:scale-110 duration-300" />
                <span className="relative z-10">Approve</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={onClose}
              className="w-full py-3.5 bg-white/[0.06] border border-white/[0.08] text-slate-400 font-bold text-xs uppercase tracking-wider rounded-2xl hover:bg-white/[0.1] hover:text-white transition-all duration-300 active:scale-[0.98]"
            >
              Close Record
            </button>
          )}
        </div>


      </div>
    </div>
  );
}