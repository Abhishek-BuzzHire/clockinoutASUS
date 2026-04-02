"use client";

import { useEffect, useRef, useState } from "react";
import SectionNav, { FORM_SECTIONS } from "./SectionNav";
import BasicInfoSection from "./BasicInfoSection";
import ExperienceSection from "./ExperienceSection";
import EducationSection from "./EducationSection";
import SkillsSection from "./SkillsSection";
import { CertificationsSection, LanguagesSection } from "@/components/Referrals/CertificationLanguageSection";
import ReferralMetaSection from "./ReferralMetaSection";
import { ReferralFormData, FormSectionId } from "@/lib/types/ReferalTypes/referalindex";
import { defaultFormData } from "@/lib/types/ReferalTypes/referral";

interface Props { initialData?: Partial<ReferralFormData>; }

export default function ReferralForm({ initialData }: Props) {
    const [form, setForm] = useState<ReferralFormData>(() => ({
        ...defaultFormData(),
        ...initialData,
        basicInfo: { ...defaultFormData().basicInfo, ...(initialData?.basicInfo ?? {}) },
    }));

    const [active, setActive] = useState<FormSectionId>("basic");
    const [done, setDone] = useState<Set<FormSectionId>>(new Set());
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setError] = useState<string | null>(null);

    const refs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        if (!initialData) return;
        setForm((p) => ({
            ...p, ...initialData,
            basicInfo: { ...p.basicInfo, ...(initialData.basicInfo ?? {}) },
        }));
    }, [initialData]);

    const mark = (id: FormSectionId) => setDone((p) => new Set([...p, id]));
    const scrollTo = (id: FormSectionId) => {
        setActive(id);
        refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch("/api/referrals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
            const json = await res.json();
            if (json.success) setSubmitted(true);
            else setError(json.error ?? "Submission failed.");
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-5 p-10 bg-sky-50 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center text-emerald-500">
                    <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Referral Submitted!</h2>
                    <p className="text-sm text-gray-500 mt-2 max-w-xs leading-relaxed">
                        Candidate added to the pipeline at the <strong className="text-emerald-600">Applied</strong> stage.
                    </p>
                </div>
                <button
                    className="mt-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-sm"
                    onClick={() => { setSubmitted(false); setForm(defaultFormData()); setDone(new Set()); }}
                >
                    Submit Another
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-1 overflow-hidden h-full">
            {/* Sidebar */}
            <aside className="w-52 shrink-0 bg-white border-r border-gray-200 overflow-y-auto shadow-sm">
                <SectionNav active={active} completedSections={done} onSelect={scrollTo} />
            </aside>

            {/* Scrollable form body */}
            <div className="flex-1 overflow-y-auto bg-sky-50 scroll-smooth">
                {FORM_SECTIONS.map((section) => (
                    <div
                        key={section.id}
                        ref={(el) => { refs.current[section.id] = el; }}
                        className="min-h-[50vh] border-b border-gray-200 px-10 py-9 scroll-mt-5"
                        onFocus={() => setActive(section.id)}
                    >
                        {/* Section header */}
                        <div className="flex items-center gap-3 mb-7">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl shadow-sm shrink-0">
                                {section.icon}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-base font-bold text-gray-900 tracking-tight">{section.label}</h2>
                                <p className="text-xs text-gray-400 mt-0.5">{section.description}</p>
                            </div>
                            {done.has(section.id) && (
                                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                    <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Done
                                </span>
                            )}
                        </div>

                        {section.id === "basic" && <BasicInfoSection data={form.basicInfo} onChange={(d) => { setForm((p) => ({ ...p, basicInfo: d })); mark("basic"); }} />}
                        {section.id === "experience" && <ExperienceSection data={form.experience} onChange={(d) => { setForm((p) => ({ ...p, experience: d })); mark("experience"); }} />}
                        {section.id === "education" && <EducationSection data={form.education} onChange={(d) => { setForm((p) => ({ ...p, education: d })); mark("education"); }} />}
                        {section.id === "skills" && <SkillsSection data={form.skills} onChange={(d) => { setForm((p) => ({ ...p, skills: d })); mark("skills"); }} />}
                        {section.id === "certifications" && <CertificationsSection data={form.certifications} onChange={(d) => { setForm((p) => ({ ...p, certifications: d })); mark("certifications"); }} />}
                        {section.id === "languages" && <LanguagesSection data={form.languages} onChange={(d) => { setForm((p) => ({ ...p, languages: d })); mark("languages"); }} />}
                        {section.id === "referral-meta" && (
                            <ReferralMetaSection
                                jobId={form.jobId} referredBy={form.referredBy} referralNote={form.referralNote}
                                onChange={(k, v) => { setForm((p) => ({ ...p, [k]: v || null })); mark("referral-meta"); }}
                            />
                        )}
                    </div>
                ))}

                {/* Submit bar */}
                <div className="px-10 py-8 flex flex-col items-end gap-3">
                    {submitError && (
                        <p className="w-full text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            {submitError}
                        </p>
                    )}
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-md shadow-indigo-200"
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Submitting…
                            </>
                        ) : (
                            <>
                                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                                Submit Referral
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}