"use client";

import { fieldCls, labelCls, inputCls, selectCls, addBtnCls } from "@/lib/types/ReferalTypes/FieldStyles";
import { Skill, SkillLevel } from "@/lib/types/ReferalTypes/referalindex";
import { emptySkill } from "@/lib/types/ReferalTypes/referral";


interface Props { data: Skill[]; onChange: (d: Skill[]) => void; }

const LEVELS: { value: SkillLevel; label: string; cls: string; activeCls: string }[] = [
    { value: "beginner", label: "Beginner", cls: "border-gray-200 text-gray-500 hover:border-gray-300", activeCls: "bg-gray-100 border-gray-400 text-gray-700 font-semibold" },
    { value: "intermediate", label: "Mid", cls: "border-blue-100 text-blue-400 hover:border-blue-300", activeCls: "bg-blue-50 border-blue-400 text-blue-600 font-semibold" },
    { value: "advanced", label: "Advanced", cls: "border-indigo-100 text-indigo-400 hover:border-indigo-300", activeCls: "bg-indigo-50 border-indigo-400 text-indigo-600 font-semibold" },
    { value: "expert", label: "Expert", cls: "border-amber-100 text-amber-500 hover:border-amber-300", activeCls: "bg-amber-50 border-amber-400 text-amber-600 font-semibold" },
];

const CATEGORIES = ["Frontend", "Backend", "DevOps", "Mobile", "Data", "Design", "Soft Skills", "Other"];

export default function SkillsSection({ data, onChange }: Props) {
    const update = (i: number, u: Partial<Skill>) => {
        const next = [...data]; next[i] = { ...next[i], ...u }; onChange(next);
    };

    return (
        <div className="flex flex-col gap-4">
            {data.length === 0 && (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-400 bg-white">
                    No skills added yet.
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.map((skill, i) => (
                    <div key={skill.id} className="relative bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 hover:border-gray-300 hover:shadow-sm transition-all shadow-sm">
                        <button
                            type="button"
                            className="absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all"
                            onClick={() => onChange(data.filter((_, idx) => idx !== i))}
                        >
                            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                        <div className={fieldCls}>
                            <label className={labelCls + " text-[10px]"}>Skill</label>
                            <input className={inputCls + " text-xs py-1.5"} placeholder="e.g. React" value={skill.name} onChange={(e) => update(i, { name: e.target.value })} />
                        </div>
                        <div className={fieldCls}>
                            <label className={labelCls + " text-[10px]"}>Category</label>
                            <select className={selectCls + " text-xs py-1.5"} value={skill.category ?? ""} onChange={(e) => update(i, { category: e.target.value || null })}>
                                <option value="">Uncategorized</option>
                                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className={fieldCls}>
                            <label className={labelCls + " text-[10px]"}>Level</label>
                            <div className="flex flex-wrap gap-1.5">
                                {LEVELS.map((l) => (
                                    <button key={l.value} type="button"
                                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${skill.level === l.value ? l.activeCls : l.cls}`}
                                        onClick={() => update(i, { level: skill.level === l.value ? null : l.value })}>
                                        {l.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button type="button" className={addBtnCls} onClick={() => onChange([...data, emptySkill()])}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Add Skill
            </button>
        </div>
    );
}