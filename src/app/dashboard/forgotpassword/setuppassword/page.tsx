"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [otpVerified, setOtpVerified] = useState(false);
    const router = useRouter();
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
    };

    return (
        <div className="h-screen bg-[#f2f2f2] flex justify-center items-center overflow-hidden">
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
                <button className="flex items-center gap-2 border rounded-full px-6 py-3 shadow-sm mb-8 hover:bg-gray-50">
                    <img
                        src="https://www.google.com/favicon.ico"
                        alt="google"
                        className="w-6 h-6"
                    />
                    <span className="text-gray-500 font-medium">
                        Continue with Google
                    </span>
                </button>

                <form onSubmit={handleSubmit} className="space-y-3">
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
                                className="w-[290px] h-[42px] border px-4 rounded-l-xl outline-none"
                            />
                            <button
                                type="submit"
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
                                "
                            >
                                Go
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
                                className="w-[290px] h-[42px] border px-4 rounded-l-xl outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setOtpVerified(true)}
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
                                "
                            >
                                {otpVerified ? "Verified ✓" : "Verify"}
                            </button>
                        </div>
                        <p className="text-sm mt-2 text-right text-gray-500 hover:text-sky-500 cursor-pointer">
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
                            className="w-full h-[42px] border px-4 rounded-xl outline-none"
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
                            className="w-full h-[42px] border px-4 rounded-xl outline-none"
                        />
                    </div>

                    <button
                        type="button"
                        className="
                        w-full
                        h-[42px]
                        bg-sky-500
                        text-white
                        rounded-xl
                        hover:opacity-90
                        "
                    >
                        Change Password
                    </button>
                </form>
            </div>
        </div>
    );
}
