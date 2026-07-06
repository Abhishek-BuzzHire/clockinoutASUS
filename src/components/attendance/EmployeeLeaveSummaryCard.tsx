import { CalendarCheck, PieChart, Timer } from "lucide-react";

export default function EmployeeLeaveSummaryCard({
  loading,
  summary
}: {
  loading: boolean;
  summary: any;
}) {
  if (loading) return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500 italic">Updating leave metrics...</p>
      </div>
    </div>
  );

  if (!summary) return null;

  const stats = [
    { 
      label: "Total Entitlement", 
      value: summary.total_leave, 
      icon: CalendarCheck, 
      bgColor: "bg-blue-50", 
      textColor: "text-blue-700", 
      borderColor: "border-blue-100" 
    },
    { 
      label: "Leave Consumed", 
      value: summary.taken_leave, 
      icon: PieChart, 
      bgColor: "bg-amber-50", 
      textColor: "text-amber-700", 
      borderColor: "border-amber-100" 
    },
    { 
      label: "Available Balance", 
      value: summary.remaining_leave, 
      icon: Timer, 
      bgColor: "bg-emerald-50", 
      textColor: "text-emerald-700", 
      borderColor: "border-emerald-100" 
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-row divide-x divide-slate-100">
      {stats.map((stat, idx) => (
        <div 
          key={idx} 
          className="flex-1 p-3 md:p-5 flex flex-col items-center justify-center text-center relative group bg-white hover:bg-slate-50 transition-colors"
        >
          {/* Background icon for subtle aesthetic */}
          <div className="absolute inset-0 opacity-[0.02] flex items-center justify-center pointer-events-none overflow-hidden">
            <stat.icon className="w-16 h-16 transform group-hover:scale-110 transition-transform duration-500" />
          </div>

          <div className={`p-1.5 md:p-2.5 rounded-xl ${stat.bgColor} ${stat.textColor} mb-2`}>
            <stat.icon className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <p className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest line-clamp-1">{stat.label}</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-xl md:text-3xl font-black ${stat.textColor} leading-none`}>{stat.value}</span>
            <span className="text-[9px] md:text-xs font-semibold text-slate-400">Days</span>
          </div>
        </div>
      ))}
    </div>
  );
}