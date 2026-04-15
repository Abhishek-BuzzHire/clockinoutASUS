import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "./api-config";

// Create axios instance
// IMPORTANT: Don't force "Content-Type" globally.
// - Axios will set application/json automatically for JSON bodies
// - For FormData uploads (resume/file), the browser must set multipart boundaries
export const backendApi = axios.create({
    baseURL: API_BASE_URL,
});

// Attach access token to every request
backendApi.interceptors.request.use(
    (config) => {
        const token = Cookies.get("access");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Optional: response interceptor for global error handling
backendApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error("Unauthorized request",error);
        }

        return Promise.reject(error);
    }
);