"use client";

import useSWR from "swr";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

/**
 * Shape of the current employee/profile returned by your backend.
 * Adjust fields to match your API (e.g. /api/profile/me or /api/employee/me).
 */
export interface CurrentEmployee {
  id?: number;
  name?: string;
  email?: string;
  profile_photo?: string; // base64 or URL
  phone?: string;
  department?: string;
  designation?: string;
  [key: string]: unknown;
}

const EMPLOYEE_API = "/api/profile/me/"; // or "/api/employee/me" if you have that

async function fetcher(url: string): Promise<CurrentEmployee | null> {
  const token = Cookies.get("access");
  const { data } = await api.get<CurrentEmployee | CurrentEmployee[]>(url, {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });
  return Array.isArray(data) ? data[0] ?? null : data ?? null;
}

/**
 * Fetches and caches the current employee/profile. Only runs when user is logged in.
 * Use in Navbar, layout, or any component that needs name, photo, etc.
 */
export function useCurrentEmployee() {
  const { user } = useAuth();
  const key = user ? ["current-employee", user.id] as const : null;

  const { data, error, isLoading, mutate } = useSWR(key, () => fetcher(EMPLOYEE_API), {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60_000, // 1 min – avoid refetching too often
  });

  return {
    employee: data ?? null,
    isLoading,
    error,
    mutate, // call after profile update to refresh cache
  };
}
