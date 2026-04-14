"use client";

import { cardCls, removeBtnCls, fieldCls, labelCls, inputCls, addBtnCls } from "@/lib/types/ReferalTypes/FieldStyles";
import { Certification, LanguageProficiency, Language } from "@/lib/types/ReferalTypes/referalindex";
import { emptyCertification, emptyLanguage } from "@/lib/types/ReferalTypes/referral";

// ─── Certifications ──────────────────────────────────────────────────────────

interface CertsProps { data: Certification[]; onChange: (d: Certification[]) => void; }

export function CertificationsSection({ data, onChange }: CertsProps) {
    const update = (i: number, u: Partial<Certification>) => {
        const next = [...data];
        next[i] = { ...next[i], ...u };
        onChange(next);
    };

    return (
        <div className="flex flex-col gap-4">
            {data.length === 0 && (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-400 bg-white">
                    No certifications added yet.
                </div>
            )}

            {data.map((cert, i) => (
                <div key={cert.id} className={cardCls}>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                            Certification {i + 1}
                        </span>
                        <button
                            type="button"
                            className={removeBtnCls}
                            onClick={() => onChange(data.filter((_, idx) => idx !== i))}
                        >
                            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M9 6V4h6v2" />
                            </svg>
                            Remove
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className={fieldCls}>
                            <label className={labelCls}>Certificate Name</label>
                            <input
                                className={inputCls}
                                placeholder="AWS Solutions Architect"
                                value={cert.name ?? ""}
                                onChange={(e) => update(i, { name: e.target.value || null })}
                            />
                        </div>
                        <div className={fieldCls}>
                            <label className={labelCls}>Issuing Organization</label>
                            <input
                                className={inputCls}
                                placeholder="Amazon Web Services"
                                value={cert.issuer ?? ""}
                                onChange={(e) => update(i, { issuer: e.target.value || null })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className={fieldCls}>
                            <label className={labelCls}>Issue Date</label>
                            <input
                                className={inputCls}
                                type="month"
                                value={cert.issueDate ?? ""}
                                onChange={(e) => update(i, { issueDate: e.target.value || null })}
                            />
                        </div>
                        <div className={fieldCls}>
                            <label className={labelCls}>Expiry Date</label>
                            <input
                                className={inputCls}
                                type="month"
                                value={cert.expiryDate ?? ""}
                                onChange={(e) => update(i, { expiryDate: e.target.value || null })}
                            />
                        </div>
                    </div>

                    <div className={fieldCls}>
                        <label className={labelCls}>Credential URL</label>
                        <input
                            className={inputCls}
                            type="url"
                            placeholder="https://credly.com/badges/…"
                            value={cert.credentialUrl ?? ""}
                            onChange={(e) => update(i, { credentialUrl: e.target.value || null })}
                        />
                    </div>
                </div>
            ))}

            <button type="button" className={addBtnCls} onClick={() => onChange([...data, emptyCertification()])}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Certification
            </button>
        </div>
    );
}

// ─── Languages ────────────────────────────────────────────────────────────────

const PROFICIENCY: { value: LanguageProficiency; label: string }[] = [
    { value: "basic", label: "Basic" },
    { value: "conversational", label: "Conversational" },
    { value: "fluent", label: "Fluent" },
    { value: "native", label: "Native" },
];

interface LangProps { data: Language[]; onChange: (d: Language[]) => void; }

export function LanguagesSection({ data, onChange }: LangProps) {
    const update = (i: number, u: Partial<Language>) => {
        const next = [...data];
        next[i] = { ...next[i], ...u };
        onChange(next);
    };

    return (
        <div className="flex flex-col gap-4">
            {data.length === 0 && (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-400 bg-white">
                    No languages added yet.
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.map((lang, i) => (
                    <div
                        key={lang.id}
                        className="relative bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 hover:border-gray-300 hover:shadow-sm transition-all shadow-sm"
                    >
                        {/* Remove X */}
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
                            <label className={labelCls + " text-[10px]"}>Language</label>
                            <input
                                className={inputCls + " text-xs py-1.5"}
                                placeholder="English, Hindi…"
                                value={lang.name ?? ""}
                                onChange={(e) => update(i, { name: e.target.value || null })}
                            />
                        </div>

                        <div className={fieldCls}>
                            <label className={labelCls + " text-[10px]"}>Proficiency</label>
                            <div className="flex flex-wrap gap-1.5">
                                {PROFICIENCY.map((p) => (
                                    <button
                                        key={p.value}
                                        type="button"
                                        onClick={() =>
                                            update(i, { proficiency: lang.proficiency === p.value ? null : p.value })
                                        }
                                        className={[
                                            "text-[10px] px-2 py-0.5 rounded-full border transition-all",
                                            lang.proficiency === p.value
                                                ? "bg-indigo-50 border-indigo-400 text-indigo-600 font-semibold"
                                                : "border-gray-200 text-gray-500 hover:border-indigo-200 hover:text-indigo-500",
                                        ].join(" ")}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button type="button" className={addBtnCls} onClick={() => onChange([...data, emptyLanguage()])}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Language
            </button>
        </div>
    );
}