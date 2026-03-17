import { backendApi } from "@/lib/backendApi";
import { Job } from "@/lib/types/jobs";

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
};