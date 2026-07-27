import { CalendarCheck, PieChart, Timer } from "lucide-react";

export default function EmployeeLeaveSummaryCard({
  loading,
  summary
}: {
  loading: boolean;
  summary: any;
}) {
  if (loading) return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center justify-center mx-4 sm:mx-0">
      <div className="flex flex-col items-center gap-3">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-[10px] md:text-xs font-medium text-slate-500">Loading metrics...</p>
      </div>
    </div>
  );

  if (!summary) return null;

  const stats = [
    { 
      label: "TOTAL PAID LEAVE", 
      value: summary.total_leave, 
      borderLeft: "border-l-blue-500",
    },
    { 
      label: "CONSUMED LEAVE", 
      value: summary.taken_leave, 
      borderLeft: "border-l-amber-500",
    },
    { 
      label: "AVAILABLE BALANCE", 
      value: summary.remaining_leave, 
      borderLeft: "border-l-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4 w-full px-4 sm:px-0">
      {stats.map((stat, idx) => (
        <div 
          key={idx} 
          className={`flex flex-col justify-center bg-white border border-slate-200 rounded-xl p-3 md:p-5 border-l-[3px] md:border-l-[4px] ${stat.borderLeft} shadow-sm transition-all hover:shadow-md`}
        >
          <span className="text-lg sm:text-xl md:text-3xl font-black text-slate-800 leading-none mb-1">
            {stat.value}
          </span>
          <span className="text-[8px] sm:text-[9px] md:text-xs font-bold text-slate-400 tracking-wider md:tracking-widest uppercase leading-tight line-clamp-2 md:line-clamp-1">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}