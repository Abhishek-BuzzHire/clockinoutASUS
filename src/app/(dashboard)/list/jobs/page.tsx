"use client";

import AddJobForm from "@/components/jobs/AddJobForm";
import JobCard from "@/components/jobs/JobCard";
import { jobsData } from "@/lib/types/jobdata";
import { Job } from "@/lib/types/jobs";
import { useState } from "react";

const JobsPage = () => {
    const [activeTab, setActiveTab] = useState<Job["jobStatus"]>("active");
    const [filteredJobs, setFilteredJobs] = useState<Job[]>(
        jobsData.filter((job: Job) => job.jobStatus === "active")
    );
    const [selectedClient, setSelectedClient] = useState<string>("All");
    const [open, setOpen] = useState(false);

    const clients: string[] = ["All", ...Array.from(new Set(jobsData.map((job: Job) => job.client)))];

    const handleTabChange = (tab: Job["jobStatus"]) => {
        setActiveTab(tab);
        setFilteredJobs(jobsData.filter((job: Job) => job.jobStatus === tab));
        setSelectedClient("All");
    };

    const handleClientChange = (client: string) => {
        setSelectedClient(client);
        const jobsByStatus = jobsData.filter((job: Job) => job.jobStatus === activeTab);
        setFilteredJobs(
            client === "All"
                ? jobsByStatus
                : jobsByStatus.filter((job: Job) => job.client === client)
        );
    };

    return (
        <div className="w-full min-h-screen bg-sky-50 p-8">

            {/* Tabs row + Add Job button */}
            <div className="flex items-end justify-between border-b border-gray-300 mb-6">
                <div className="flex space-x-8 text-lg font-semibold">
                    <button
                        onClick={() => handleTabChange("active")}
                        className={`pb-4 ${activeTab === "active"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-500"
                            }`}
                    >
                        ACTIVE JOBS
                    </button>
                    <button
                        onClick={() => handleTabChange("inactive")}
                        className={`pb-4 ${activeTab === "inactive"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-500"
                            }`}
                    >
                        INACTIVE JOBS
                    </button>
                </div>

                <div className="pb-3">
                    <button
                        onClick={() => setOpen(true)}
                        className="flex items-center gap-2 bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
                    >
                        <span className="text-white text-lg leading-none">+</span>
                        Add Job
                    </button>
                </div>
            </div>

            {/* Filters and Count */}
            <div className="flex flex-col mt-8 md:flex-row justify-left gap-16 items-start md:items-center my-6">
                <h2 className="text-2xl text-gray-800 mb-4 md:mb-0">
                    {filteredJobs.length}{" "}
                    {activeTab === "active" ? "Active" : "Inactive"} Jobs
                </h2>
                <div className="flex items-center space-x-4 text-sm">
                    <span className="font-semibold">Sort by:</span>
                    <div className="flex gap-12">
                        <select
                            className="p-2 rounded-md border border-gray-300"
                            value={selectedClient}
                            onChange={(e) => handleClientChange(e.target.value)}
                        >
                            {clients.map((client) => (
                                <option key={client} value={client}>
                                    {client}
                                </option>
                            ))}
                        </select>
                        <button className="flex items-center p-2 rounded-md bg-white border border-gray-300 hover:bg-gray-50">
                            <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 6V4M12 18V12M18 10V8M6 10V8M18 14H6"
                                ></path>
                            </svg>
                            Other Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Job Cards Grid */}
            <div className="grid mt-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {filteredJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                ))}
            </div>

            {open && <AddJobForm onClose={() => setOpen(false)} existingClients={[]} />}
        </div>
    );
};

export default JobsPage;