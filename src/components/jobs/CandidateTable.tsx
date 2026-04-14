"use client";

import { Candidate } from "@/lib/types/jobs";
import Image from "next/image";
import { useState } from "react";
import Candidature from "./Candidature";
import Table from "@/components/jobs/Table";

const columns = [
    {
        header: "Candidate Name",
        accessor: "name",
        className: "p-6",
    },
    {
        header: "Candidate Id",
        accessor: "id",
        className: "hidden md:table-cell",
    },
    {
        header: "Pipeline Stage",
        accessor: "pipelineStatus",
        className: "hidden md:table-cell",
    },
    {
        header: "Applied On",
        accessor: "dateApplied",
        className: "hidden md:table-cell",
    },
    {
        header: "Owner",
        accessor: "owner",
        className: "",
    },
];

const colors = [
    "bg-orange-500",
    "bg-yellow-400",
    "bg-blue-500",
    "bg-red-500",
    "bg-teal-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-indigo-500",
];

const renderRow = ({
    item,
    stages,
    onRowClick,
}: {
    item: Candidate;
    stages?: string[];
    onRowClick?: (candidate: Candidate) => void;
}) => {
    const stageIndex = stages ? stages.indexOf(item.pipelineStatus) : -1;
    const stageColor =
        stageIndex >= 0 ? colors[stageIndex % colors.length] : "bg-gray-300";

    return (
        <tr
            key={item.id}
            className="font-semibold bg-white text-sm hover:bg-sky-50 cursor-pointer"
            onClick={() => onRowClick?.(item)}
        >
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                        {item.name?.charAt(0)?.toUpperCase() || "C"}
                    </div>

                    <div className="flex flex-col">
                        <span className="font-medium text-gray-800">
                            {item.name}
                        </span>
                        <span className="text-xs text-gray-500">
                            Candidate
                        </span>
                    </div>
                </div>
            </td>

            <td className="hidden md:table-cell">{item.id}</td>

            <td className="hidden md:table-cell">
                <p className="mb-2">{item.pipelineStatus}</p>
                {stages && (
                    <div className="flex gap-1 mb-2">
                        {stages.map((_, index) => {
                            const isActive = index <= stageIndex;

                            return (
                                <div
                                    key={index}
                                    className={`w-6 h-6 flex items-center justify-center rounded-sm text-xs font-bold ${isActive
                                        ? `${stageColor} text-white`
                                        : "bg-gray-200 text-gray-400"
                                        }`}
                                >
                                    {index + 1}
                                </div>
                            );
                        })}
                    </div>
                )}
            </td>

            <td className="hidden md:table-cell">
                {item.dateApplied
                    ? new Date(item.dateApplied).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })
                    : "N/A"}
            </td>

            <td className="hidden md:table-cell">Me</td>
        </tr>
    );
};

const CandidateTable = ({
    data,
    stages,
}: {
    data: Candidate[];
    stages?: string[];
}) => {
    const [profileView, setProfileView] = useState<Candidate | null>(null);

    return (
        <>
            <Table
                columns={columns}
                data={data}
                renderRow={(item) =>
                    renderRow({
                        item,
                        stages,
                        onRowClick: (candidate) =>
                            setProfileView(candidate),
                    })
                }
            />

            <div
                className={`fixed overflow-y-auto top-0 right-0 h-full w-full md:w-1/2 bg-white shadow-lg z-50 transform transition-transform duration-300 ${profileView
                    ? "translate-x-0"
                    : "translate-x-full"
                    }`}
            >
                <button
                    className="absolute top-2 right-4 text-gray-500 hover:text-black"
                    onClick={() => setProfileView(null)}
                >
                    ✕
                </button>

                {profileView && (
                    <Candidature
                        data={profileView}
                        stages={stages}
                    />
                )}
            </div>

            {profileView && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={() => setProfileView(null)}
                />
            )}
        </>
    );
};

export default CandidateTable;