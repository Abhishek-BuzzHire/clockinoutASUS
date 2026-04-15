"use client";
import { referralApi } from "@/apis/referrals/route";
import Pagination from "@/components/Pagination";
import { Candidate } from "@/lib/types/jobs";
import { mapApiToCandidate, stagesData } from "@/lib/types/ReferalTypes/MapParsedResume";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CandidateTable from "@/components/jobs/CandidateTable";


export default function AddReferralSection() {
    const router = useRouter();
    const [data, setData] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const stages = stagesData;

    const fetchCandidates = async () => {
        try {
            setLoading(true);

            const response = await referralApi.getReferrals();
            console.log("apiData", response);

            // Response is Array(1) where [0] has { count, data: [...], message }
            const raw: any[] = Array.isArray(response)
                ? response.flatMap((item: any) =>
                    Array.isArray(item?.data) ? item.data : []
                )
                : response?.data ?? [];

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

    const handleAddCandidate = () => {
        router.push("/list/referrals/addReferral");
    };

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

                <button
                    onClick={handleAddCandidate}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                    Add a Candidate
                </button>
            </div>

            <CandidateTable data={data} stages={stages} />
            <Pagination />
        </div>
    );
}