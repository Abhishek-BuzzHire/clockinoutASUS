"use client"

import CandidatePipeline from "@/components/jobs/CandidatePipeline"
import CandidateTable from "@/components/jobs/CandidateTable"
import Pagination from "@/components/Pagination"
import Pipeline from "@/components/dashboard/Pipeline"
import { candidateJobData, stagesData } from "@/lib/types/jobdata"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

const data = candidateJobData;
const stages = stagesData;

const SingleJobPage = () => {
    const tabs = ['Candidates', 'Job Detail', 'Hiring Pipeline', 'Settings']
    const [activeTab, setActiveTab] = useState('Candidates');
    const router = useRouter();
    type ViewType = 'pipeline' | 'table';
    const [view, setView] = useState<ViewType>('pipeline')
    const [status, setStatus] = useState("Published");
    const [open, setOpen] = useState(false);



    const renderContent = () => {
        switch (activeTab) {
            case 'Candidates':
                return (
                    <div>
                        <div className="flex justify-between">
                            <div className="my-8 text-md font-bold">
                                Total Candidates: <span className="ml-2 p-1 bg-blue-600 text-white rounded-md">{data.length}</span>
                            </div>
                            <div className="inline-flex font-semibold rounded-md shadow-sm border border-gray-300 overflow-hidden my-8">
                                {/* Pipeline Button */}
                                <button
                                    onClick={() => setView("pipeline")}
                                    className={`px-4 text-sm focus:outline-none transition-colors duration-200 ease-in-out
                                            ${view === "pipeline"
                                            ? "bg-white text-gray-900"
                                            : "bg-gray-300 text-gray-500 hover:bg-gray-200"
                                        }`}
                                >
                                    Pipeline View
                                </button>

                                {/* Table Button */}
                                <button
                                    onClick={() => setView("table")}
                                    className={`px-4 text-sm focus:outline-none transition-colors duration-200 ease-in-out
                                            ${view === "table"
                                            ? "bg-white text-gray-900"
                                            : "bg-gray-300 text-gray-500 hover:bg-gray-200"
                                        }`}
                                >
                                    Table View
                                </button>
                            </div>
                        </div>
                        {view === 'pipeline' && (
                            <CandidatePipeline data={data} stages={stages} />
                        )}
                        {view === 'table' && (
                            <>
                                <CandidateTable data={data} stages={stages} />
                                <Pagination />
                            </>
                        )}
                    </div>
                );

            case "Job Detail":
                return (
                    <div className="mt-6 bg-white p-6 rounded-2xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Job Details</h2>
                    </div>
                );
            case 'Hiring Pipeline':
                return <Pipeline />
            case 'Settings':
                return (
                    <div className="mt-6 bg-white p-6 rounded-2xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Settings</h2>
                        <p>Settings content goes here.</p>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="w-full bg-sky-50 p-8 relative">
            <div className="text-lg">
                <div className="flex items-center justify-between w-full mb-6">
                    {/* Left section */}
                    <div className="flex items-center space-x-4">
                        {/* Back button */}
                        <div className="bg-white mr-4 rounded-full p-2 shadow hover:cursor-pointer" onClick={() => router.back()}>
                            <Image src="/chev-left.png" alt="Back" width={24} height={24} />
                        </div>

                        {/* Job info */}
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-400">Client Name</p>
                            <h3 className="text-2xl text-gray-900">Senior Product Designer</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                                <span>Location</span>
                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                <span>Full time</span>
                            </div>
                        </div>
                    </div>

                    {/* Right section */}

                    <div className="relative flex items-center space-x-2">
                        <button
                            onClick={() => setOpen(!open)}
                            className="flex bg-indigo-600 text-white rounded-md px-4 py-2 text-sm items-center"
                        >
                            {status}
                            <Image
                                src={"/chev-down.png"}
                                alt=""
                                width={20}
                                height={20}
                                className="invert brightness-0 ml-2"
                            />
                        </button>

                        {open && (
                            <div className="absolute top-10 left-0 bg-white border rounded-md shadow-md w-32 z-50">
                                <button
                                    onClick={() => {
                                        setStatus("Active");
                                        setOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                    Active
                                </button>

                                <button
                                    onClick={() => {
                                        setStatus("Inactive");
                                        setOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                    Inactive
                                </button>
                                <button
                                    onClick={() => {
                                        setStatus("Draft");
                                        setOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                    Draft
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex space-x-8 text-xs font-bold border-b border-gray-300 mb-6">
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`p-2 ${activeTab === tab ? "border-b-2 border-blue-600" : "text-gray-500"}`}>
                            {tab.toUpperCase()}
                        </button>
                    ))}
                </div>
                {renderContent()}
            </div>
        </div>
    )
}

export default SingleJobPage