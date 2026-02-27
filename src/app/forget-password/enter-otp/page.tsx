"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function EnterOtpPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const username = searchParams.get("username") || "";

    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev > 0) {
                    return prev - 1;
                } else {
                    clearInterval(timer);
                    return 0;
                }
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (timeLeft === 0) {
            const timeout = setTimeout(() => {
                setMessage("OTP has expired. Please request a new one.");
            }, 0);
            return () => clearTimeout(timeout);
        }
    }, [timeLeft, message]);

    const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);

        if (timeLeft <= 0) {
            setMessage("OTP has expired. Please request a new one.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/forgot-password/verify-otp/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, otp }),
            });

            if (response.ok) {
                console.log("OTP verified successfully");
                router.push(`/forget-password/set-password?username=${encodeURIComponent(username)}`);
            } else {
                const errorData = await response.json();
                setMessage(errorData.message || "Failed to verify OTP.");
            }
        } catch {
            setMessage("An error occurred while verifying OTP.");
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
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setOtp(e.target.value)
                                }
                                required
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-center tracking-widest focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                placeholder="Enter 6-digit OTP"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                💡 Check console (F12) for OTP
                            </p>
                        </div>

                        <div className="text-xs text-gray-500 mt-1 text-center">
                            Time remaining: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                        >
                            Verify OTP
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
