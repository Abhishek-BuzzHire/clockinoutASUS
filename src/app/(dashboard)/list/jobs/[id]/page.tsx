"use client";

import CandidatePipeline from "@/components/jobs/CandidatePipeline";
import CandidateTable from "@/components/jobs/CandidateTable";
import Pagination from "@/components/Pagination";
import JobDetail from "@/components/jobs/JobDetail";
import PipelineForm from "@/components/jobs/PipelineModal";
import { jobsApi } from "@/apis/jobs/route";
import { Job, JobPipelinePayload } from "@/lib/types/jobs";
import { candidateJobData, stagesData } from "@/lib/types/jobdata";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import JobSettings from "@/components/jobs/JobSetting";

const candidateData = candidateJobData;
const stages = stagesData;

const JOB_STATUSES: Job["job_status"][] = ["open", "closed", "draft"];

interface SingleJobPageProps {
    jobId: number;
}

const SingleJobPage = ({ jobId }: SingleJobPageProps) => {
    const tabs = ["Candidates", "Job Detail", "Hiring Pipeline", "Settings"] as const;
    type Tab = typeof tabs[number];
    type ViewType = "pipeline" | "table";

    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>("Candidates");
    const [view, setView] = useState<ViewType>("pipeline");

    // ── Job state ──────────────────────────────────────────────────────────
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── Status dropdown ────────────────────────────────────────────────────
    const [statusOpen, setStatusOpen] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);

    // ── Pipeline state ─────────────────────────────────────────────────────
    const [pipeline, setPipeline] = useState<JobPipelinePayload | null>(null);
    const [showPipelineForm, setShowPipelineForm] = useState(false);
    const [pipelineSaving, setPipelineSaving] = useState(false);
    const [pipelineError, setPipelineError] = useState<string | null>(null);

    // ── Fetch job ──────────────────────────────────────────────────────────
    async function fetchJob() {
        setLoading(true);
        setError(null);
        try {
            const result = await jobsApi.getJobById(jobId);
            setJob(result);
        } catch (err) {
            console.error("Failed to fetch job", err);
            setError("Failed to load job details.");
        } finally {
            setLoading(false);
        }
    }

    // ── Fetch pipeline ─────────────────────────────────────────────────────
    async function fetchPipeline() {
        try {
            const result = await jobsApi.getPipeline(jobId);
            setPipeline(result);
        } catch {
            // pipeline not yet created — that's fine, stays null
        }
    }

    useEffect(() => {
        if (jobId) {
            fetchJob();
            fetchPipeline();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jobId]);

    // ── Status change ──────────────────────────────────────────────────────
    const handleStatusChange = async (newStatus: Job["job_status"]) => {
        if (!job) return;
        setStatusUpdating(true);
        try {
            await jobsApi.updateJobStatus(job.job_id, newStatus);
            setJob(prev => prev ? { ...prev, job_status: newStatus } : prev);
        } catch (err) {
            console.error("Failed to update status", err);
        } finally {
            setStatusUpdating(false);
            setStatusOpen(false);
        }
    };

    // ── Pipeline save ──────────────────────────────────────────────────────
    const handlePipelineSave = async (stageNames: string[]) => {
        setPipelineSaving(true);
        setPipelineError(null);
        try {
            const saved = pipeline
                ? await jobsApi.updatePipeline(jobId, stageNames)
                : await jobsApi.savePipeline(jobId, stageNames);
            setPipeline(saved);
            setShowPipelineForm(false);
        } catch {
            setPipelineError("Failed to save pipeline. Please try again.");
        } finally {
            setPipelineSaving(false);
        }
    };

    // ── Tab content ────────────────────────────────────────────────────────
    const renderContent = () => {
        switch (activeTab) {
            case "Candidates":
                return (
                    <div>
                        <div className="flex justify-between">
                            <div className="my-8 text-md font-bold">
                                Total Candidates:{" "}
                                <span className="ml-2 p-1 bg-blue-600 text-white rounded-md">
                                    {candidateData.length}
                                </span>
                            </div>
                            <div className="inline-flex font-semibold rounded-md shadow-sm border border-gray-300 overflow-hidden my-8">
                                <button
                                    onClick={() => setView("pipeline")}
                                    className={`px-4 text-sm focus:outline-none transition-colors duration-200 ease-in-out ${view === "pipeline"
                                        ? "bg-white text-gray-900"
                                        : "bg-gray-300 text-gray-500 hover:bg-gray-200"
                                        }`}
                                >
                                    Pipeline View
                                </button>
                                <button
                                    onClick={() => setView("table")}
                                    className={`px-4 text-sm focus:outline-none transition-colors duration-200 ease-in-out ${view === "table"
                                        ? "bg-white text-gray-900"
                                        : "bg-gray-300 text-gray-500 hover:bg-gray-200"
                                        }`}
                                >
                                    Table View
                                </button>
                            </div>
                        </div>
                        {view === "pipeline" && (
                            <CandidatePipeline data={candidateData} stages={stages} />
                        )}
                        {view === "table" && (
                            <>
                                <CandidateTable data={candidateData} stages={stages} />
                                <Pagination />
                            </>
                        )}
                    </div>
                );

            case "Job Detail":
                return <JobDetail job={job} />;

            case "Hiring Pipeline":
                return (
                    <div className="mt-6">
                        {/* ── Pipeline header ── */}
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Hiring Pipeline</h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {pipeline
                                        ? `${pipeline.stages.length} stage${pipeline.stages.length !== 1 ? "s" : ""} configured`
                                        : "No pipeline configured yet"}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowPipelineForm(true)}
                                className="flex items-center gap-2 text-sm font-semibold text-white
                                           bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M12 4v16m8-8H4" />
                                </svg>
                                {pipeline ? "Edit Pipeline" : "Create Pipeline"}
                            </button>
                        </div>

                        {pipelineError && (
                            <p className="text-sm text-red-500 mb-3">{pipelineError}</p>
                        )}

                        {/* ── Pipeline stage list ── */}
                        {pipeline && pipeline.stages.length > 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                {pipeline.stages.map((stage, i) => {
                                    const COLORS = [
                                        "#f97316", "#eab308", "#3b82f6", "#ef4444",
                                        "#14b8a6", "#22c55e", "#a855f7", "#6366f1",
                                    ];
                                    const color = COLORS[i % COLORS.length];
                                    return (
                                        <div
                                            key={i}
                                            className="flex items-center gap-4 px-5 py-3.5
                                                       border-b border-gray-50 last:border-0
                                                       hover:bg-gray-50 transition-colors"
                                        >
                                            <span
                                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                style={{ background: color }}
                                            />
                                            <span className="text-xs font-bold text-gray-300 w-5 text-center">
                                                {stage.order + 1}
                                            </span>
                                            <span className="flex-1 text-sm font-semibold text-gray-700">
                                                {stage.name}
                                            </span>
                                            {stage.is_final && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full
                                                                 bg-green-100 text-green-600">
                                                    Final
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-dashed border-gray-200
                                            p-10 flex flex-col items-center justify-center text-center">
                                <svg className="w-10 h-10 text-gray-200 mb-3" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                </svg>
                                <p className="text-sm font-semibold text-gray-400">No pipeline yet</p>
                                <p className="text-xs text-gray-300 mt-1">
                                    Click "Create Pipeline" to define your hiring stages.
                                </p>
                            </div>
                        )}
                    </div>
                );

            case "Settings":
                return job ? <JobSettings job={job} onSave={(updated) => {
                    // TODO: await jobsApi.updateJob(job.job_id, updated)
                    setJob(prev => prev ? { ...prev, ...updated } : prev);
                }} /> : null;

            default:
                return null;
        }
    };

    // ── Loading / error states ─────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-gray-500">
                Loading job…
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="w-full bg-sky-50 p-8 relative">
            <div className="text-lg">

                {/* ── Page header ── */}
                <div className="flex items-center justify-between w-full mb-6">
                    {/* Left */}
                    <div className="flex items-center space-x-4">
                        <div
                            className="bg-white mr-4 rounded-full p-2 shadow hover:cursor-pointer"
                            onClick={() => router.back()}
                        >
                            <Image src="/chev-left.png" alt="Back" width={24} height={24} />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-400">
                                {job?.client_name ?? "—"}
                            </p>
                            <h3 className="text-2xl text-gray-900">
                                {job?.job_title ?? "—"}
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                                <span>{job?.job_location ?? "—"}</span>
                                <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                <span>{job?.job_type ?? "—"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right — status dropdown */}
                    <div className="relative flex items-center space-x-2">
                        <button
                            onClick={() => setStatusOpen(!statusOpen)}
                            disabled={statusUpdating}
                            className="flex bg-indigo-600 text-white rounded-md px-4 py-2 text-sm
                                       items-center disabled:opacity-60 capitalize"
                        >
                            {statusUpdating ? "Updating…" : (job?.job_status ?? "—")}
                            <Image
                                src="/chev-down.png"
                                alt=""
                                width={20}
                                height={20}
                                className="invert brightness-0 ml-2"
                            />
                        </button>

                        {statusOpen && (
                            <div className="absolute top-10 left-0 bg-white border rounded-md shadow-md w-32 z-50">
                                {JOB_STATUSES.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleStatusChange(s)}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 capitalize"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="flex space-x-8 text-xs font-bold border-b border-gray-300 mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`p-2 ${activeTab === tab
                                ? "border-b-2 border-blue-600 text-gray-900"
                                : "text-gray-500"
                                }`}
                        >
                            {tab.toUpperCase()}
                        </button>
                    ))}
                </div>

                {renderContent()}
            </div>

            {/* ── Pipeline form modal ── */}
            {showPipelineForm && job && (
                <PipelineForm
                    job={job}
                    existing={pipeline}
                    saving={pipelineSaving}
                    onSave={handlePipelineSave}
                    onCancel={() => { setShowPipelineForm(false); setPipelineError(null); }}
                />
            )}
        </div>
    );
};

export default SingleJobPage;