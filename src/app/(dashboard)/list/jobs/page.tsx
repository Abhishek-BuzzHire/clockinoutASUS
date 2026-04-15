"use client";

import { clientApi } from "@/apis/clients/routes";
import { jobsApi } from "@/apis/jobs/route";
import AddJobModal from "@/components/jobs/AddJobModal";
import JobCard from "@/components/jobs/JobCard";
import { Job } from "@/lib/types/jobs";
import { useEffect, useState } from "react";

type Client = {
    client_id: number | null;
    client_name: string;
    client_industry: string;
};


const JobsPage = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [activeTab, setActiveTab] = useState<Job["job_status"]>("open");
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
    const [selectedClient, setSelectedClient] = useState<string>("All");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // NEW: dedicated client list state
    const [clientList, setClientList] = useState<Client[]>([]);
    const [clientsLoading, setClientsLoading] = useState(false);

    async function fetchJobs() {
        setLoading(true);
        setError(null);
        try {
            const data: Job[] = await jobsApi.getJobs();
            setJobs(data);
            console.log(data);
            applyFilters(data, activeTab, selectedClient);
        } catch (err) {
            console.error("Failed to fetch jobs", err);
            setError("Failed to load jobs. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    // NEW: fetch clients from dedicated API, called only when "Add Job" is pressed
    async function handleOpenAddJob() {
        setClientsLoading(true);
        try {
            const data: Client[] = await clientApi.getClient(); // ← your getClients endpoint
            setClientList(data);
        } catch (err) {
            console.error("Failed to fetch clients", err);
            setClientList([]); // fallback to empty; modal handles the empty state
        } finally {
            setClientsLoading(false);
        }
        setOpen(true);
    }

    function applyFilters(source: Job[], tab: Job["job_status"], client: string) {
        const byStatus = source.filter((job) => job.job_status === tab);
        setFilteredJobs(
            client === "All"
                ? byStatus
                : byStatus.filter((job) => job.client_name === client)  // ← was client_id
        );
    }

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleTabChange = (tab: Job["job_status"]) => {
        setActiveTab(tab);
        applyFilters(jobs, tab, selectedClient);
    };

    const handleClientChange = (client: string) => {
        setSelectedClient(client);
        applyFilters(jobs, activeTab, client);
    };

    const handleJobCreated = () => {
        setOpen(false);
        fetchJobs();
    };

    const handleJobDeleted = (deletedId: number) => {
        const updated = jobs.filter((job) => job.job_id !== deletedId);
        setJobs(updated);
        applyFilters(updated, activeTab, selectedClient);
    };

    const tabs: { label: string; value: Job["job_status"] }[] = [
        { label: "Active", value: "open" },
        { label: "Inactive", value: "Closed" },
    ];

    const clients: string[] = [
        "All",
        ...Array.from(new Set(jobs.map((job) => job.client_name).filter(Boolean))),  // ← was client_id
    ];

    return (
        <div className="w-full min-h-screen bg-sky-50 p-8">

            {/* Tabs */}
            <div className="flex items-end justify-between border-b border-gray-300 mb-6">
                <div className="flex space-x-8 text-lg font-semibold">
                    {tabs.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => handleTabChange(tab.value)}
                            className={`pb-4 ${activeTab === tab.value
                                ? "border-b-2 border-blue-600 text-blue-600"
                                : "text-gray-500"
                                }`}
                        >
                            {tab.label.toUpperCase()} JOBS
                        </button>
                    ))}
                </div>

                <div className="pb-3">
                    {/* CHANGED: onClick now calls handleOpenAddJob instead of setOpen(true) */}
                    <button
                        onClick={handleOpenAddJob}
                        disabled={clientsLoading}
                        className="flex items-center gap-2 bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-wait disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                    >
                        <span className="text-lg">+</span>
                        {clientsLoading ? "Loading…" : "Add Job"}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col mt-8 md:flex-row justify-left gap-16 items-start md:items-center my-6">
                <h2 className="text-2xl text-gray-800 mb-4 md:mb-0">
                    {filteredJobs.length}{" "}
                    {activeTab === "open" ? "Open" : "Closed"} Jobs
                </h2>

                <div className="flex items-center space-x-4 text-sm">
                    <span className="font-semibold">Filter by Client:</span>
                    <select
                        className="p-2 rounded-md border border-gray-300"
                        value={selectedClient}
                        onChange={(e) => handleClientChange(e.target.value)}
                    >
                        {clients.map((client, index) => (
                            <option key={`${client}-${index}`} value={client}>
                                {client}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* States */}
            {!loading && !error && filteredJobs.length === 0 && (
                <div className="text-center text-gray-400 py-20">
                    No {activeTab} jobs found.   {/* ← says "No close jobs found" */}
                </div>
            )}

            {!loading && !error && filteredJobs.length === 0 && (
                <div className="text-center text-gray-400 py-20">
                    No {activeTab === "open" ? "active" : "inactive"} jobs found.
                </div>
            )}

            {/* Job Cards */}
            {!loading && !error && (
                <div className="grid mt-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {filteredJobs.map((job) => (
                        <JobCard
                            key={job.job_id}
                            job={job}
                            onDeleted={handleJobDeleted}
                        />
                    ))}
                </div>
            )}

            {/* CHANGED: pass clientList (from getClients API) instead of deriving from jobs */}
            {open && (
                // Pass directly — no .map() needed anymore
                <AddJobModal
                    onClose={() => setOpen(false)}
                    onSuccess={handleJobCreated}
                    existingClients={clientList}
                />
            )}
        </div>
    );
};

export default JobsPage;