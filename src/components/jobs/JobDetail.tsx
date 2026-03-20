"use client";

import { Job } from "@/lib/types/jobs";

interface JobDetailProps {
    job: Job | null;
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-3">{title}</p>
        {children}
    </div>
);

const Pill = ({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "green" | "gray" | "blue" }) => {
    const styles = {
        default: "bg-slate-100 text-slate-600",
        green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        gray: "bg-slate-100 text-slate-500 border border-slate-200",
        blue: "bg-sky-50 text-sky-700 border border-sky-200",
    };
    return (
        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${styles[variant]}`}>
            {children}
        </span>
    );
};

const MetaRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
        <span className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
            {icon}
        </span>
        <span className="text-xs text-slate-400 w-24 flex-shrink-0">{label}</span>
        <span className="text-sm font-semibold text-slate-700">{value}</span>
    </div>
);

const JobDetail = ({ job }: JobDetailProps) => {
    if (!job) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex items-center gap-3 text-slate-400">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v4m0 8v4m8-8h-4M8 12H4" />
                </svg>
                <span className="text-sm">Loading job details…</span>
            </div>
        );
    }

    const isPublished = job.job_status?.toLowerCase() !== "draft";

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {/* ── Top accent bar ── */}
            <div className={`h-1 w-full ${isPublished ? "bg-gradient-to-r from-emerald-400 to-teal-400" : "bg-slate-200"}`} />

            {/* ── Header ── */}
            <div className="px-6 pt-5 pb-4 border-b border-slate-100">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 mb-0.5">{job.client_name}</p>
                        <h2 className="text-xl font-bold text-slate-800 leading-snug">{job.job_title}</h2>
                    </div>
                    <Pill variant={isPublished ? "green" : "gray"}>
                        {isPublished ? (
                            <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />{job.job_status}</>
                        ) : (
                            <><span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />{job.job_status}</>
                        )}
                    </Pill>
                </div>

                {/* quick meta chips */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {job.job_location && (
                        <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.job_location}
                        </span>
                    )}
                    {job.job_type && (
                        <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2" />
                            </svg>
                            {job.job_type}
                        </span>
                    )}
                    {(job.job_min_exp || job.job_max_exp) && (
                        <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {job.job_min_exp ?? "0"} – {job.job_max_exp ?? "?"} yrs
                        </span>
                    )}
                </div>
            </div>

            <div className="px-6 py-5 space-y-5">

                {/* ── Candidates ── */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total</p>
                        <p className="text-2xl font-bold text-slate-800">{job.total_candidates ?? 0}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1">New</p>
                        <p className="text-2xl font-bold text-emerald-700">{job.new_candidates ?? 0}</p>
                    </div>
                </div>

                {/* ── Overview ── */}
                {job.job_overview && (
                    <Section title="Overview">
                        <p className="text-sm text-slate-600 leading-relaxed">{job.job_overview}</p>
                    </Section>
                )}

                {/* ── Responsibilities ── */}
                {job.job_responsibilities && job.job_responsibilities.length > 0 && (
                    <Section title="Responsibilities">
                        <ul className="space-y-1.5">
                            {job.job_responsibilities.map((r, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                                    {r}
                                </li>
                            ))}
                        </ul>
                    </Section>
                )}

                {/* ── Qualifications ── */}
                {job.job_qualification && job.job_qualification.length > 0 && (
                    <Section title="Qualifications">
                        <ul className="space-y-1.5">
                            {job.job_qualification.map((q, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                                    {q}
                                </li>
                            ))}
                        </ul>
                    </Section>
                )}

                {/* ── Skills ── */}
                {job.skill_ids && job.skill_ids.length > 0 && (
                    <Section title="Required Skills">
                        <div className="flex flex-wrap gap-1.5">
                            {job.skill_ids.map((id) => (
                                <Pill key={id} variant="blue">{id}</Pill>
                            ))}
                        </div>
                    </Section>
                )}

                {/* ── Contacts ── */}
                {job.contacts && job.contacts.length > 0 && (
                    <Section title="Contacts">
                        <div className="space-y-3">
                            {job.contacts.map((c, i) => (
                                <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-semibold text-slate-700">{c.contact_name}</p>
                                        {c.contact_role && (
                                            <Pill variant="gray">{c.contact_role}</Pill>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500">{c.contact_email}</p>
                                    <p className="text-xs text-slate-500">{c.contact_phone}</p>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {/* ── HRs ── */}
                {job.hrs && job.hrs.length > 0 && (
                    <Section title="Assigned HRs">
                        <div className="space-y-3">
                            {job.hrs.map((hr, i) => (
                                <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-sky-400
                                  flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                        {hr.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-700 truncate">{hr.name}</p>
                                        <p className="text-xs text-slate-400 truncate">{hr.designation} · {hr.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

            </div>
        </div>
    );
};

export default JobDetail;