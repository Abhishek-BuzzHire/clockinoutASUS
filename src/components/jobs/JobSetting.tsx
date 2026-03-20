"use client";

import { useState } from "react";
import { Job } from "@/lib/types/jobs";

interface JobSettingsProps {
    job: Job;
    onSave?: (updated: Partial<Job>) => void;
}

// ─── small primitives ─────────────────────────────────────────────────────────

const Label = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1.5">
        {children}
    </p>
);

const Input = ({
    value,
    onChange,
    placeholder,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) => (
    <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm text-slate-700 font-medium bg-slate-50 border border-slate-200
                   rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-indigo-400
                   focus:bg-white transition-colors placeholder:text-slate-300"
    />
);

const Textarea = ({
    value,
    onChange,
    placeholder,
    rows = 3,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    rows?: number;
}) => (
    <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full text-sm text-slate-700 font-medium bg-slate-50 border border-slate-200
                   rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-indigo-400
                   focus:bg-white transition-colors placeholder:text-slate-300 resize-none"
    />
);

// ── tag list editor (responsibilities / qualifications) ───────────────────────
const TagListEditor = ({
    items,
    onChange,
    placeholder,
}: {
    items: string[];
    onChange: (items: string[]) => void;
    placeholder?: string;
}) => {
    const [draft, setDraft] = useState("");

    const add = () => {
        const t = draft.trim();
        if (!t) return;
        onChange([...items, t]);
        setDraft("");
    };

    const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <input
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
                    placeholder={placeholder}
                    className="flex-1 text-sm text-slate-700 font-medium bg-slate-50 border border-dashed
                               border-slate-300 rounded-lg px-3.5 py-2 focus:outline-none
                               focus:border-indigo-400 focus:bg-white transition-colors placeholder:text-slate-300"
                />
                <button
                    type="button"
                    onClick={add}
                    className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600
                               rounded-lg text-xs font-bold transition-colors"
                >
                    + Add
                </button>
            </div>
            {items.length > 0 && (
                <ul className="space-y-1.5">
                    {items.map((item, i) => (
                        <li key={i}
                            className="flex items-start gap-2 bg-slate-50 border border-slate-100
                                       rounded-lg px-3 py-2 text-sm text-slate-600 group">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                            <span className="flex-1">{item}</span>
                            <button
                                type="button"
                                onClick={() => remove(i)}
                                className="text-slate-300 hover:text-red-400 transition-colors opacity-0
                                           group-hover:opacity-100 flex-shrink-0 mt-0.5"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// ─── Section wrapper ─────────────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
        </div>
        <div className="px-5 py-5 space-y-4">{children}</div>
    </div>
);

// ─── Delete confirmation modal ────────────────────────────────────────────────
const DeleteModal = ({
    jobTitle,
    onClose,
}: {
    jobTitle: string;
    onClose: () => void;
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-red-400 to-rose-500" />
            <div className="px-6 py-6">
                <div className="w-11 h-11 rounded-full bg-red-50 border border-red-100 flex items-center
                                justify-center mb-4">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Delete this job?</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                    <span className="font-semibold text-slate-700">"{jobTitle}"</span> will be
                    permanently removed along with all its candidates and pipeline data.
                    This action cannot be undone.
                </p>
            </div>
            <div className="px-6 pb-6 flex justify-end gap-3">
                <button
                    onClick={onClose}
                    className="text-sm font-semibold text-slate-500 hover:text-slate-800 px-4 py-2
                               rounded-xl border border-slate-200 hover:border-slate-400 transition-colors"
                >
                    Cancel
                </button>
                <button
                    className="text-sm font-semibold text-white bg-red-500 hover:bg-red-600
                               px-5 py-2 rounded-xl transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Job
                </button>
            </div>
        </div>
    </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const JobSettings = ({ job, onSave }: JobSettingsProps) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // ── form state — initialised from job prop ──
    const [title, setTitle] = useState(job.job_title ?? "");
    const [location, setLocation] = useState(job.job_location ?? "");
    const [type, setType] = useState(job.job_type ?? "");
    const [overview, setOverview] = useState(job.job_overview ?? "");
    const [minExp, setMinExp] = useState(job.job_min_exp ?? "");
    const [maxExp, setMaxExp] = useState(job.job_max_exp ?? "");
    const [responsibilities, setResponsibilities] = useState<string[]>(
        job.job_responsibilities ?? []
    );
    const [qualifications, setQualifications] = useState<string[]>(
        job.job_qualification ?? []
    );

    const isDirty =
        title !== (job.job_title ?? "") ||
        location !== (job.job_location ?? "") ||
        type !== (job.job_type ?? "") ||
        overview !== (job.job_overview ?? "") ||
        minExp !== (job.job_min_exp ?? "") ||
        maxExp !== (job.job_max_exp ?? "") ||
        JSON.stringify(responsibilities) !== JSON.stringify(job.job_responsibilities ?? []) ||
        JSON.stringify(qualifications) !== JSON.stringify(job.job_qualification ?? []);

    const handleSave = () => {
        onSave?.({
            job_title: title,
            job_location: location,
            job_type: type,
            job_overview: overview,
            job_min_exp: minExp,
            job_max_exp: maxExp,
            job_responsibilities: responsibilities,
            job_qualification: qualifications,
        });
    };

    const handleDiscard = () => {
        setTitle(job.job_title ?? "");
        setLocation(job.job_location ?? "");
        setType(job.job_type ?? "");
        setOverview(job.job_overview ?? "");
        setMinExp(job.job_min_exp ?? "");
        setMaxExp(job.job_max_exp ?? "");
        setResponsibilities(job.job_responsibilities ?? []);
        setQualifications(job.job_qualification ?? []);
    };

    return (
        <>
            <div className="mt-6 space-y-4 max-w-2xl">

                {/* ── Basic Info ── */}
                <Section title="Basic Information">
                    <div>
                        <Label>Job Title</Label>
                        <Input value={title} onChange={setTitle} placeholder="e.g. Senior Product Designer" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Location</Label>
                            <Input value={location} onChange={setLocation} placeholder="e.g. Remote, Mumbai" />
                        </div>
                        <div>
                            <Label>Job Type</Label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value)}
                                className="w-full text-sm text-slate-700 font-medium bg-slate-50 border border-slate-200
                                           rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-indigo-400
                                           focus:bg-white transition-colors"
                            >
                                <option value="">Select type</option>
                                {["Full time", "Part time", "Contract", "Internship", "Freelance"].map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Min Experience (yrs)</Label>
                            <Input value={minExp} onChange={setMinExp} placeholder="e.g. 2" />
                        </div>
                        <div>
                            <Label>Max Experience (yrs)</Label>
                            <Input value={maxExp} onChange={setMaxExp} placeholder="e.g. 5" />
                        </div>
                    </div>
                </Section>

                {/* ── Overview ── */}
                <Section title="Job Overview">
                    <div>
                        <Label>Description</Label>
                        <Textarea
                            value={overview}
                            onChange={setOverview}
                            placeholder="Brief description of the role and what the candidate will be doing…"
                            rows={4}
                        />
                    </div>
                </Section>

                {/* ── Responsibilities ── */}
                <Section title="Responsibilities">
                    <TagListEditor
                        items={responsibilities}
                        onChange={setResponsibilities}
                        placeholder="Add a responsibility and press Enter…"
                    />
                </Section>

                {/* ── Qualifications ── */}
                <Section title="Qualifications">
                    <TagListEditor
                        items={qualifications}
                        onChange={setQualifications}
                        placeholder="Add a qualification and press Enter…"
                    />
                </Section>

                {/* ── Save / Discard row ── */}
                <div className="flex items-center justify-between pt-1">
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 text-sm font-semibold text-red-500
                                   hover:text-red-700 border border-red-200 hover:border-red-400
                                   px-4 py-2 rounded-xl transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Job
                    </button>

                    <div className="flex items-center gap-3">
                        {isDirty && (
                            <button
                                onClick={handleDiscard}
                                className="text-sm font-semibold text-slate-500 hover:text-slate-800
                                           px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-400
                                           transition-colors"
                            >
                                Discard
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={!isDirty}
                            className="flex items-center gap-2 text-sm font-semibold text-white
                                       bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40
                                       disabled:cursor-not-allowed px-5 py-2 rounded-xl transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                        </button>
                    </div>
                </div>

            </div>

            {showDeleteModal && (
                <DeleteModal
                    jobTitle={job.job_title}
                    onClose={() => setShowDeleteModal(false)}
                />
            )}
        </>
    );
};

export default JobSettings;