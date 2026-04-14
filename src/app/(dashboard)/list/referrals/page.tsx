"use client";

import { candidateApi } from "@/apis/candidates/routes";
import CandidateTable from "@/components/jobs/CandidateTable";
import Pagination from "@/components/Pagination";
import { stagesData } from "@/lib/types/jobdata";
import { Candidate } from "@/lib/types/jobs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function mapApiToCandidate(raw: any): Candidate {
    return {
        id: String(raw?.id ?? ""),
        name: raw?.full_name ?? "Unknown",
        email: raw?.primary_email ?? "",
        phone: raw?.primary_phone ?? "",
        photo: raw?.photo || "/avatar.png",
        currentJob: raw?.current_designation ?? "",
        currentCompany: raw?.headline ?? "",
        currentCTC: raw?.current_salary_amount
            ? `${raw?.salary_currency ?? ""} ${raw.current_salary_amount}`
            : "N/A",
        education: raw?.education ?? "N/A",
        experience:
            raw?.total_experience_months != null
                ? `${Math.floor(raw.total_experience_months / 12)} yrs ${raw.total_experience_months % 12
                } mo`
                : "N/A",
        location: raw?.location
            ? [
                raw.location?.city,
                raw.location?.state,
                raw.location?.country,
            ]
                .filter(Boolean)
                .join(", ")
            : "N/A",
        skills: Array.isArray(raw?.skills)
            ? raw.skills.map((s: any) => s?.name ?? s)
            : [],
        sourcedBy: raw?.sourced_by ?? "N/A",
        dateApplied: raw?.created_at ?? null,
        pipelineStatus:
            typeof raw?.pipeline_status === "string"
                ? raw.pipeline_status
                : raw?.pipeline_status?.name ?? stagesData[0],
    };
}

export default function AddReferralSection() {
    const router = useRouter();
    const [data, setData] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const stages = stagesData;

    const fetchCandidates = async () => {
        try {
            setLoading(true);

            const response = await candidateApi.getCandidates();
            console.log("apiData", response);

            // API give single object OR array — me handle both
            // AFTER
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