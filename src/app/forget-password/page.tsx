"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordUsernamePage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        try {
            console.log("🔄 Sending to API:", username);

            // Note: Ensure this matches your /api folder spelling exactly
            const response = await fetch("http://localhost:8000/api/forgot-password/send-otp/", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ username: username.trim() }),
            });

            let data;
            try {
                data = await response.json();
            } catch {
                data = { message: "Invalid response from server" };
            }

            if (response.ok) {
                setMessage("✅ OTP sent successfully!");
                setTimeout(() => {
                    // Redirects to the subfolder seen in your screenshot
                    router.push(`/forget-password/enter-otp?username=${encodeURIComponent(username)}`);
                }, 1500);
            } else {
                setMessage(`❌ ${data.message || data.error || `Error ${response.status}`}`);
            }
        } catch (error: unknown) {
            // This fix solves the "Unexpected any" ESLint error
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error("💥 Network error:", errorMessage);
            setMessage("❌ Network error. Check if server is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-white font-inter">
            <div className="w-full max-w-[420px] px-6 py-8">
                <h1 className="text-2xl font-bold text-center text-slate-900 mb-6">
                    Enter User Name
                </h1>

                {message && (
                    <div className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
                        message.includes('✅') 
                            ? 'border-green-200 bg-green-50 text-green-800' 
                            : 'border-red-200 bg-red-50 text-red-800'
                    }`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSendOtp} className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Enter Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={loading}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                            placeholder="Enter your username"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !username.trim()}
                        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        {loading ? "Sending..." : "Send OTP"}
                    </button>
                </form>
            </div>
        </div>
    );
}