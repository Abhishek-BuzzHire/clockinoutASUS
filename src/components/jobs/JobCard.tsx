"use client";
import { useState } from "react";
import { Job } from "@/lib/types/jobs";
import { JobPipelinePayload } from "@/lib/types/jobs";
import PipelineForm from "./PipelineModal";
import { jobsApi } from "@/apis/jobs/route";

const STAGE_COLORS = [
    "#f97316", "#eab308", "#3b82f6", "#ef4444",
    "#14b8a6", "#22c55e", "#a855f7", "#6366f1",
];

const JobCard = ({
    job: initialJob,
    onDeleted,
}: {
    job: Job;
    onDeleted?: (id: number) => void;
}) => {
    const [pipeline, setPipeline] = useState<JobPipelinePayload | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const handleSave = async (stageNames: string[]) => {
        setSaving(true);
        setSaveError(null);
        try {
            const saved = pipeline
                ? await jobsApi.updatePipeline(initialJob.job_id, stageNames)
                : await jobsApi.savePipeline(initialJob.job_id, stageNames);
            setPipeline(saved);
            setShowForm(false);
        } catch {
            setSaveError("Failed to save pipeline. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div
                className={`bg-white p-4 rounded-lg border-t-4 flex flex-col justify-between ${initialJob.job_status === "Draft" ? "border-gray-300" : "border-green-400"
                    }`}
                style={{ minWidth: "200px" }}
            >
                {/* ── Top info ── */}
                <div>
                    <span className="text-sm font-semibold text-gray-400">
                        {initialJob.client_name ?? "Unknown"}
                    </span>
                    <h3 className="text-xl font-bold mt-1">{initialJob.job_title}</h3>
                </div>

                {/* ── Counters ── */}
                <div className="flex gap-12 mt-2 w-full p-8 pl-4 bg-sky-50 rounded-md">
                    <div className="border-l-2 pl-2 border-gray-300">
                        <span className="text-gray-500 text-md font-semibold block mb-3">TOTAL</span>
                        <span className="text-3xl">{initialJob.total_candidates ?? 0}</span>
                    </div>
                    <div className="border-l-2 pl-2 border-green-400">
                        <span className="text-gray-500 text-md font-semibold block mb-3">NEW</span>
                        <span className="text-3xl">{initialJob.new_candidates ?? 0}</span>
                    </div>
                </div>

                {/* ── Pipeline stages strip ── */}
                {pipeline && pipeline.stages.length > 0 && (
                    <div className="mt-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
                            Pipeline Stages
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {pipeline.stages.map((s, i) => (
                                <span
                                    key={i}
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full text-white
                                        ${s.is_final ? "ring-2 ring-green-400 ring-offset-1" : ""}`}
                                    style={{ background: STAGE_COLORS[i % STAGE_COLORS.length] }}
                                    title={s.is_final ? "Final stage" : `Stage ${s.order + 1}`}
                                >
                                    {s.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {saveError && (
                    <p className="text-xs text-red-500 mt-2">{saveError}</p>
                )}

                {/* ── Meta row ── */}
                <div className="flex items-center space-x-4 text-sm font-semibold text-gray-400 mt-4">
                    <span>{initialJob.job_location}</span>
                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span>{initialJob.job_type}</span>
                </div>

                {/* ── Footer row ── */}
                <div className="flex items-center justify-between mt-4 gap-2 flex-wrap">
                    <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${initialJob.job_status === "draft"
                            ? "bg-gray-200 text-gray-600"
                            : "bg-green-100 text-green-600"
                            }`}
                    >
                        {initialJob.job_status ?? "Published"}
                    </span>

                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800
                                   border border-indigo-200 hover:border-indigo-400 px-2.5 py-1 rounded-full transition-colors"
                    >
                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        {pipeline ? "Edit Pipeline" : "Add Pipeline"}
                    </button>

                    <a
                        href={`/jobs/${initialJob.job_id}`}
                        className="flex items-center text-sm font-semibold text-blue-600 hover:underline"
                    >
                        See Details
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>
            </div>

            {showForm && (
                <PipelineForm
                    job={initialJob}
                    existing={pipeline}
                    saving={saving}
                    onSave={handleSave}
                    onCancel={() => { setShowForm(false); setSaveError(null); }}
                />
            )}
        </>
    );
};

export default JobCard;