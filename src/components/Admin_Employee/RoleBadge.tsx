import { Crown, UserCheck } from "lucide-react"

const RoleBadge = ({ role }: { role: string }) => {
    const map: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
        admin: { bg: "bg-violet-100 border border-violet-200", text: "text-violet-700", icon: <Crown className="w-3 h-3" /> },
        employee: { bg: "bg-sky-100 border border-sky-200", text: "text-sky-700", icon: <UserCheck className="w-3 h-3" /> },
    }
    const s = map[role] || { bg: "bg-slate-100 border border-slate-200", text: "text-slate-600", icon: null }
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${s.bg} ${s.text}`}>
            {s.icon}{role}
        </span>
    )
}

export default RoleBadge