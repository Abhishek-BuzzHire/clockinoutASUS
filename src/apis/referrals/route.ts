import { backendApi } from "@/lib/backendApi";
import { mapParsedResumeToForm } from "@/lib/types/ReferalTypes/MapParsedResume";
import { ReferralFormData } from "@/lib/types/ReferalTypes/referalindex";
import Cookies from "js-cookie";

const token = Cookies.get("access");


export const uploadAndParseRefResume = async (file: File): Promise<Partial<ReferralFormData>> => {
    const formData = new FormData();
    formData.append("resume_file", file, file.name);

    try {
        const response = await backendApi.post("/api/referrals/resume/parse/", formData);
        const raw = response.data?.data ?? response.data;
        console.log("[uploadAndParseResume] API response:", raw);
        return mapParsedResumeToForm(raw);
    } catch (error: any) {
        console.error("[uploadAndParseResume] error:", error.response?.data);
        throw error;
    }
};

export const submitReferral = async (data: ReferralFormData): Promise<void> => {
    await backendApi.post("/api/referrals/", data);
};

export const referralApi = {

    async getReferrals() {
        const response = await backendApi.get("/api/referrals/");
        console.log("[referralApi.getReferrals] response:", response.data);
        return response.data;
    },
     
    async addToJob(payload: { candidateId: string; jobId: string }) {
        try {
            const response = await backendApi.post(
                "/api/jobs/applications/",
            {
                candidate_id: payload.candidateId,
                job_id: payload.jobId,
                application_status: "Applied",
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log("[referralApi.addToJob] response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error(
            "[referralApi.addToJob] error:",
            error?.response?.data || error.message
        );
        throw error;
    }
},

async removeReferral(candidateId: string) {
    const response = await fetch(`/api/jobs/applications/${candidateId}/`, {
        method: "DELETE",
    });
    return response.json();
}


};
