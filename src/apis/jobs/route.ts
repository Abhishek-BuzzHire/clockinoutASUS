import { backendApi } from "@/lib/backendApi";
import { Job } from "@/lib/types/jobs";
import { JobPipelinePayload, PipelineStage } from "@/lib/types/jobs";

export type Skill = { id: number; name: string };

export const jobsApi = {

    async getJobs(): Promise<Job[]> {
        const res = await backendApi.get("/api/jobs/jobs/");
        return res.data;
    },

    async getJobById(id: number): Promise<Job> {
        const res = await backendApi.get(`/api/jobs/jobs/${id}/`);
        return res.data;
    },

    async createJob(data: Partial<Job>): Promise<Job> {
        const res = await backendApi.post("/api/jobs/jobs/", data);
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
        const res = await backendApi.get(`/api/jobs/skills/?q=${encodeURIComponent(query)}`);
        return res.data.map((s: { skill_id: number; skill_name: string }) => ({
            id: s.skill_id,
            name: s.skill_name,
        }));
    },

    // ── Pipeline ──────────────────────────────────────────────────────────

    async getPipeline(jobId: number): Promise<JobPipelinePayload> {
        const res = await backendApi.get(`/api/jobs/jobs/${jobId}/pipeline/`);
        return res.data;
    },

    /**
     * Builds the correct payload from a raw stage name list:
     *  - assigns order = index
     *  - marks is_final = true only on the last stage
     * Then POSTs to the backend.
     */
    async savePipeline(jobId: number, stageNames: string[]): Promise<JobPipelinePayload> {
        const stages: PipelineStage[] = stageNames.map((name, index) => ({
            name,
            order: index,
            is_final: index === stageNames.length - 1,
        }));

        const payload: JobPipelinePayload = { job_id: jobId, stages };

        const res = await backendApi.post(`/api/jobs/jobs/${jobId}/pipeline/`, payload);
        return res.data;
    },

    async updatePipeline(jobId: number, stageNames: string[]): Promise<JobPipelinePayload> {
        const stages: PipelineStage[] = stageNames.map((name, index) => ({
            name,
            order: index,
            is_final: index === stageNames.length - 1,
        }));

        const payload: JobPipelinePayload = { job_id: jobId, stages };

        const res = await backendApi.patch(`/api/jobs/jobs/${jobId}/pipeline/`, payload);
        return res.data;
    },

    async deletePipeline(jobId: number): Promise<void> {
        await backendApi.delete(`/api/jobs/jobs/${jobId}/pipeline/`);
    },
};