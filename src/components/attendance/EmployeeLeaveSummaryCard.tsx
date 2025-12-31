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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, idx) => (
        <div 
          key={idx} 
          className={`relative overflow-hidden bg-white border ${stat.borderColor} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group`}
        >
          {/* Subtle background decoration */}
          <div className={`absolute -right-4 -bottom-4 opacity-[0.03] transition-transform group-hover:scale-110 duration-500`}>
            <stat.icon className="w-32 h-32" />
          </div>

          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.textColor}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black ${stat.textColor}`}>{stat.value}</span>
                <span className="text-xs font-semibold text-slate-400">Days</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}