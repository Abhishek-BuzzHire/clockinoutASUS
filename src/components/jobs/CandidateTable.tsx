import { Candidate } from "@/lib/types/jobs";
import Image from "next/image";
import { useState } from "react";
import Candidature from "./Candidature";
import Table from "../Table";

const columns = [
    {
        header: "Candidate Name",
        accessor: "name",
        className: "p-6"
    },
    {
        header: "Candidate Id",
        accessor: "id",
        className: "hidden md:table-cell"
    },
    {
        header: "Pipeline Stage",
        accessor: "pipelineStatus",
        className: "hidden md:table-cell"
    },
    {
        header: "Applied On",
        accessor: "dateApplied",
        className: "hidden md:table-cell"
    },
    {
        header: "Owner",
        accessor: "owner",
        className: ""
    }
]

const colors = ['orange-500', 'yellow-400', 'blue-500', "error-500", 'teal-500', 'green-500', "purple-500", "indigo-500"];

const renderRow = ({ item, stages, onRowClick }: { item: Candidate, stages?: string[], onRowClick?: (candidate: Candidate) => void; }) => {
    const stageIndex = stages ? stages.indexOf(item.pipelineStatus) : -1;
    const stageColor = stageIndex >= 0 ? colors[stageIndex % colors.length] : undefined;
    return (
        <tr key={item.id} className="border-b-2 font-semibold border-gray-200 bg-white text-sm hover:bg-sky-50 cursor-pointer" onClick={() => onRowClick?.(item)}>
            <td className="flex items-center gap-4 p-4">
                <Image src={item.photo} alt={item.name} width={40} height={40} className="md:hidden xl:block w-10 h-10 rounded-full object-cover" />
                <h3>{item.name}</h3>
            </td>
            <td className="hidden md:table-cell">{item.id}</td>
            <td className="hidden md:table-cell">
                {
                    stages ? (
                        <>
                            <p className="mb-2">{item.pipelineStatus}</p>
                            <div className="flex gap-1 mb-2">
                                {stages.map((_, index) => {
                                    const isActive = index <= stageIndex;
                                    return (
                                        <div
                                            key={index}
                                            className={`w-6 h-6 flex items-center justify-center rounded-sm text-xs font-bold 
                  ${isActive ? `bg-${stageColor} text-white` : "bg-gray-200 text-gray-400"}`}
                                        >
                                            {index + 1}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <p>Applied</p>
                    )
                }
            </td>
            <td className="hidden md:table-cell">{new Date(item.dateApplied).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            })}</td>
            <td className="hidden md:table-cell">Me</td>
        </tr>
    )
}

const CandidateTable = ({ data, stages }: { data: Candidate[], stages?: string[] }) => {
    const [profileView, setProfileView] = useState<Candidate | null>(null);
    return (
        <>
            <Table columns={columns} data={data} renderRow={(item) => renderRow({ item, stages, onRowClick: (candidate) => setProfileView(candidate) })} />
            <div
                className={`fixed overflow-y-auto top-0 right-0 h-full w-full md:w-1/2 bg-white shadow-lg z-50 transform transition-transform duration-300 ${profileView ? "translate-x-0" : "translate-x-full"
                    }`}>
                <button
                    className="absolute top-2 right-4 text-gray-500 hover:text-black"
                    onClick={() => setProfileView(null)}>
                    ✕
                </button>
                {profileView && (
                    <Candidature data={profileView} stages={stages} />
                )}
            </div>
            {profileView && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={() => setProfileView(null)} />
            )}
        </>
    )
}

export default CandidateTable;