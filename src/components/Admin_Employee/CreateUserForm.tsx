import { ShieldCheck, UserPlus, Loader2, CheckCircle2, AlertCircle, X, User, Lock } from "lucide-react"
import LabelInput from "./LabelInput";
import RolePicker from "./RolePicker";
import ManagerDrop from "./ManagerDrop";


interface CreateUserFormProps {
    formData: { username: string; password: string; role: string; manager_id: string }
    setFormData: React.Dispatch<React.SetStateAction<{ username: string; password: string; role: string; manager_id: string }>>
    managers: any[]
    loading: boolean
    message: { type: 'success' | 'error'; text: string } | null
    setMessage: (m: { type: 'success' | 'error'; text: string } | null) => void
    onSubmit: (e: React.FormEvent) => void
}

const CreateUserForm = ({ formData, setFormData, managers, loading, message, setMessage, onSubmit }: CreateUserFormProps) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
        <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-6 pt-6 pb-8 overflow-hidden">
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/5 rounded-full" />
            <div className="absolute bottom-0 left-4 w-16 h-16 bg-white/5 rounded-full translate-y-1/2" />
            <div className="relative flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-extrabold text-indigo-200 uppercase tracking-widest">Admin Controls</span>
            </div>
            <h2 className="relative text-xl font-extrabold text-white leading-tight">Onboard New User</h2>
            <p className="relative text-indigo-300 text-xs mt-1.5 leading-relaxed">Create credentials and define reporting lines.</p>
        </div>

        <div className="px-6 py-6 space-y-4">
            {message && (
                <div className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs font-bold ${message.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}>
                    {message.type === 'success'
                        ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                    <span className="flex-1 leading-relaxed">{message.text}</span>
                    <button onClick={() => setMessage(null)} className="shrink-0 hover:opacity-70 transition-opacity">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
            <form onSubmit={onSubmit} className="space-y-4">
                <LabelInput label="Username" icon={<User className="w-4 h-4" />} value={formData.username} onChange={v => setFormData(p => ({ ...p, username: v }))} placeholder="e.g. john.doe" required />
                <LabelInput label="Password" icon={<Lock className="w-4 h-4" />} type="password" value={formData.password} onChange={v => setFormData(p => ({ ...p, password: v }))} placeholder="Min 4 characters" required />
                <RolePicker value={formData.role} onChange={v => setFormData(p => ({ ...p, role: v, manager_id: "" }))} />
                {formData.role !== 'admin' && (
                    <ManagerDrop value={formData.manager_id} onChange={v => setFormData(p => ({ ...p, manager_id: v }))} managers={managers} />
                )}
                <button
                    type="submit" disabled={loading}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-300 text-white font-extrabold rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-indigo-200 text-sm mt-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    Create User
                </button>
            </form>
        </div>
    </div>
)

export default CreateUserForm