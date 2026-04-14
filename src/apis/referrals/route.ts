import { backendApi } from "@/lib/backendApi";
import { mapParsedResumeToForm } from "@/lib/types/ReferalTypes/MapParsedResume";
import { ReferralFormData } from "@/lib/types/ReferalTypes/referalindex";

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