"use client";

import { candidateApi } from "@/apis/candidates/routes";
import CandidateTable from "@/components/jobs/CandidateTable";
import Pagination from "@/components/Pagination";
import { Candidate } from "@/lib/types/jobs";
import { stagesData, mapApiToCandidate } from "@/lib/types/ReferalTypes/MapParsedResume";
import Image from "next/image";
import { useEffect, useState } from "react";


export default function TotalCandidates() {
    const [data, setData] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const stages = stagesData;

    const fetchCandidates = async () => {
        try {
            setLoading(true);

            const response = await candidateApi.getCandidates();
            console.log("apiData", response);


            const raw: any[] = Array.isArray(response)
                ? response.flatMap((item: any) =>
                    Array.isArray(item?.profiles) ? item.profiles : [item]
                )
                : response?.profiles ?? (response ? [response] : []);

            console.log("raw candidates", raw);

            const mapped = raw.map(mapApiToCandidate);
            console.log("mapped candidates", mapped);

            setData(mapped);
        } catch (err) {
            console.error("Failed to fetch candidates:", err);
            setError("Failed to load candidates.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, []);


    if (loading) {
        return (
            <div className="w-full h-screen bg-blueLight-50 flex items-center justify-center">
                Loading candidates...
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-screen bg-blueLight-50 flex items-center justify-center text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-blueLight-50 p-8">
            <div className="flex items-center w-full mb-4 justify-between">
                <div className="flex items-center gap-8">
                    <div className="text-2xl text-gray-900">
                        {data.length} Candidates
                    </div>

                    <button className="flex justify-between gap-2 text-sm bg-white py-2 rounded-md px-6">
                        <Image
                            src="/filter.png"
                            alt="filter"
                            width={16}
                            height={16}
                        />
                        Filter
                    </button>
                </div>
            </div>

            <CandidateTable data={data} stages={stages} />
            <Pagination />
        </div>
    );
}