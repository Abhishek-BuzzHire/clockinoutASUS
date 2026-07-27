import { CalendarCheck, PieChart, Timer } from "lucide-react";

export default function EmployeeLeaveSummaryCard({
  loading,
  summary
}: {
  loading: boolean;
  summary: any;
}) {
  if (loading) return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-xs font-medium text-slate-500">Loading metrics...</p>
      </div>
    </div>
  );

  if (!summary) return null;

  const stats = [
    { 
      label: "Total Paid Leave", 
      value: summary.total_leave, 
      icon: CalendarCheck, 
      borderLeft: "border-l-blue-500",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    { 
      label: "Leave Consumed", 
      value: summary.taken_leave, 
      icon: PieChart, 
      borderLeft: "border-l-amber-500",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600"
    },
    { 
      label: "Available Balance", 
      value: summary.remaining_leave, 
      icon: Timer, 
      borderLeft: "border-l-emerald-500",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {stats.map((stat, idx) => (
        <div 
          key={idx} 
          className={`flex flex-col justify-center bg-white border border-slate-200 rounded-xl p-4 md:p-5 border-l-[4px] ${stat.borderLeft} shadow-sm`}
        >
          <span className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">
            {stat.value}
          </span>
          <span className="text-[10px] md:text-xs font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}