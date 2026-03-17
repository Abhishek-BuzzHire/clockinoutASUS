import CandidatePipeline from "@/components/jobs/CandidatePipeline";
import CandidateTable from "@/components/jobs/CandidateTable";
import Pagination from "@/components/Pagination";
import Pipeline from "@/components/dashboard/Pipeline";
import { jobsApi } from "@/apis/jobs/route";
import { Job } from "@/lib/types/jobs";
import { candidateJobData, stagesData } from "@/lib/types/jobdata";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const candidateData = candidateJobData;
const stages = stagesData;

interface SingleJobPageProps {
    jobId: number;
}

const SingleJobPage = ({ jobId }: SingleJobPageProps) => {
    const tabs = ["Candidates", "Job Detail", "Hiring Pipeline", "Settings"];
    const [activeTab, setActiveTab] = useState("Candidates");
    const router = useRouter();
    type ViewType = "pipeline" | "table";
    const [view, setView] = useState<ViewType>("pipeline");
    const [statusOpen, setStatusOpen] = useState(false);

    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusUpdating, setStatusUpdating] = useState(false);

    async function fetchJob() {
        setLoading(true);
        setError(null);
        try {
            const result: Job = await jobsApi.getJobById(jobId);
            setJob(result);
        } catch (err) {
            console.error("Failed to fetch job", err);
            setError("Failed to load job details.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (jobId) fetchJob();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jobId]);

    const handleStatusChange = async (newStatus: Job["job_status"]) => {
        if (!job) return;
        setStatusUpdating(true);
        try {
            await jobsApi.updateJobStatus(job.job_id, newStatus);
            setJob((prev) => prev ? { ...prev, job_status: newStatus } : prev);
        } catch (err) {
            console.error("Failed to update status", err);
        } finally {
            setStatusUpdating(false);
            setStatusOpen(false);
        }
    };

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
                return (
                    <div className="mt-6 bg-white p-6 rounded-2xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Job Details</h2>
                        {job && (
                            <div className="space-y-3 text-sm text-gray-700">
                                <p><span className="font-semibold">Title:</span> {job.job_title}</p>
                                <p><span className="font-semibold">Location:</span> {job.job_location}</p>
                                <p><span className="font-semibold">Type:</span> {job.job_type}</p>
                                <p><span className="font-semibold">Status:</span> {job.job_status}</p>
                                <p><span className="font-semibold">Client:</span> {job.client_name}</p>
                                {job.skills && job.skills.length > 0 && (
                                    <p>
                                        <span className="font-semibold">Skills:</span>{" "}
                                        {job.skills.join(", ")}
                                    </p>
                                )}
                                {job.min_exp && job.max_exp && (
                                    <p>
                                        <span className="font-semibold">Experience:</span>{" "}
                                        {job.min_exp} – {job.max_exp} yrs
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                );

            case "Hiring Pipeline":
                return <Pipeline />;

            case "Settings":
                return (
                    <div className="mt-6 bg-white p-6 rounded-2xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Settings</h2>
                        <p>Settings content goes here.</p>
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-gray-500">
                Loading job...
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
                <div className="flex items-center justify-between w-full mb-6">

                    {/* Left section */}
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

                    {/* Right section — status dropdown */}
                    <div className="relative flex items-center space-x-2">
                        <button
                            onClick={() => setStatusOpen(!statusOpen)}
                            disabled={statusUpdating}
                            className="flex bg-indigo-600 text-white rounded-md px-4 py-2 text-sm items-center disabled:opacity-60 capitalize"
                        >
                            {statusUpdating ? "Updating..." : (job?.job_status ?? "—")}
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
                                {(["open", "closed", "draft"] as Job["job_status"][]).map((s) => (
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

                {/* Tabs */}
                <div className="flex space-x-8 text-xs font-bold border-b border-gray-300 mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`p-2 ${activeTab === tab
                                    ? "border-b-2 border-blue-600"
                                    : "text-gray-500"
                                }`}
                        >
                            {tab.toUpperCase()}
                        </button>
                    ))}
                </div>

                {renderContent()}
            </div>
        </div>
    );
};

export default SingleJobPage;