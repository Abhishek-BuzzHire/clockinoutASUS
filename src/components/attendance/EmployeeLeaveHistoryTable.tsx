import { Clock, Calendar, FileText, CheckCircle2, XCircle, AlertCircle, Trash2 } from "lucide-react";
import { formatWFHDate } from "./EmployeeWFHHistoryTable";

const statusConfig: any = {
  PENDING: { style: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  APPROVED: { style: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  REJECTED: { style: "bg-rose-50 text-rose-700 border-rose-200", icon: XCircle },
  CANCELLED: { style: "bg-slate-100 text-slate-600 border-slate-200", icon: Trash2 }
};

export default function EmployeeLeaveHistoryTable({
  loading,
  requests
}: {
  loading: boolean;
  requests: any[];
}) {
  if (loading) return (
    <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
      <p className="text-slate-500 font-medium">Loading your leave history...</p>
    </div>
  );

  if (!requests.length) return (
    <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
      <Calendar className="w-12 h-12 text-slate-200 mb-4" />
      <p className="text-slate-500 font-bold">No Records Found</p>
      <p className="text-slate-400 text-sm">You haven't submitted any leave requests yet.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
         <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Leave History
         </h3>
         <span className="text-[10px] font-black bg-white px-2 py-1 rounded-md border text-slate-400 uppercase tracking-widest">
           {requests.length} Requests
         </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-white">
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600 uppercase tracking-wider">Leave Period</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-slate-600 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600 uppercase tracking-wider">Reason & Remarks</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-slate-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-sm font-bold text-slate-600 uppercase tracking-wider">Applied Date</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {requests.map(req => {
              const config = statusConfig[req.status] || statusConfig.PENDING;
              return (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{formatWFHDate(req.start_date)} to {formatWFHDate(req.end_date)}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                      {req.total_days} {req.total_days === 1 ? 'Day' : 'Days'}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 line-clamp-1 max-w-[200px]" title={req.reason}>
                      {req.reason}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${config.style}`}>
                        <config.icon className="w-3 h-3" />
                        {req.status}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-medium text-slate-600 font-mono">
                      {formatWFHDate(req.applied_on)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}