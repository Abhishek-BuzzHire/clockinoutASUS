import { Candidate } from "@/lib/types/jobs";
import Image from "next/image";
import { useState } from "react";
import Candidature from "./Candidature";

const colors = ['orange-500', 'yellow-400', 'blue-500', "red-500", 'teal-500', 'green-500', "purple-500", "indigo-500"];

function daysAgo(dateString: string): number {
    const inputDate = new Date(dateString);
    const today = new Date();
    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffMs: number = today.getTime() - inputDate.getTime();
    const diffDays: number = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
}

const CandidatePipeline = ({ data, stages }: { data: Candidate[], stages: string[] }) => {
    const [profileView, setProfileView] = useState<Candidate | null>(null);
    const pipeline = stages.map((stage) => ({
        name: stage,
        candidates: data.filter((c) => c.pipelineStatus == stage)
    }))

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {pipeline.map((stage, index) => {
                    const stageColor = colors[index % colors.length];
                    return (
                        <div key={stage.name ?? index} className="border-r-2 border-gray-200 pr-4">
                            <div className={`flex justify-between p-4 mb-4 bg-gray-50 text-sm rounded-lg shadow-md font-bold border-t-4 border-${stageColor || "gray-500"}`}>
                                {stage.name}
                                <div className="bg-gray-200 font-semibold px-2 rounded-md">
                                    {stage.candidates.length}
                                </div>
                            </div>
                            <div className="overflow-y-auto max-h-[650px] scrollbar-hide">
                                {stage.candidates.map(candidate => (
                                    <div key={candidate.id} className="p-4 bg-white mb-4 shadow-lg rounded-md hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setProfileView(candidate)}>
                                        <div className="flex text-sm text-gray-700 font-semibold items-center">
                                            <Image src={candidate.photo} alt={candidate.name} width={36} height={36} className="rounded-full mr-4" />
                                            {candidate.name}
                                        </div>
                                        <p className="text-gray-400 mt-2 font-semibold text-center text-xs">
                                            {daysAgo(new Date(candidate.dateApplied).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            }))} days ago
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
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

export default CandidatePipeline