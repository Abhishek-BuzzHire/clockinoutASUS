"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { useEffect } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface AuthResponseData {
  access: string;
  refresh: string;
}

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const home = user.role === "admin" ? "/list/attendance/admin" : "/attendance";
      router.replace(home);
    }
  }, [user, loading, router]);

  const handleGoogleLoginSuccess = async (cred: CredentialResponse) => {
    const idToken = cred.credential;
    if (!idToken) {
      console.error("Google response missing ID token.");
      return;
    }

    try {
      const response = await axios.post<AuthResponseData & { access: string; refresh: string }>(
        `${apiUrl}/auth/google/`,
        { id_token: idToken }
      );

      const { access, refresh } = response.data;
      login(access, refresh);

      const decoded = response.data as { role?: string };
      const role = decoded.role;
      if (role === "admin") {
        router.push("/list/attendance/admin");
      } else {
        router.push("/list/attendance/employee");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error?: string }>;
        const errorDetail = axiosError.response?.data?.error ?? axiosError.message;
        console.error("Google login failed (API call):", errorDetail);
      } else {
        console.error("An unexpected error occurred during login:", error);
      }
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg px-10 py-10 text-center space-y-4">
        <div className="flex justify-center">
          <Image src="/logo.webp" alt="" height={40} width={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome to <span className="text-red-600">Buzz</span><span className="text-blue-800">Hire</span> CRM
        </h1>
        <p className="text-gray-600">Please login</p>
        <div className="flex justify-center mt-6">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => console.log("Login Failed")}
            theme="filled_blue"
            size="large"
            width="280"
            text="continue_with"
          />
        </div>
      </div>
    </div>
  );
}