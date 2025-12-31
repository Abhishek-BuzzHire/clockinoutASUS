import { Clock, CheckCircle2, XCircle, FileText, Calendar } from "lucide-react";

const statusConfig: any = {
    PENDING: { style: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
    APPROVED: { style: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    REJECTED: { style: "bg-rose-50 text-rose-700 border-rose-200", icon: XCircle }
};

export const formatWFHDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

export const formatFullDateTime = (dateString: string | null) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    // Returns format: "12 Oct 2023, Thu • 09:30 AM"
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(date).replace(/,([^,]*)$/, ' •$1'); // Replaces last comma with a bullet for CRM styling
};

export default function EmployeeWFHHistoryTable({
    loading,
    requests
}: {
    loading: boolean;
    requests: any[];
}) {
    if (loading)
        return (
            <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-medium italic">Loading WFH history...</p>
            </div>
        );

    if (!requests.length)
        return (
            <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                <FileText className="w-12 h-12 text-slate-200 mb-4" />
                <p className="text-slate-500 font-bold">No Records Found</p>
                <p className="text-slate-400 text-sm italic">You haven't submitted any WFH requests yet.</p>
            </div>
        );

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-widest">WFH Date</th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-slate-600 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-slate-600 uppercase tracking-widest">Applied At</th>
                            <th className="px-6 py-4 text-right text-sm font-bold text-slate-600 uppercase tracking-widest">Actioned At</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {requests.map(r => {
                            const config = statusConfig[r.status] || statusConfig.PENDING;
                            return (
                                <tr key={r.wfh_id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3 group">
                                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-700 tracking-tight">
                                                    {formatWFHDate(r.date)}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${config.style}`}>
                                                <config.icon className="w-3 h-3" />
                                                {r.status}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-semibold text-slate-700 font-mono italic">
                                                {formatFullDateTime(r.applied_at)}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-semibold text-slate-500 font-mono italic">
                                                {r.actioned_at ? formatFullDateTime(r.actioned_at) : "-"}
                                            </span>
                                        </div>
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