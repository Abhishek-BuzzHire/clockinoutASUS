"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { jobsApi } from "@/apis/jobs/route";
import { Job, EditPipelinePayload, PipelineStage, Candidate } from "@/lib/types/jobs";

import CandidatePipeline from "@/components/jobs/CandidatePipeline";
import CandidateTable from "@/components/jobs/CandidateTable";
import Pagination from "@/components/Pagination";
import JobDetail from "@/components/jobs/JobDetail";
import JobSettings from "@/components/jobs/JobSetting";
import PipelineModal from "@/components/jobs/PipelineModal";
import Image from "next/image";

// The board API returns pipeline as a full object, whereas Job.pipeline is typed as string.
// BoardStage extends PipelineStage (which has stage_name, order, is_final) with the extra
// fields the board endpoint adds: stage_id and the candidates array.
type BoardStage = PipelineStage & {
    stage_id: number;
    candidates: Candidate[];
};

// JobBoard replaces the `pipeline: string` field on Job with the real board shape.
type JobBoard = Omit<Job, "pipeline"> & {
    pipeline: {
        pipeline_id: number;
        pipeline_name: string;
        stages: BoardStage[];
    } | null;
};

const SingleJobPage = () => {
    const params = useParams();
    const router = useRouter();

    const jobId = Number(params?.id);

    if (!params?.id || isNaN(jobId)) {
        return <div className="p-6 text-red-500">Invalid Job ID</div>;
    }

    const tabs = ["Candidates", "Job Detail", "Hiring Pipeline", "Settings"] as const;
    type Tab = typeof tabs[number];
    type ViewType = "pipeline" | "table";

    const [activeTab, setActiveTab] = useState<Tab>("Candidates");
    const [view, setView] = useState<ViewType>("pipeline");

    const [job, setJob] = useState<Job | null>(null);
    const [jobLoading, setJobLoading] = useState(false);
    const [jobError, setJobError] = useState<string | null>(null);

    const [pipeline, setPipeline] = useState<EditPipelinePayload | null>(null);
    const [showPipelineForm, setShowPipelineForm] = useState(false);

    const [candidateData, setCandidateData] = useState<Candidate[]>([]);
    const [stages, setStages] = useState<string[]>([]);
    const [boardLoading, setBoardLoading] = useState(false);

    const [statusOpen, setStatusOpen] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);

    const fetchJob = async () => {
        setJobLoading(true);
        try {
            const result = await jobsApi.getJobById(jobId);
            console.log(result);
            setJob(result);
        } catch {
            setJobError("Failed to load job.");
        } finally {
            setJobLoading(false);
        }
    };

    const fetchBoard = async () => {
        setBoardLoading(true);
        try {
            // Cast needed because getJobPipelineCandidate is typed as Promise<Job>,
            // but the board endpoint actually returns JobBoard at runtime.
            const result = (await jobsApi.getJobPipelineCandidate(jobId)) as unknown as JobBoard;
            console.log(result);

            if (result?.pipeline?.stages?.length) {
                // Respect the `order` field from the API
                const sortedStages = [...result.pipeline.stages].sort(
                    (a, b) => a.order - b.order
                );

                // stage_name comes from PipelineStage which BoardStage extends
                setStages(sortedStages.map((s) => s.stage_name));

                // Candidates already have all Candidate fields from the API;
                // we just stamp pipelineStatus so CandidatePipeline can bucket them.
                const allCandidates: Candidate[] = sortedStages.flatMap((stage) =>
                    (stage.candidates ?? []).map((c) => ({
                        ...c,
                        pipelineStatus: stage.stage_name,
                    }))
                );
                setCandidateData(allCandidates);
            } else {
                setStages([]);
                setCandidateData([]);
            }
        } catch (err) {
            console.error("Failed to load board data:", err);
        } finally {
            setBoardLoading(false);
        }
    };

    useEffect(() => {
        fetchJob();
        fetchBoard();
    }, [jobId]);

    if (jobLoading) return <div className="p-6">Loading...</div>;
    if (jobError || !job) return <div className="p-6 text-red-500">Job not found</div>;

    const handleStatusChange = async (newStatus: string) => {
        if (!job || newStatus === job.job_status) {
            setStatusOpen(false);
            return;
        }

        const confirmChange = window.confirm(
            `Are you sure you want to change status to "${newStatus}"?`
        );

        if (!confirmChange) return;

        try {
            setStatusLoading(true);

            await jobsApi.updateJobStatus(job.job_id, newStatus);

            // update UI instantly
            setJob((prev) =>
                prev ? { ...prev, job_status: newStatus } : prev
            );
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update status");
        } finally {
            setStatusLoading(false);
            setStatusOpen(false);
        }
    };

    return (
        <div className="w-full bg-sky-50 p-8 min-h-screen relative">
            <div className="text-lg">

                {/* ── Header ── */}
                <div className="flex items-center justify-between w-full mb-6">
                    <div className="flex items-center space-x-4">
                        <div
                            className="bg-white mr-4 rounded-full p-2 shadow hover:cursor-pointer"
                            onClick={() => router.back()}
                        >
                            <Image src="/chev-left.png" alt="Back" width={24} height={24} />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-400">{job.client_name}</p>
                            <h3 className="text-2xl text-gray-900 font-bold">{job.job_title}</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                                <span>{job.job_location ?? "Location"}</span>
                                <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                <span>{job.job_type ?? "Full time"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 relative">
                        <button
                            onClick={() => setStatusOpen((prev) => !prev)}
                            disabled={statusLoading}
                            className="flex items-center bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-semibold"
                        >
                            {statusLoading ? "Updating..." : job.job_status ?? "Published"}
                            <Image
                                src="/chev-down.png"
                                alt=""
                                width={20}
                                height={20}
                                className="invert brightness-0 ml-2"
                            />
                        </button>

                        {statusOpen && (
                            <div className="absolute top-full mt-2 right-0 w-40 bg-white border rounded-md shadow-lg z-50">
                                {["Published", "Draft", "Closed"].map((status) => (
                                    <div
                                        key={status}
                                        onClick={() => handleStatusChange(status)}
                                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${job.job_status === status
                                            ? "font-semibold text-blue-600"
                                            : ""
                                            }`}
                                    >
                                        {status}
                                    </div>
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

                {/* ── Candidates Tab ── */}
                {activeTab === "Candidates" && (
                    <div>
                        {boardLoading ? (
                            <div className="p-6 text-gray-500">Loading candidates...</div>
                        ) : stages.length === 0 ? (
                            <div className="p-6 text-gray-400 text-sm">
                                No pipeline configured for this job yet.{" "}
                                <button
                                    className="text-blue-600 underline"
                                    onClick={() => setActiveTab("Hiring Pipeline")}
                                >
                                    Create one
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center my-6">
                                    <div className="text-md font-bold">
                                        Total Candidates:{" "}
                                        <span className="ml-2 px-2 py-1 bg-blue-600 text-white rounded-md text-sm">
                                            {candidateData.length}
                                        </span>
                                    </div>

                                    <div className="inline-flex font-semibold rounded-md shadow-sm border border-gray-300 overflow-hidden">
                                        <button
                                            onClick={() => setView("pipeline")}
                                            className={`px-4 py-2 text-sm focus:outline-none transition-colors duration-200 ${view === "pipeline"
                                                ? "bg-white text-gray-900"
                                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                }`}
                                        >
                                            Pipeline View
                                        </button>
                                        <button
                                            onClick={() => setView("table")}
                                            className={`px-4 py-2 text-sm focus:outline-none transition-colors duration-200 ${view === "table"
                                                ? "bg-white text-gray-900"
                                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
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
                            </>
                        )}
                    </div>
                )}

                {activeTab === "Job Detail" && <JobDetail job={job} />}

                {activeTab === "Hiring Pipeline" && (
                    <button
                        className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md"
                        onClick={() => setShowPipelineForm(true)}
                    >
                        {pipeline ? "Edit Pipeline" : "Create Pipeline"}
                    </button>
                )}

                {activeTab === "Settings" && (
                    <JobSettings job={job} onSave={() => { }} />
                )}
            </div>

            {showPipelineForm && (
                <PipelineModal
                    job={job}
                    existing={pipeline}
                    onCancel={() => setShowPipelineForm(false)}
                    onSaved={(res) => {
                        setPipeline(res);
                        setShowPipelineForm(false);
                        fetchBoard(); // refresh board after pipeline changes
                    }}
                />
            )}
        </div>
    );
};

export default SingleJobPage;