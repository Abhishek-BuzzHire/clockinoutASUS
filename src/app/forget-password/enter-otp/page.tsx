"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

interface VerifyOtpPayload {
    username: string;
    otp: string;
}

const fetchVerifyOtp = async (payload: VerifyOtpPayload) => {
    const res = await axios.post("/forgot-password/verify-otp/", payload);
    return res.data;
};

export default function EnterOtpPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const username = searchParams.get("username") || "";

    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev > 0) return prev - 1;
                clearInterval(timer);
                return 0;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (timeLeft === 0) {
            setMessage("OTP has expired. Please request a new one.");
        }
    }, [timeLeft]);

    const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);

        if (timeLeft <= 0) {
            setMessage("OTP has expired. Please request a new one.");
            return;
        }

        try {
            setLoading(true);
            const payload: VerifyOtpPayload = { username, otp };
            await fetchVerifyOtp(payload);
            router.push(`/forget-password/set-password?username=${encodeURIComponent(username)}`);
        } catch (error: any) {
            setMessage(error?.response?.data?.message || error?.response?.data?.error || "Failed to verify OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-white font-inter">
            <div className="w-full max-w-[420px] px-6 py-8">
                <h1 className="text-2xl font-bold text-center text-slate-900 mb-6">
                    Verify OTP
                </h1>

                {message && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                        {message}
                    </div>
                )}

                <div className="border border-gray-200 rounded-2xl p-4">
                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Enter OTP
                            </label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
                                required
                                disabled={loading || timeLeft === 0}
                                maxLength={6}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-center tracking-widest focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                                placeholder="Enter 6-digit OTP"
                            />
                        </div>

                        <div className="text-xs text-gray-500 text-center">
                            Time remaining:{" "}
                            <span className={timeLeft <= 60 ? "text-red-500 font-semibold" : ""}>
                                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || timeLeft === 0 || !otp.trim()}
                            className="w-full mt-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}