"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { apiUrl } from "@/lib/data";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [emailSubmitted, setEmailSubmitted] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);

    const [loadingEmail, setLoadingEmail] = useState(false);
    const [loadingOtp, setLoadingOtp] = useState(false);
    const [loadingReset, setLoadingReset] = useState(false);

    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const handleSendOtp = async (e?: FormEvent) => {
        if (e) e.preventDefault();
        if (!email.trim()) return;
        setMessage(null);
        setLoadingEmail(true);

        try {
            await axios.post(`${apiUrl}/api/forgot-password/send-otp/`, {
                username: email.trim(),
            });
            setEmailSubmitted(true);
            setMessage({ text: "✅ OTP sent successfully to your email!", type: "success" });
        } catch (error: any) {
            setMessage({
                text: error?.response?.data?.message || error?.response?.data?.error || "Failed to send OTP.",
                type: "error",
            });
        } finally {
            setLoadingEmail(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp.trim()) return;
        setMessage(null);
        setLoadingOtp(true);

        try {
            await axios.post(`${apiUrl}/api/forgot-password/verify-otp/`, {
                username: email.trim(),
                otp: otp.trim(),
            });
            setOtpVerified(true);
            setMessage({ text: "✅ OTP verified successfully!", type: "success" });
        } catch (error: any) {
            setMessage({
                text: error?.response?.data?.message || error?.response?.data?.error || "Failed to verify OTP.",
                type: "error",
            });
        } finally {
            setLoadingOtp(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            setMessage({ text: "Please enter all fields.", type: "error" });
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage({ text: "Passwords do not match.", type: "error" });
            return;
        }
        setMessage(null);
        setLoadingReset(true);

        try {
            await axios.post(`${apiUrl}/api/forgot-password/reset/`, {
                username: email.trim(),
                new_password: newPassword,
            });
            setMessage({ text: "✅ Password reset successfully! Redirecting to login...", type: "success" });
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (error: any) {
            setMessage({
                text: error?.response?.data?.message || error?.response?.data?.error || "Failed to reset password.",
                type: "error",
            });
        } finally {
            setLoadingReset(false);
        }
    };

    return (
        <div className="h-screen bg-[#f2f2f2] flex justify-center items-center overflow-hidden font-inter">
            <div className="w-[380px] bg-white rounded-[30px] px-8 py-5 shadow-xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-[30px] font-semibold text-gray-800">
                        Forgot Password
                    </h1>
                    <button
                        onClick={() => router.push("/login")}
                        className="text-gray-400 text-3xl hover:text-black"
                    >
                        ×
                    </button>
                </div>

                {/* Google */}
                <button className="flex items-center gap-2 border rounded-full px-6 py-3 shadow-sm mb-6 hover:bg-gray-50">
                    <img
                        src="https://www.google.com/favicon.ico"
                        alt="google"
                        className="w-6 h-6"
                    />
                    <span className="text-gray-500 font-medium">
                        Continue with Google
                    </span>
                </button>

                {/* Message display */}
                {message && (
                    <div className={`mb-4 rounded-lg border px-3 py-2 text-xs ${
                        message.type === 'success'
                            ? 'border-green-200 bg-green-50 text-green-800'
                            : 'border-red-200 bg-red-50 text-red-800'
                    }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Email ID
                        </label>
                        <div className="flex">
                            <input
                                type="email"
                                placeholder="Enter Email ID"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={emailSubmitted || loadingEmail}
                                className="w-[290px] h-[42px] border px-4 rounded-l-xl outline-none disabled:bg-gray-100"
                            />
                            <button
                                type="button"
                                onClick={() => handleSendOtp()}
                                disabled={emailSubmitted || loadingEmail || !email.trim()}
                                className="
                                w-[60px]
                                h-[42px]
                                bg-white
                                text-black
                                border
                                rounded-r-xl
                                transition-all
                                hover:bg-sky-500
                                hover:text-white
                                disabled:bg-gray-100
                                disabled:text-gray-400
                                disabled:hover:bg-gray-100
                                disabled:hover:text-gray-400
                                "
                            >
                                {loadingEmail ? "..." : "Go"}
                            </button>
                        </div>
                    </div>

                    {/* OTP */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            OTP
                        </label>
                        <div className="flex">
                            <input
                                type="text"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                disabled={!emailSubmitted || otpVerified || loadingOtp}
                                className="w-[290px] h-[42px] border px-4 rounded-l-xl outline-none disabled:bg-gray-100"
                            />
                            <button
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={!emailSubmitted || otpVerified || loadingOtp || !otp.trim()}
                                className="
                                w-[60px]
                                h-[42px]
                                bg-white
                                text-black
                                border
                                rounded-r-xl
                                transition-all
                                hover:bg-sky-500
                                hover:text-white
                                disabled:bg-gray-100
                                disabled:text-gray-400
                                disabled:hover:bg-gray-100
                                disabled:hover:text-gray-400
                                "
                            >
                                {otpVerified ? "Verified ✓" : loadingOtp ? "..." : "Verify"}
                            </button>
                        </div>
                        <p 
                            onClick={() => {
                                if (emailSubmitted && !otpVerified && !loadingEmail) {
                                    handleSendOtp();
                                }
                            }}
                            className={`text-sm mt-2 text-right ${
                                emailSubmitted && !otpVerified && !loadingEmail 
                                    ? 'text-gray-500 hover:text-sky-500 cursor-pointer' 
                                    : 'text-gray-300 cursor-not-allowed'
                            }`}
                        >
                            Resend OTP
                        </p>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={!otpVerified || loadingReset}
                            className="w-full h-[42px] border px-4 rounded-xl outline-none disabled:bg-gray-100"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={!otpVerified || loadingReset}
                            className="w-full h-[42px] border px-4 rounded-xl outline-none disabled:bg-gray-100"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleResetPassword}
                        disabled={!otpVerified || loadingReset || !newPassword || !confirmPassword}
                        className="
                        w-full
                        h-[42px]
                        bg-sky-500
                        text-white
                        rounded-xl
                        hover:opacity-90
                        disabled:bg-gray-300
                        disabled:cursor-not-allowed
                        "
                    >
                        {loadingReset ? "Updating..." : "Change Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}