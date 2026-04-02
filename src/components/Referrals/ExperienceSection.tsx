"use client";

import { cardCls, removeBtnCls, fieldCls, labelCls, inputCls, selectCls, textareaCls, addBtnCls } from "@/lib/types/ReferalTypes/FieldStyles";
import { WorkExperience, EmploymentType } from "@/lib/types/ReferalTypes/referalindex";
import { emptyExperience } from "@/lib/types/ReferalTypes/referral";


interface Props { data: WorkExperience[]; onChange: (d: WorkExperience[]) => void; }

const EMP_TYPES: { value: EmploymentType; label: string }[] = [
    { value: "full-time", label: "Full-time" }, { value: "part-time", label: "Part-time" },
    { value: "contract", label: "Contract" }, { value: "internship", label: "Internship" },
    { value: "freelance", label: "Freelance" },
];

export default function ExperienceSection({ data, onChange }: Props) {
    const update = (i: number, u: Partial<WorkExperience>) => {
        const next = [...data]; next[i] = { ...next[i], ...u }; onChange(next);
    };

    return (
        <div className="flex flex-col gap-4">
            {data.length === 0 && (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-400 bg-white">
                    No work experience added yet.
                </div>
            )}
            {data.map((exp, i) => (
                <div key={exp.id} className={cardCls}>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                            Experience {i + 1}
                        </span>
                        <button type="button" className={removeBtnCls} onClick={() => onChange(data.filter((_, idx) => idx !== i))}>
                            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M9 6V4h6v2" />
                            </svg>
                            Remove
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className={fieldCls}><label className={labelCls}>Job Title</label><input className={inputCls} placeholder="Senior Engineer" value={exp.jobTitle ?? ""} onChange={(e) => update(i, { jobTitle: e.target.value || null })} /></div>
                        <div className={fieldCls}><label className={labelCls}>Company</label><input className={inputCls} placeholder="Acme Corp" value={exp.company ?? ""} onChange={(e) => update(i, { company: e.target.value || null })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className={fieldCls}><label className={labelCls}>Location</label><input className={inputCls} placeholder="Remote / City" value={exp.location ?? ""} onChange={(e) => update(i, { location: e.target.value || null })} /></div>
                        <div className={fieldCls}>
                            <label className={labelCls}>Employment Type</label>
                            <select className={selectCls} value={exp.employmentType ?? ""} onChange={(e) => update(i, { employmentType: (e.target.value as EmploymentType) || null })}>
                                <option value="">Select type</option>
                                {EMP_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className={fieldCls}><label className={labelCls}>Start Date</label><input className={inputCls} type="month" value={exp.startDate ?? ""} onChange={(e) => update(i, { startDate: e.target.value || null })} /></div>
                        <div className={fieldCls}>
                            <label className={labelCls}>End Date</label>
                            <input className={inputCls} type="month" disabled={exp.isCurrent} value={exp.endDate ?? ""} onChange={(e) => update(i, { endDate: e.target.value || null })} />
                            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer mt-1 select-none">
                                <input type="checkbox" className="accent-indigo-500 w-3.5 h-3.5" checked={exp.isCurrent} onChange={(e) => update(i, { isCurrent: e.target.checked, endDate: e.target.checked ? null : exp.endDate })} />
                                Currently working here
                            </label>
                        </div>
                    </div>
                    <div className={fieldCls}><label className={labelCls}>Description</label><textarea className={textareaCls} rows={3} placeholder="Key responsibilities and achievements…" value={exp.description ?? ""} onChange={(e) => update(i, { description: e.target.value || null })} /></div>
                </div>
            ))}
            <button type="button" className={addBtnCls} onClick={() => onChange([...data, emptyExperience()])}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Add Experience
            </button>
        </div>
    );
}