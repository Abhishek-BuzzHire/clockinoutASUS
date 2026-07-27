import { CalendarCheck, PieChart, Timer, Sparkles } from "lucide-react";

export default function EmployeeLeaveSummaryCard({
  loading,
  summary
}: {
  loading: boolean;
  summary: any;
}) {
  if (loading) return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[24px] border border-white/40 shadow-sm p-8 flex items-center justify-center min-h-[160px]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10 flex items-center justify-center">
           <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full animate-ping opacity-75"></div>
           <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Calculating entitlements...</p>
      </div>
    </div>
  );

  if (!summary) return null;

  const stats = [
    { 
      label: "Total Entitlement", 
      value: summary.total_leave, 
      icon: CalendarCheck, 
      gradient: "from-blue-500 to-indigo-600",
      shadow: "shadow-blue-500/20",
    },
    { 
      label: "Leave Consumed", 
      value: summary.taken_leave, 
      icon: PieChart, 
      gradient: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/20",
    },
    { 
      label: "Available Balance", 
      value: summary.remaining_leave, 
      icon: Timer, 
      gradient: "from-emerald-400 to-teal-500",
      shadow: "shadow-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 w-full">
      {stats.map((stat, idx) => (
        <div 
          key={idx} 
          className={`relative overflow-hidden bg-white rounded-[24px] border border-slate-100 p-5 md:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${stat.shadow} group`}
        >
          {/* Top glowing accent line */}
          <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${stat.gradient} opacity-80`} />
          
          {/* Subtle background glow effect on hover */}
          <div className={`absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.08] transition-opacity duration-500`} />
          
          <div className="flex items-start justify-between w-full mb-4 relative z-10">
            <div className={`p-3 rounded-[16px] bg-gradient-to-br ${stat.gradient} text-white shadow-md ${stat.shadow} transition-transform duration-300 group-hover:scale-110`}>
              <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            
            {/* Optional badge or decorative element */}
            <div className="hidden group-hover:flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider animate-in fade-in zoom-in duration-300 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
               <Sparkles className="w-3 h-3 text-amber-400" /> Updated
            </div>
          </div>
          
          <div className="relative z-10 mt-1">
            <h3 className="text-[11px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{stat.label}</h3>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-4xl md:text-5xl font-black bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent drop-shadow-sm leading-tight tracking-tight`}>
                {stat.value}
              </span>
              <span className="text-xs md:text-sm font-bold text-slate-400">Days</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}