import { X, ToggleRight, ToggleLeft, Save, Loader2, User } from "lucide-react"
import LabelInput from "./LabelInput";
import RolePicker from "./RolePicker";
import ManagerDrop from "./ManagerDrop";
import RoleBadge from "./RoleBadge";


interface EditUserPanelProps {
    selectedUser: any
    editData: { username: string; role: string; manager_id: string; is_active: boolean; manager_name: string }
    setEditData: React.Dispatch<React.SetStateAction<{ username: string; role: string; manager_id: string; is_active: boolean; manager_name: string }>>
    managers: any[]
    isUpdating: boolean
    onClose: () => void
    onSubmit: (e: React.FormEvent) => void
}

const EditUserPanel = ({ selectedUser, editData, setEditData, managers, isUpdating, onClose, onSubmit }: EditUserPanelProps) => (
    <>
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity" onClick={onClose} />
        <div className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-white shadow-2xl shadow-black/20 z-50 flex flex-col">
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-5 flex items-center justify-between shrink-0 overflow-hidden">
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-base shadow-lg shrink-0">
                        {(selectedUser.name || selectedUser.username || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-extrabold text-white text-sm leading-tight">{selectedUser.name || selectedUser.username}</p>
                        <p className="text-slate-400 text-[11px] mt-0.5"><RoleBadge role={selectedUser.role} /></p>
                    </div>
                </div>
                <button onClick={onClose} className="relative z-10 w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="px-6 pt-5 pb-1">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Editing Account</p>
            </div>

            <form onSubmit={onSubmit} className="flex-1 overflow-y-auto px-6 pb-6 pt-3 space-y-5">
                <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Account Status</label>
                    <button
                        type="button"
                        onClick={() => setEditData(p => ({ ...p, is_active: !p.is_active }))}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all ${editData.is_active
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-red-50 border-red-200 text-red-600"
                            }`}
                    >
                        <div className="flex items-center gap-2.5 font-bold text-sm">
                            <span className={`w-2.5 h-2.5 rounded-full ${editData.is_active ? "bg-emerald-400" : "bg-red-400"}`} />
                            {editData.is_active ? "Account is Active" : "Account Suspended"}
                        </div>
                        {editData.is_active
                            ? <ToggleRight className="w-7 h-7 text-emerald-500" />
                            : <ToggleLeft className="w-7 h-7 text-red-400" />}
                    </button>
                </div>

                <LabelInput label="Username" icon={<User className="w-4 h-4" />} value={editData.username} onChange={v => setEditData(p => ({ ...p, username: v }))} placeholder="Username" required />
                <RolePicker value={editData.role} onChange={v => setEditData(p => ({ ...p, role: v, manager_id: "" }))} />
                <ManagerDrop value={editData.manager_id} onChange={v => setEditData(p => ({ ...p, manager_id: v }))} managers={managers} defaultLabel={editData.manager_name ? `Current: ${editData.manager_name}` : "— No manager assigned —"} />

                <div className="pt-2 border-t border-slate-100" />

                <button
                    type="submit" disabled={isUpdating}
                    className="w-full py-3.5 bg-slate-900 hover:bg-indigo-600 active:bg-indigo-700 disabled:bg-slate-300 text-white font-extrabold rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-lg text-sm"
                >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </form>
        </div>
    </>
)

export default EditUserPanel