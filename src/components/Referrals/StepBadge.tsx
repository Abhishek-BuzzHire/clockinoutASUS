type StepState = "active" | "done" | "pending";

export function StepBadge({ index, label, state }: { index: number; label: string; state: StepState }) {
    const colors: Record<StepState, { wrap: string; badge: string }> = {
        active: { wrap: "text-indigo-600", badge: "bg-indigo-50  border-indigo-500  text-indigo-600" },
        done: { wrap: "text-emerald-600", badge: "bg-emerald-50 border-emerald-500 text-emerald-600" },
        pending: { wrap: "text-gray-400", badge: "bg-gray-50    border-gray-300    text-gray-400" },
    };
    const c = colors[state];
    return (
        <div className={`flex items-center gap-2 text-xs font-medium transition-colors ${c.wrap}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold border-2 ${c.badge}`}>
                {state === "done" ? (
                    <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                ) : index}
            </span>
            <span className="hidden sm:block">{label}</span>
        </div>
    );
}