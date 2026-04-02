"use client";

import { FormSection, FormSectionId } from "@/lib/types/ReferalTypes/referalindex";


export const FORM_SECTIONS: FormSection[] = [
    { id: "basic", label: "Basic Info", icon: "👤", description: "Personal & contact" },
    { id: "experience", label: "Experience", icon: "💼", description: "Work history" },
    { id: "education", label: "Education", icon: "🎓", description: "Degrees & schools" },
    { id: "skills", label: "Skills", icon: "⚡", description: "Tech & soft skills" },
    { id: "certifications", label: "Certifications", icon: "📜", description: "Licenses & certs" },
    { id: "languages", label: "Languages", icon: "🌐", description: "Proficiencies" },
    { id: "referral-meta", label: "Referral Details", icon: "🔗", description: "Job & referrer" },
];

interface SectionNavProps {
    active: FormSectionId;
    completedSections: Set<FormSectionId>;
    onSelect: (id: FormSectionId) => void;
}

export default function SectionNav({ active, completedSections, onSelect }: SectionNavProps) {
    return (
        <nav className="flex flex-col gap-0.5 p-3 pt-4">
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 px-2 mb-2">
                Sections
            </p>
            {FORM_SECTIONS.map((s) => {
                const isActive = active === s.id;
                const isDone = completedSections.has(s.id);

                return (
                    <button
                        key={s.id}
                        type="button"
                        onClick={() => onSelect(s.id)}
                        className={[
                            "flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-left transition-all",
                            isActive
                                ? "bg-indigo-50 border border-indigo-200 shadow-sm"
                                : "border border-transparent hover:bg-gray-50 hover:border-gray-200",
                        ].join(" ")}
                    >
                        <span className="text-base leading-none">{s.icon}</span>
                        <span className="flex flex-col flex-1 min-w-0">
                            <span className={[
                                "text-xs font-semibold leading-tight truncate",
                                isActive ? "text-indigo-700" : isDone ? "text-emerald-600" : "text-gray-700",
                            ].join(" ")}>
                                {s.label}
                            </span>
                            <span className="text-[10px] text-gray-400 truncate mt-0.5">{s.description}</span>
                        </span>
                        {isDone && !isActive && (
                            <svg className="text-emerald-500 shrink-0" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        )}
                        {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        )}
                    </button>
                );
            })}
        </nav>
    );
}