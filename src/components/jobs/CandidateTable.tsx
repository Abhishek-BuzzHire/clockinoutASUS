"use client";

import { Candidate, Job } from "@/lib/types/jobs";
import { useRef, useState, useEffect } from "react";
import Candidature from "./Candidature";
import Table from "@/components/jobs/Table";
import { referralApi } from "@/apis/referrals/route";
import { jobsApi } from "@/apis/jobs/route";

const columns = [
    { header: "Candidate Name", accessor: "name", className: "p-6" },
    { header: "Candidate Contact", accessor: "id", className: "hidden md:table-cell" },
    { header: "Pipeline Stage", accessor: "pipelineStatus", className: "hidden md:table-cell" },
    { header: "Owner", accessor: "owner", className: "" },
    { header: "", accessor: "actions", className: "w-12" },
];

const colors = [
    "bg-orange-500",
    "bg-yellow-400",
    "bg-blue-500",
    "bg-red-500",
    "bg-teal-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-indigo-500",
];

// ---------- Add to Job Modal ----------

const AddToJobModal = ({
    candidate,
    onClose,
    onSuccess,
}: {
    candidate: Candidate;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const fetchJobs = async () => {
        try {
            const res: Job[] = await jobsApi.getJobs();
            setJobs(res);
        } catch (e) {
            console.error("Failed to fetch jobs", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);



    const handleSubmit = async () => {
        if (!selectedJobId) return;
        setSubmitting(true);
        setError(null);
        try {
            await referralApi.addToJob({ candidateId: candidate.id, jobId: selectedJobId });
            onSuccess();
            onClose();
        } catch (e: any) {
            const msg = e?.message || JSON.stringify(e) || "";
            if (msg.includes("1062") || msg.includes("Duplicate entry")) {
                setError("Candidate already applied to this job!");
            } else {
                setError("Something go wrong. Try again.");
            }
            console.error("Failed to add to job", e);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">
                            Add to job
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {candidate.name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-lg"
                    >
                        ✕
                    </button>
                </div>

                {/* Job list */}
                {loading ? (
                    <div className="py-8 text-center text-sm text-gray-400">
                        Loading jobs...
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-400">
                        No jobs found.
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto mb-5">
                        {jobs.map((job: Job) => (
                            <button
                                key={job.job_id}
                                onClick={() => setSelectedJobId(String(job.job_id))}
                                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition ${selectedJobId === String(job.job_id)
                                    ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                                    }`}
                            >
                                {/* ✅ FIXED: proper field */}
                                <div className="font-medium">
                                    {job.job_title ?? `Job #${job.job_id}`}
                                </div>

                                {/* ✅ Optional meta */}
                                {job.job_location && (
                                    <div className="text-xs text-gray-400 mt-0.5">
                                        {job.job_location}
                                    </div>
                                )}

                                {/* Optional extras (nice UI touch) */}
                                {(job.job_min_salary || job.job_max_salary) && (
                                    <div className="text-xs text-gray-400 mt-0.5">
                                        ₹{job.job_min_salary ?? "-"} - ₹{job.job_max_salary ?? "-"}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Error warning - show when duplicate happen */}
                {error && (
                    <div className="flex items-center gap-2 px-3 py-2.5 mb-4 rounded-lg bg-amber-50 border border-amber-300 text-amber-700 text-sm">
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.553.553 0 0 1-1.1 0L7.1 4.995z" />
                            <path d="M8 1L1 14h14L8 1zm0 2.19L13.53 13H2.47L8 3.19z" />
                        </svg>
                        <div>
                            <p className="font-semibold">Duplicate application!</p>
                            <p className="text-xs text-amber-600 mt-0.5">This candidate is already added to the selected job. Pick different job!</p>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-end gap-2">
                    ...
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedJobId || submitting}
                        className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40"
                    >
                        {submitting ? "Adding..." : "Add to job"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ---------- 3-dot Action Menu ----------
const ActionMenu = ({
    item,
    onAddToJob,
    onRemove,
}: {
    item: Candidate;
    onAddToJob: () => void;
    onRemove: () => void;
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
            <button
                onClick={() => setOpen((v) => !v)}
                className={`p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition ${open ? "bg-gray-100 text-gray-700" : ""
                    }`}
            >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                    <circle cx="8" cy="3" r="1.4" />
                    <circle cx="8" cy="8" r="1.4" />
                    <circle cx="8" cy="13" r="1.4" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-md z-50 overflow-hidden">
                    <button
                        onClick={() => { onAddToJob(); setOpen(false); }}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="2" y="3" width="12" height="10" rx="1.5" />
                            <path d="M5 3V2M11 3V2M2 7h12" />
                        </svg>
                        Add to job
                    </button>



                    <div className="h-px bg-gray-100 my-1" />

                    <button
                        onClick={() => { onRemove(); setOpen(false); }}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                    >
                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 4h10M6 4V3h4v1M5.5 4v8.5h5V4" />
                        </svg>
                        Remove
                    </button>
                </div>
            )}
        </div>
    );
};

// ---------- Row ----------
const renderRow = ({
    item,
    stages,
    onRowClick,
    onAddToJob,
    onRemove,
}: {
    item: Candidate;
    stages?: string[];
    onRowClick?: (candidate: Candidate) => void;
    onAddToJob: (candidate: Candidate) => void;
    onRemove: (candidate: Candidate) => void;
}) => {
    const stageIndex = stages ? stages.indexOf(item.pipelineStatus) : -1;
    const stageColor =
        stageIndex >= 0 ? colors[stageIndex % colors.length] : "bg-gray-300";

    return (
        <tr
            key={item.id}
            className="font-semibold bg-white text-sm hover:bg-sky-50 cursor-pointer"
            onClick={() => onRowClick?.(item)}
        >
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                        {item.name?.charAt(0)?.toUpperCase() || "C"}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{item.name}</span>
                        <span className="text-xs text-gray-500">Candidate</span>
                    </div>
                </div>
            </td>

            <td className="hidden md:table-cell">
                <div>{item.phone}</div>
                <div>{item.email}</div>
            </td>

            <td className="hidden md:table-cell">
                <p className="mb-2">{item.pipelineStatus}</p>
                {stages && (
                    <div className="flex gap-1 mb-2">
                        {stages.map((_, index) => {
                            const isActive = index <= stageIndex;
                            return (
                                <div
                                    key={index}
                                    className={`w-6 h-6 flex items-center justify-center rounded-sm text-xs font-bold ${isActive
                                        ? `${stageColor} text-white`
                                        : "bg-gray-200 text-gray-400"
                                        }`}
                                >
                                    {index + 1}
                                </div>
                            );
                        })}
                    </div>
                )}
            </td>

            <td className="hidden md:table-cell">Me</td>

            <td onClick={(e) => e.stopPropagation()}>
                <ActionMenu
                    item={item}
                    onAddToJob={() => onAddToJob(item)}
                    onRemove={() => onRemove(item)}
                />
            </td>
        </tr>
    );
};

// ---------- Main Component ----------
const CandidateTable = ({
    data,
    stages,
    onDataChange,
}: {
    data: Candidate[];
    stages?: string[];
    onDataChange?: () => void;
}) => {
    const [profileView, setProfileView] = useState<Candidate | null>(null);
    const [addToJobCandidate, setAddToJobCandidate] = useState<Candidate | null>(null);

    const handleRemove = async (candidate: Candidate) => {
        try {
            await referralApi.removeReferral(candidate.id);
            onDataChange?.();
        } catch (e) {
            console.error("Failed to remove candidate", e);
        }
    };

    return (
        <>
            <Table
                columns={columns}
                data={data}
                renderRow={(item) =>
                    renderRow({
                        item,
                        stages,
                        onRowClick: (candidate) => setProfileView(candidate),
                        onAddToJob: (candidate) => setAddToJobCandidate(candidate),
                        onRemove: handleRemove,
                    })
                }
            />

            {/* Candidate profile drawer */}
            <div
                className={`fixed overflow-y-auto top-0 right-0 h-full w-full md:w-1/2 bg-white shadow-lg z-50 transform transition-transform duration-300 ${profileView ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <button
                    className="absolute top-2 right-4 text-gray-500 hover:text-black"
                    onClick={() => setProfileView(null)}
                >
                    ✕
                </button>
                {profileView && (
                    <Candidature data={profileView} stages={stages} />
                )}
            </div>

            {profileView && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={() => setProfileView(null)}
                />
            )}

            {/* Add to job modal */}
            {addToJobCandidate && (
                <AddToJobModal
                    candidate={addToJobCandidate}
                    onClose={() => setAddToJobCandidate(null)}
                    onSuccess={() => onDataChange?.()}
                />
            )}
        </>
    );
};

export default CandidateTable;


// "use client";

// import { Candidate } from "@/lib/types/jobs";
// import { useState } from "react";
// import Candidature from "./Candidature";
// import Table from "@/components/jobs/Table";

// const columns = [
//     { header: "Candidate", accessor: "name", className: "p-4" },
//     { header: "Contact", accessor: "id", className: "hidden md:table-cell" },
//     { header: "Pipeline", accessor: "pipelineStatus", className: "hidden md:table-cell" },
//     { header: "Owner", accessor: "owner", className: "hidden md:table-cell" },
// ];

// const STAGE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
//     Applied: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
//     Screening: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-400" },
//     Interview: { bg: "bg-violet-50", text: "text-violet-600", dot: "bg-violet-400" },
//     Offer: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400" },
//     Hired: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400" },
//     Rejected: { bg: "bg-red-50", text: "text-red-500", dot: "bg-red-400" },
// };

// const AVATAR_COLORS = [
//     "bg-violet-500", "bg-blue-500", "bg-teal-500",
//     "bg-rose-500", "bg-amber-500", "bg-indigo-500",
// ];

// function getAvatarColor(name: string) {
//     const idx = (name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length;
//     return AVATAR_COLORS[idx];
// }

// function StagePill({ status }: { status: string }) {
//     const style = STAGE_COLORS[status] ?? { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" };
//     return (
//         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
//             <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
//             {status}
//         </span>
//     );
// }

// function StageProgress({ stages, currentStatus }: { stages: string[]; currentStatus: string }) {
//     const currentIdx = stages.indexOf(currentStatus);
//     return (
//         <div className="flex items-center gap-1 mt-2">
//             {stages.map((_, i) => (
//                 <div
//                     key={i}
//                     className={`h-1 flex-1 rounded-full transition-all ${i < currentIdx
//                             ? "bg-emerald-400"
//                             : i === currentIdx
//                                 ? "bg-indigo-500"
//                                 : "bg-gray-100"
//                         }`}
//                 />
//             ))}
//         </div>
//     );
// }

// const renderRow = ({
//     item,
//     stages,
//     onRowClick,
// }: {
//     item: Candidate;
//     stages?: string[];
//     onRowClick?: (c: Candidate) => void;
// }) => (
//     <tr
//         key={item.id}
//         className="group bg-white border-b border-gray-50 hover:bg-indigo-50/40 transition-colors cursor-pointer"
//         onClick={() => onRowClick?.(item)}
//     >
//         {/* Candidate */}
//         <td className="p-4">
//             <div className="flex items-center gap-3">
//                 <div className={`w-9 h-9 shrink-0 rounded-xl ${getAvatarColor(item.name)} flex items-center justify-center text-white text-sm font-semibold shadow-sm`}>
//                     {item.name?.charAt(0)?.toUpperCase() || "C"}
//                 </div>
//                 <div>
//                     <p className="text-sm font-semibold text-gray-800 leading-tight group-hover:text-indigo-700 transition-colors">
//                         {item.name || "—"}
//                     </p>
//                     <p className="text-xs text-gray-400 mt-0.5 leading-tight">
//                         {item.currentJob || "Candidate"}
//                         {item.currentCompany ? ` · ${item.currentCompany}` : ""}
//                     </p>
//                 </div>
//             </div>
//         </td>

//         {/* Contact */}
//         <td className="hidden md:table-cell px-4 py-3">
//             <p className="text-sm text-gray-700">{item.phone || "—"}</p>
//             <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{item.email || "—"}</p>
//         </td>

//         {/* Pipeline */}
//         <td className="hidden md:table-cell px-4 py-3">
//             <StagePill status={item.pipelineStatus} />
//             {stages && <StageProgress stages={stages} currentStatus={item.pipelineStatus} />}
//         </td>

//         {/* Owner */}
//         <td className="hidden md:table-cell px-4 py-3">
//             <div className="flex items-center gap-2">
//                 <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-semibold">
//                     M
//                 </div>
//                 <span className="text-sm text-gray-600">Me</span>
//             </div>
//         </td>
//     </tr>
// );

// const CandidateTable = ({ data, stages }: { data: Candidate[]; stages?: string[] }) => {
//     const [profileView, setProfileView] = useState<Candidate | null>(null);

//     return (
//         <>
//             <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
//                 <Table
//                     columns={columns}
//                     data={data}
//                     renderRow={(item) =>
//                         renderRow({ item, stages, onRowClick: setProfileView })
//                     }
//                 />

//                 {data.length === 0 && (
//                     <div className="flex flex-col items-center justify-center py-16 text-center">
//                         <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
//                             <svg width="20" height="20" fill="none" stroke="#9ca3af" strokeWidth="1.5" viewBox="0 0 24 24">
//                                 <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
//                                 <circle cx="9" cy="7" r="4" />
//                                 <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
//                             </svg>
//                         </div>
//                         <p className="text-sm font-medium text-gray-500">No candidates yet</p>
//                         <p className="text-xs text-gray-400 mt-1">Add your first candidate to get started</p>
//                     </div>
//                 )}
//             </div>

//             {/* Slide-over panel */}
//             <div
//                 className={`fixed top-0 right-0 h-full w-full md:w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${profileView ? "translate-x-0" : "translate-x-full"
//                     }`}
//             >
//                 {/* Panel header */}
//                 <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100">
//                     <span className="text-sm font-semibold text-gray-700">Candidate Profile</span>
//                     <button
//                         onClick={() => setProfileView(null)}
//                         className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
//                     >
//                         <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                             <line x1="18" y1="6" x2="6" y2="18" />
//                             <line x1="6" y1="6" x2="18" y2="18" />
//                         </svg>
//                     </button>
//                 </div>

//                 <div className="flex-1 overflow-y-auto">
//                     {profileView && <Candidature data={profileView} stages={stages} />}
//                 </div>
//             </div>

//             {/* Backdrop */}
//             {profileView && (
//                 <div
//                     className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity"
//                     onClick={() => setProfileView(null)}
//                 />
//             )}
//         </>
//     );
// };

// export default CandidateTable;