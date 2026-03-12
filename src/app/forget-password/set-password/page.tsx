"use client";

import { useState, FormEvent, ChangeEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiUrl } from "@/lib/data";
import axios from "axios";


interface SetPassPayload {
    username: string,
    new_password: string
}
const fetchSetPass = async (payload: SetPassPayload) => {
    const res = await axios.post(`${apiUrl}/api/forgot-password/reset/`, payload);
    return res.data;
};

function SetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get username (email) from the URL query parameter
    const username = searchParams.get("username") || "";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ text: "Passwords do not match.", type: "error" });
            return;
        }

        try {
            setLoading(true);
            const payload: SetPassPayload = { username, new_password: newPassword };
            await fetchSetPass(payload);
            setTimeout(() => router.push("/login"), 2000);
        } catch (error: any) {
            setMessage(error?.response?.data?.message || error?.response?.data?.error || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[420px] px-6 py-8">
            <h1 className="text-2xl font-bold text-center text-slate-900 mb-8">
                Set New Password
            </h1>

            {message && (
                <div className={`mb-6 rounded-lg border px-3 py-2 text-sm ${message.type === "success"
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-800"
                    }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-5">
                {/* Username Target (Hidden but present for logic) */}
                <input type="hidden" value={username} name="username" />

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        New Password
                    </label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !newPassword}
                    className="w-full mt-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                    {loading ? "Updating..." : "Change Password"}
                </button>
            </form>
        </div>
    );
}

export default function SetPasswordPage() {
    return (
        <div className="min-h-screen flex justify-center items-center bg-white font-inter">
            <Suspense fallback={<div className="text-sm text-gray-400">Loading reset form...</div>}>
                <SetPasswordForm />
            </Suspense>
        </div>
    );
}