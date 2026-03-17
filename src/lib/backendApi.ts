import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "./api-config";

// Create axios instance
export const backendApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
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
            console.error("Unauthorized request");
        }

        return Promise.reject(error);
    }
);