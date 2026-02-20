"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { apiUrl } from "@/lib/data";
import axios from "axios";
import Cookies from "js-cookie";

interface ChangePasswordProps {
    onCancel: () => void;
}
const ChangePassword = ({ onCancel }: ChangePasswordProps) => {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchChangePassword = async () => {
        setError("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("All fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New password and confirm password do not match");
            return;
        }

        const token = Cookies.get("access");

        // ✅ Create payload here
        const payload = {
            old_password: currentPassword,
            new_password: confirmPassword,
        };

        try {

            const res = await axios.post(
                `${apiUrl}/api/profile/change-password/`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.data?.status === "success") {
                setSuccess(res.data.message);  // ✅ show backend message
                setError("");

                // Reset after 1.5 seconds
                setTimeout(() => {
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setSuccess("");
                }, 1500);
            }
        } catch (err: any) {
            console.error("Failed to change password:", err);
            setError(
                err.response?.data?.message || "Failed to change password"
            );
            setSuccess("");
        }
    };

    const handleCancel = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        onCancel();
    };

    return (
        <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">

            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-slate-800">
                    Change Password
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Update your account password to keep it secure.
                </p>
            </div>

            <div className="space-y-5">

                {/* Current Password */}
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                        Current Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type={showCurrent ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* New Password */}
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                        New Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type={showNew ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type={showConfirm ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}
                {success && (
                    <p className="text-green-500 text-sm">{success}</p>
                )}



                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        className="px-4 py-2 text-sm rounded-lg border"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={fetchChangePassword}
                        className="px-5 py-2 text-sm rounded-lg bg-indigo-600 text-white disabled:opacity-50"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;