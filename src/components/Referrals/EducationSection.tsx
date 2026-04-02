"use client";

import { cardCls, removeBtnCls, fieldCls, labelCls, inputCls, addBtnCls } from "@/lib/types/ReferalTypes/FieldStyles";
import { Education } from "@/lib/types/ReferalTypes/referalindex";
import { emptyEducation } from "@/lib/types/ReferalTypes/referral";


interface Props { data: Education[]; onChange: (d: Education[]) => void; }

export default function EducationSection({ data, onChange }: Props) {
    const update = (i: number, u: Partial<Education>) => {
        const next = [...data]; next[i] = { ...next[i], ...u }; onChange(next);
    };

    return (
        <div className="flex flex-col gap-4">
            {data.length === 0 && (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-400 bg-white">
                    No education added yet.
                </div>
            )}
            {data.map((edu, i) => (
                <div key={edu.id} className={cardCls}>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                            Education {i + 1}
                        </span>
                        <button type="button" className={removeBtnCls} onClick={() => onChange(data.filter((_, idx) => idx !== i))}>
                            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M9 6V4h6v2" />
                            </svg>
                            Remove
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className={fieldCls}><label className={labelCls}>Degree</label><input className={inputCls} placeholder="B.Tech / M.Sc / MBA" value={edu.degree ?? ""} onChange={(e) => update(i, { degree: e.target.value || null })} /></div>
                        <div className={fieldCls}><label className={labelCls}>Field of Study</label><input className={inputCls} placeholder="Computer Science" value={edu.fieldOfStudy ?? ""} onChange={(e) => update(i, { fieldOfStudy: e.target.value || null })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className={fieldCls}><label className={labelCls}>Institution</label><input className={inputCls} placeholder="University name" value={edu.institution ?? ""} onChange={(e) => update(i, { institution: e.target.value || null })} /></div>
                        <div className={fieldCls}><label className={labelCls}>Location</label><input className={inputCls} placeholder="City, Country" value={edu.location ?? ""} onChange={(e) => update(i, { location: e.target.value || null })} /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className={fieldCls}><label className={labelCls}>Start Year</label><input className={inputCls} type="number" min={1950} max={2100} placeholder="2018" value={edu.startYear ?? ""} onChange={(e) => update(i, { startYear: e.target.value || null })} /></div>
                        <div className={fieldCls}><label className={labelCls}>End Year</label><input className={inputCls} type="number" min={1950} max={2100} placeholder="2022" value={edu.endYear ?? ""} onChange={(e) => update(i, { endYear: e.target.value || null })} /></div>
                        <div className={fieldCls}><label className={labelCls}>Grade / GPA</label><input className={inputCls} placeholder="8.5 / First Class" value={edu.grade ?? ""} onChange={(e) => update(i, { grade: e.target.value || null })} /></div>
                    </div>
                    <div className={fieldCls}><label className={labelCls}>Activities & Societies</label><input className={inputCls} placeholder="Coding Club, Debate Team…" value={edu.activities ?? ""} onChange={(e) => update(i, { activities: e.target.value || null })} /></div>
                </div>
            ))}
            <button type="button" className={addBtnCls} onClick={() => onChange([...data, emptyEducation()])}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Add Education
            </button>
        </div>
    );
}