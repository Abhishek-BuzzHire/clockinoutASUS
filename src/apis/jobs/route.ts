import { backendApi } from "@/lib/backendApi";
import { EditPipelinePayload, Job, PipelineSavePayload} from "@/lib/types/jobs";
import { Skill } from "@/lib/types/jobs";

export const jobsApi = {

    async getJobs(): Promise<Job[]> {
        const res = await backendApi.get("/api/jobs/jobs/");
        return res.data;
    },

    async getJobById(id: number): Promise<Job> {
        const res = await backendApi.get(`/api/jobs/jobs/${id}/`);
        console.log(res);
        return res.data;
    },
    async getJobPipelineCandidate(id: number): Promise<Job> {
        const res = await backendApi.get(`/api/jobs/jobs/${id}/board`);
        console.log(res);
        return res.data;
    },
async createJob(data: Partial<Job>): Promise<Job> {
    try {
        console.log("Sending payload:", JSON.stringify(data, null, 2));
        const res = await backendApi.post("/api/jobs/jobs/", data);
        return res.data;
    } catch (err: any) {
        console.error("Status:", err.response?.status);
        console.error("Data:", err.response?.data);
        console.error("Headers:", err.response?.headers);
        throw err;
    }
},
    async updateJob(id: number, data: Partial<Job>): Promise<Job> {
        const res = await backendApi.patch(`/api/jobs/jobs/${id}/`, data);
        return res.data;
    },

    async updateJobStatus(id: number, status: Job["job_status"]): Promise<Job> {
        const res = await backendApi.patch(`/api/jobs/jobs/${id}/`, { job_status: status });
        return res.data;
    },

    async deleteJob(id: number): Promise<void> {
        await backendApi.delete(`/api/jobs/jobs/${id}/`);
    },

    async searchSkills(query: string): Promise<Skill[]> {
    const res = await backendApi.get(`/api/skills/?q=${encodeURIComponent(query)}`);
    return res.data.map((s: { skill_id: number; skill_name: string }) => ({
        skill_id: s.skill_id,   // was: id: s.skill_id  ← wrong key
        skill_name: s.skill_name, // was: name: s.skill_name ← wrong key
    }));
},

    // ── Pipeline ──────────────────────────────────────────────────────────

    async getPipeline(jobId: number): Promise<EditPipelinePayload> {
        const res = await backendApi.get(`/api/jobs/jobs/${jobId}/pipeline/`);
        return res.data;
    },

   async savePipeline(payload: PipelineSavePayload): Promise<EditPipelinePayload> {
    console.log("🚀 Sending to backend:", JSON.stringify(payload, null, 2));
    const res = await backendApi.post(
        `/api/jobs/jobs/${payload.job_id}/pipeline/`,
        payload  // ← must be payload directly, NOT { payload } or { data: payload }
    );
    console.log("✅ Backend response:", res.data);
    return res.data;
},

async updatePipeline(payload: EditPipelinePayload): Promise<EditPipelinePayload> {
    const res = await backendApi.patch(
        `/api/jobs/pipelines/${payload.pipeline_id}/`,
        payload
    );
    return res.data;
},

    async deletePipeline(jobId: number): Promise<void> {
        await backendApi.delete(`/api/jobs/pipeline/`);
    },
};