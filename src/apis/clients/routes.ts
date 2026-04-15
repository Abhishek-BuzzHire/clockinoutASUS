import { backendApi } from "@/lib/backendApi";
import { ClientPayload, ContactPayload } from "@/lib/types/jobs";

export const clientApi = {

    // ─── CLIENTS ─────────────────────────────────────────────
    async getClient() {
        const res = await backendApi.get("/api/jobs/clients/");
        return res.data;
    },

    async getClientById(id: number) {
        const res = await backendApi.get(`/api/jobs/clients/${id}/`);
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

    // ─── CONTACTS (nested + resource-based) ───────────────────
    async getClientContacts(clientId: number) {
        const res = await backendApi.get(`/api/jobs/clients/${clientId}/contact/`);
        return res.data;
    },

    async createContact(data: ContactPayload) {
        const res = await backendApi.post(
            `/api/jobs/clients/${data.client_id}/contact/`,
            data
        );
        return res.data;
    },

    // ✅ NEW → noun-based update/delete
    async updateContact(contactId: number, data: Partial<ContactPayload>) {
        const res = await backendApi.patch(`/api/contacts/${contactId}`, data);
        return res.data;
    },

    async deleteContact(contactId: number) {
        const res = await backendApi.delete(`/api/contacts/${contactId}`);
        return res.data;
    },

    // ─── HRs (nested + resource-based) ────────────────────────
    async getClientHRs(clientId: number) {
        const res = await backendApi.get(`/api/jobs/clients/${clientId}/hrs/`);
        return res.data;
    },

    async createClientHRs(
        clientId: number,
        data: {
            hr_name: string;
            hr_email: string;
            hr_job_title: string;
            hr_phone: string;
        }
    ) {
        const res = await backendApi.post(
            `/api/jobs/clients/${clientId}/hrs/`,
            data
        );
        return res.data;
    },

    // ✅ NEW → noun-based update/delete
   async updateHR(
    clientId: number,
    hrId: number,
    data: {
        name?: string;
        email?: string;
        hr_phone?: number;
        designation?: string;
    }
) {
    const res = await backendApi.patch(
        `/api/jobs/clients/${clientId}/hrs/${hrId}/`,
        data
    );
    return res.data;
},

async deleteHR(clientId: number, hrId: number) {
    const res = await backendApi.delete(
        `/api/jobs/clients/${clientId}/hrs/${hrId}/`
    );
    return res.data;
},
};