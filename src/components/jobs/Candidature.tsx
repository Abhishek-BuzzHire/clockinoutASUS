// This is the candidate details from the right window half menu
// along with genral props, "stages" should also be passed here.
"use clients"
import { Candidate } from "@/lib/types/jobs";
import Image from "next/image"
import { useState } from "react";
import dynamic from "next/dynamic";

const PdfView = dynamic(() => import("./PdfView"), {
    ssr: false,
});

const colors = ['orange-500', 'yellow-400', 'blue-500', "red-500", 'teal-500', 'green-500', "purple-500", "indigo-500"];

const Candidature = ({ data, stages }: { data: Candidate, stages?: string[] }) => {
    const [activeTab, setActiveTab] = useState("Details")

    const stageIndex = stages ? stages.indexOf(data.pipelineStatus) : -1;
    const stageColor = stageIndex >= 0 ? colors[stageIndex % colors.length] : undefined;

    const renderContent = () => {
        switch (activeTab) {
            case 'Details':
                return (
                    <div className="">
                        <div className="bg-white rounded-lg shadow-md mt-6 border-2">
                            <div className="flex justify-between p-8 py-4 items-center border-b-2 border-gray-200">
                                <h2 className="text-md font-semibold text-gray-600">Basic Information</h2>
                                <button className="flex items-center text-sm font-semibold text-blue-600">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    Edit Info
                                </button>
                            </div>
                            <div className="p-8 text-xs font-semibold grid grid-cols-1 md:grid-cols-2  gap-y-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-gray-500">Name</span>
                                    <span className=" text-sm">{data.name}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-gray-500">Email</span>
                                    <span className=" text-sm">{data.email}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-gray-500">Sourced by</span>
                                    <span className=" text-sm">{data.sourcedBy}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-gray-500">Phone</span>
                                    <span className=" text-sm">{data.phone}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-gray-500">Candidate ID</span>
                                    <span className=" text-sm">{data.id}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-gray-500">Applied Data</span>
                                    <span className=" text-sm">{new Date(data.dateApplied).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-gray-500">Location</span>
                                    <span className=" text-sm">{data.location}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-md mt-6 border-2">
                            <div className="flex justify-between p-8 py-4 items-center border-b-2 border-gray-200">
                                <h2 className="text-md font-semibold text-gray-600">Professional Information</h2>
                                <button className="flex items-center text-sm font-semibold text-blue-600">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    Edit Info
                                </button>
                            </div>
                            <div className="p-8 text-xs font-semibold grid grid-cols-1 md:grid-cols-2  gap-y-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-gray-500">Current Job Title</span>
                                    <span className=" text-sm">{data.currentJob}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-gray-500">Highest Qualification Held</span>
                                    <span className=" text-sm">{data.education}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-gray-500">Expected Salary</span>
                                    <span className=" text-sm">$000000</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-gray-500">Current Salary</span>
                                    <span className=" text-sm">{data.currentCTC}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-gray-500">Experience in Years</span>
                                    <span className=" text-sm">{data.experience}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-gray-500">Skill Set</span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {data.skills.map((skill: any, index: number) => (
                                            <span
                                                key={skill.id ?? `${skill.skill_name}-${index}`}
                                                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full"
                                            >
                                                {skill.skill_name ?? skill.name ?? skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case 'Resume':
                return (
                    <div className="mt-6 bg-white">
                        <h2 className="text-sm font-semibold mb-4">{data.name}_Resume.pdf</h2>
                        <PdfView fileUrl="/pdf.pdf" />
                    </div>
                );
            case 'Hiring Pipeline':
                return (
                    <div className="mt-6 bg-white p-6 rounded-md shadow-md">
                        <h2 className="text-lg font-bold mb-4">Hiring Pipeline</h2>
                    </div>
                );
            case 'Interviews':
                return (
                    <div className="mt-6 bg-white p-6 rounded-md shadow-md">
                        <h2 className="text-lg font-bold mb-4">Interviews</h2>
                    </div>
                );
            default:
                return null;
        }
    }

    const tabs = ['Details', 'Resume', 'Hiring Pipeline', 'Interviews'];

    return (
        <div className="w-full min-h-screen bg-white ">
            {/* Header Section */}
            <div className="flex p-6 flex-col sm:flex-row justify-between items-center bg-sky-50">
                <div className="flex items-center space-x-4">
                    <Image src={data.photo} alt="" width={72} height={72} className="rounded-full" />
                    <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold">{data.name}</h1>
                            <span className="bg-success-100 text-green-800 text-xs border-2 border-success-300 font-semibold px-2.5 py-0.5 rounded-sm">
                                Active
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm">{data.currentJob + " @ " + data.currentCompany}</p>
                        {
                            stages ? (
                                <div className="flex gap-2">
                                    <div className="flex gap-1">
                                        {stages.map((_, index) => {
                                            const isActive = index <= stageIndex;
                                            return (
                                                <div
                                                    key={index}
                                                    className={`w-4 h-4 flex items-center justify-center rounded-sm text-xs font-bold 
                    ${isActive ? `bg-${stageColor} text-white` : "bg-gray-200 text-gray-400"}`}
                                                >
                                                    {index + 1}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="text-xs text-gray-500 font-semibold">{data.pipelineStatus}</p>
                                </div>
                            ) : (
                                <p>Applied</p>
                            )
                        }
                    </div>
                </div>
                <div className="flex items-center space-x-4 mt-4 sm:mt-0 text-gray-500">
                    <button className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-white hover:bg-gray-200">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-white hover:bg-gray-200">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    <button className="flex items-center space-x-2 p-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">Send Message</span>
                    </button>
                    <button className="flex items-center space-x-2 p-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">Send Email</span>
                    </button>
                </div>
            </div>
            <div className="bg-white p-8">
                <div className="flex space-x-8 text-sm font-bold border-b border-gray-300 mb-6">
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-4 ${activeTab === tab ? "border-b-2 border-blue-600" : "text-gray-500"}`}>
                            {tab.toUpperCase()}
                        </button>
                    ))}
                </div>
                {renderContent()}
            </div>
        </div>
    )
}

export default Candidature