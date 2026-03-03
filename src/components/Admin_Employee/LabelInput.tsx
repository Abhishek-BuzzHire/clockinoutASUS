interface LabelInputProps {
    label: string
    icon: React.ReactNode
    type?: string
    value: string
    onChange: (v: string) => void
    placeholder?: string
    required?: boolean
}

const LabelInput = ({ label, icon, type = "text", value, onChange, placeholder, required }: LabelInputProps) => (
    <div>
        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
        <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300">{icon}</span>
            <input
                type={type} required={required} value={value} placeholder={placeholder}
                onChange={e => onChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all shadow-sm"
            />
        </div>
    </div>
)

export default LabelInput