import axios from "axios";
import { API_BASE_URL } from "./api-config";
import Cookies from "js-cookie";

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add token automatically to every request
api.interceptors.request.use((config) => {
    const token = Cookies.get("access");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const payrollApi = {
    async getCycles() {
        try {
            const res = await api.get("/api/payroll/cycles/");
            return res.data;
        } catch (error) {
            throw new Error("Failed to fetch payroll cycles");
        }
    },

    async getCycleById(cycleId:string | number) {
        try {
            const res = await api.get(`/api/payroll/cycles/${cycleId}/`);
            return res.data;
        } catch (error) {
            throw new Error("Failed to fetch payroll cycle");
        }
    },

    async createCycle(data: {
        month: number;
        year: number;
        cutoff_date: string;
    }) {
        try {
            const res = await api.post("/api/payroll/cycles/", data);
            return res.data;
        } catch (error) {
            throw new Error("Failed to create payroll cycle");
        }
    },

    async generatePayroll(cycleId:string | number) {
        try {
            const res = await api.post(`/api/payroll/cycles/${cycleId}/runs/`);
            return res.data;
        } catch (error) {
            throw new Error("Payroll generation failed");
        }
    },

    async getPayrollRuns(cycleId: string | number) {
        try {
            const res = await api.get(`/api/payroll/cycles/${cycleId}/runs/`);
            return res.data;
        } catch (error) {
            throw new Error("Failed to fetch payroll runs");
        }
    },

    async finalizePayroll(cycleId:string | number) {
        try {
            const res = await api.post(`/api/payroll/cycles/${cycleId}/finalize/`);
            return res.data;
        } catch (error) {
            throw new Error("Payroll finalization failed");
        }
    },

    async getPayslip(year: number, month: string) {
        try {
            const res = await api.get(`/api/payroll/payslip/${year}/${month}/`);
            return res.data;
        } catch (error) {
            throw new Error("Payslip not available");
        }
    },
};