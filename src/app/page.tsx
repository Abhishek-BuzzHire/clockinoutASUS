"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import axios, { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface AuthResponseData {
  access: string;
  refresh: string;
}

interface TokenPayload {
  id: string | number;
  username: string;
  role: string;
}

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && !returnUrl) {
      const home = user.role === "admin" ? "/list/attendance/admin" : "/list/attendance/employee";
      router.replace(home);
    }
  }, [user, loading, router]);

  const handleLoginSuccess = (access: string, refresh: string) => {
    login(access, refresh); // Set cookies and user state in context

    // ⬇️ 4. USE THE NEW LOGIC
    if (returnUrl) {
      router.push(returnUrl); // Go to the originally intended page
    } else {
      // Fallback to the default dashboard if no returnUrl is present
      const decoded = jwtDecode<TokenPayload>(access);
      const home = decoded.role === "admin" ? "/list/attendance/admin" : "/list/attendance";
      router.push(home);
    }
  };

  const handleGoogleLoginSuccess = async (cred: CredentialResponse) => {
    const idToken = cred.credential;
    if (!idToken) {
      console.error("Google response missing ID token.");
      return;
    }

    try {
      const response = await axios.post<AuthResponseData>(
        `${apiUrl}/auth/google/`,
        { id_token: idToken }
      );

      const { access, refresh } = response.data;
      handleLoginSuccess(access, refresh);
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

  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await axios.post<{ access: string; refresh: string }>(
        `${apiUrl}/login/`,
        { username, password }
      );

      const { access, refresh } = response.data;
      handleLoginSuccess(access, refresh);
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid username or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex gap-8 items-center justify-center bg-gray-100">
      <form onSubmit={handleUsernameLogin} className="space-y-4 mt-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg py-2 px-3">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition disabled:opacity-60"
        >
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>

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