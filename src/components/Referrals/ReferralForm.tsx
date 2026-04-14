"use client";

import { useEffect, useRef, useState } from "react";
import SectionNav, { FORM_SECTIONS } from "./SectionNav";
import BasicInfoSection from "./BasicInfoSection";
import ExperienceSection from "./ExperienceSection";
import EducationSection from "./EducationSection";
import SkillsSection from "./SkillsSection";
import { CertificationsSection, LanguagesSection } from "@/components/Referrals/CertificationLanguageSection";
import ReferralMetaSection from "./ReferralMetaSection";
import {
    ReferralFormData,
    FormSectionId,
    WorkExperience,
    Education,
    Skill,
    Certification,
    Language,
} from "@/lib/types/ReferalTypes/referalindex";
import { defaultFormData } from "@/lib/types/ReferalTypes/referral";
import { backendApi } from "@/lib/backendApi";

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
            ...p,
            ...initialData,
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
            const payload = mapFormToApiPayload(form);
            console.log("[ReferralForm] FINAL PAYLOAD:", payload);

            const response = await backendApi.post("/api/referrals/", payload);

            if (response.status === 200 || response.status === 201) {
                setSubmitted(true);
            } else {
                setError(response.data?.message ?? "Submission failed.");
            }
        } catch (err: any) {
            console.error("[ReferralForm] submit error:", err.response?.data);
            setError(
                err.response?.data?.message ??
                err.response?.data?.error ??
                err.response?.data?.detail ??
                "Network error."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) return <div className="p-8 text-green-600 font-medium">Application submitted ✅</div>;

    return (
        <div className="flex flex-1 overflow-hidden h-full">
            <aside className="w-52 shrink-0 bg-white border-r">
                <SectionNav active={active} completedSections={done} onSelect={scrollTo} />
            </aside>

            <div className="flex-1 overflow-y-auto">
                {FORM_SECTIONS.map((section) => (
                    <div key={section.id} ref={(el) => { refs.current[section.id] = el; }}>
                        {section.id === "basic" && (
                            <BasicInfoSection
                                data={form.basicInfo}
                                onChange={(d) => { setForm((p) => ({ ...p, basicInfo: d })); mark("basic"); }}
                            />
                        )}
                        {section.id === "experience" && (
                            <ExperienceSection
                                data={form.experience}
                                onChange={(d) => { setForm((p) => ({ ...p, experience: d })); mark("experience"); }}
                            />
                        )}
                        {section.id === "education" && (
                            <EducationSection
                                data={form.education}
                                onChange={(d) => { setForm((p) => ({ ...p, education: d })); mark("education"); }}
                            />
                        )}
                        {section.id === "skills" && (
                            <SkillsSection
                                data={form.skills}
                                onChange={(d) => { setForm((p) => ({ ...p, skills: d })); mark("skills"); }}
                            />
                        )}
                        {section.id === "certifications" && (
                            <CertificationsSection
                                data={form.certifications}
                                onChange={(d) => { setForm((p) => ({ ...p, certifications: d })); mark("certifications"); }}
                            />
                        )}
                        {section.id === "languages" && (
                            <LanguagesSection
                                data={form.languages}
                                onChange={(d) => { setForm((p) => ({ ...p, languages: d })); mark("languages"); }}
                            />
                        )}
                        {section.id === "referral-meta" && (
                            <ReferralMetaSection
                                jobId={form.jobId}
                                referredBy={form.referredBy}
                                referralNote={form.referralNote}
                                onChange={(k, v) => { setForm((p) => ({ ...p, [k]: v || null })); mark("referral-meta"); }}
                            />
                        )}
                    </div>
                ))}

                <div className="p-6 border-t flex items-center gap-4">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                        {submitting ? "Submitting…" : "Submit Application"}
                    </button>
                    {submitError && (
                        <p className="text-sm text-red-500">{submitError}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── API Payload Mapper ───────────────────────────────────────────────────────

function mapFormToApiPayload(form: ReferralFormData) {
    const { basicInfo: b } = form;

    return {
        job_id: form.jobId,
        referred_by: form.referredBy,
        referral_note: form.referralNote,
        resume_file_url: form.resumeFileUrl,

        basic_info: {
            first_name: b.firstName,
            last_name: b.lastName,
            email: b.email,
            phone: b.phone,
            current_location: b.location,
            summary: b.summary,
            profile_experience: b.profile_experience,
            current_designation: b.current_designation,
            current_company: b.current_company,
            current_ctc: b.current_ctc,
            expected_ctc: b.expected_ctc,
            notice_period_days: b.notice_period_days,
        },

        experiences: form.experience.map((e: WorkExperience) => ({
            designation: e.jobTitle,
            company_name: e.company,
            location: e.location,
            employment_type: e.employmentType,
            start_date: e.startDate,
            end_date: e.endDate,
            is_current: e.isCurrent,
            description: e.description,
        })),

        educations: form.education.map((e: Education) => ({
            degree: e.degree,
            field_of_study: e.fieldOfStudy,
            institution_name: e.institution,
            location: e.location,
            start_year: e.startYear,
            end_year: e.endYear,
            grade: e.grade,
        })),

        skills: form.skills.map((s: Skill) => ({
            skill_id: s.skill_id,
            name: s.skill_name,
        })),

        certifications: form.certifications.map((c: Certification) => ({
            name: c.name,
            issuer: c.issuer,
            issue_date: c.issueDate,
            expiry_date: c.expiryDate,
            credential_url: c.credentialUrl,
        })),

        languages: form.languages.map((l: Language) => ({
            name: l.name,
            proficiency: l.proficiency,
        })),
    };
}