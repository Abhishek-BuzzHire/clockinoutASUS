import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // example: http://localhost:8000
});

// --- Add Auto-Refresh Logic ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If access token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = Cookies.get("refresh");
      if (!refresh) {
        console.log("No refresh token found");
        return Promise.reject(error);
      }

      try {
        // Request new access token
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/token/refresh/`,
          { refresh }
        );

        const newAccess = res.data.access;

        // Save new access token
        Cookies.set("access", newAccess, {
          expires: 1 / 24, // 1 hour
          sameSite: "Strict",
          secure: true,
        });

        // Set new Authorization header
        api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        console.log("Refresh token expired. Logging out.");
        Cookies.remove("access");
        Cookies.remove("refresh");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
