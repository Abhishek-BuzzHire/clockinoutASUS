import { backendApi } from "@/lib/backendApi";
import { ClientPayload, ContactPayload } from "@/lib/types/jobs";

export const clientApi = {

    async getClient() {
        const res = await backendApi.get("/api/jobs/clients/");
        return res.data;
    },

    async getClientById(id: number) {
        const res = await backendApi.get(`/api/jobs/clients/${id}/`);
        return res.data;
    },

    async getClientContacts(clientId: number) {
        const res = await backendApi.get(`/api/jobs/clients/${clientId}/contact/`);
        return res.data;
    },

    async getClientHRs(clientId: number) {
        const res = await backendApi.get(`/api/jobs/clients/${clientId}/hrs/`);
        return res.data;
    },

    async createClient(data: ClientPayload) {
        const res = await backendApi.post("/api/jobs/clients/", data);
        return res.data;
    },

    async deleteClient(id: number) {
        const res = await backendApi.delete(`/api/jobs/clients/${id}/`);
        return res.data;
    },

    async createContact(data: ContactPayload) {
        try {
            const res = await backendApi.post(`/api/jobs/clients/${data.client_id}/contact/`, data);
            return res.data;
        } catch (error: any) {
            console.error("Create contact failed:");
            console.error("Payload sent:", data);
            console.error("Status:", error.response?.status);
            console.error("Backend error:", error.response?.data);
            throw error;
        }
    },
};