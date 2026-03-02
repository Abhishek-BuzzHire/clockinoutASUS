import { Crown, UserCheck } from "lucide-react"

const RolePicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div>
        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Role</label>
        <div className="grid grid-cols-2 gap-2">
            {[
                { key: "admin", label: "Admin", icon: <Crown className="w-4 h-4" /> },
                { key: "employee", label: "Employee", icon: <UserCheck className="w-4 h-4" /> },
            ].map(({ key, label, icon }) => (
                <button
                    key={key} type="button" onClick={() => onChange(key)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all border-2 ${value === key
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200"
                        : "bg-slate-50 border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500"
                        }`}
                >
                    {icon}{label}
                </button>
            ))}
        </div>
    </div>
)

export default RolePicker