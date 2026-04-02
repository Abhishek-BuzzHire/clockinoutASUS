"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Job, EditPipelinePayload } from "@/lib/types/jobs";
import PipelineModal from "./PipelineModal";
import { jobsApi } from "@/apis/jobs/route";

const JobCard = ({
    job: initialJob,
    onDeleted,
}: {
    job: Job;
    onDeleted?: (id: number) => void;
}) => {
    const router = useRouter();
    const [pipeline, setPipeline] = useState<EditPipelinePayload | null>(
        initialJob.pipeline ? ({ pipeline_name: initialJob.pipeline } as EditPipelinePayload) : null
    );
    const [showForm, setShowForm] = useState(false);
    const [loadingPipeline, setLoadingPipeline] = useState(false);

    const handleOpenPipeline = async () => {
        if (initialJob.pipeline) {
            setLoadingPipeline(true);
            try {
                const full = await jobsApi.getPipeline(initialJob.job_id);
                setPipeline(full);
            } catch (err) {
                console.error("Failed to fetch pipeline", err);
            } finally {
                setLoadingPipeline(false);
            }
        }
        setShowForm(true);
    };

    const handleSeeDetails = (id: number) => {
        if (!id || isNaN(id)) return;
        router.push(`/list/jobs/${id}`);
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
                        onClick={handleOpenPipeline}
                        disabled={loadingPipeline}
                        className="flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800
                       border border-indigo-200 hover:border-indigo-400 px-2.5 py-1 rounded-full 
                       transition-colors disabled:opacity-50"
                    >
                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        {loadingPipeline ? "Loading…" : pipeline ? "Edit Pipeline" : "Add Pipeline"}
                    </button>

                    <button
                        onClick={() => handleSeeDetails(initialJob.job_id)}
                        className="flex items-center text-sm font-semibold text-blue-600 hover:underline"
                    >
                        See Details
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Backdrop + Modal — clicking backdrop closes the form */}
            {showForm && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
                    onClick={() => setShowForm(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                    >
                        <PipelineModal
                            job={initialJob}
                            existing={pipeline}
                            onSaved={(result) => {
                                setPipeline(result);
                                setShowForm(false);
                            }}
                            onCancel={() => setShowForm(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default JobCard;