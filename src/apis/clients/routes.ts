import { backendApi } from "@/lib/backendApi";

export const clientApi = {

    async getClient() {
        const res = await backendApi.get("/api/jobs/clients/");
        return res.data;
    },

    async getClientById(id:  number) {
        const res = await backendApi.get(`/api/jobs/clients/${id}/`);
        return res.data;
    },

    async createClient(data: any) {
        const res = await backendApi.post("/api/jobs/clients", data);
        return res.data;
    },

    async deleteClient(id: number) {
        const res = await backendApi.delete(`/api/jobs/clients/${id}/`);
        return res.data;
    }

};