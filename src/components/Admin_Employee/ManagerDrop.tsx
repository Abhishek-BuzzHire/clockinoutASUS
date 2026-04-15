import { Building2, ChevronDown } from "lucide-react"

const ManagerDrop = ({ value, onChange, managers, defaultLabel }: {
    value: string; onChange: (v: string) => void; managers: any[]; defaultLabel?: string
}) => (
    <div>
        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Manager</label>
        <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <select
                value={value} onChange={e => onChange(e.target.value)}
                className="w-full pl-10 pr-8 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all appearance-none shadow-sm"
            >
                <option value="">{defaultLabel || "— Select a manager —"}</option>
                {managers.map(m => (
                    <option key={m.id} value={m.id}>{m.name || m.username}{m.role === "admin" ? " (Admin)" : ""}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
        </div>
    </div>
)

export default ManagerDrop