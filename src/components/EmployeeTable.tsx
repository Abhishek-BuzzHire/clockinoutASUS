"use client";

import { Employee } from "@/lib/types";
import { useState } from "react";
import EmployeeDetails from "./EmployeeDetails";

interface EmployeeTableProps {
    data: Employee[];
}

const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const EmployeeTable: React.FC<EmployeeTableProps> = ({ data }) => {
    const [profileIndex, setProfileIndex] = useState<number | null>(null);

    const currentEmployee =
        profileIndex !== null ? data[profileIndex] : null;

    const handleRowClick = (employee: Employee) => {
        const index = data.findIndex((e) => e.id === employee.id);
        if (index !== -1) setProfileIndex(index);
    };

    const handlePrevEmployee = () => {
        if (profileIndex === null) return;
        setProfileIndex((prev) =>
            prev === 0 ? data.length - 1 : (prev as number) - 1
        );
    };

    const handleNextEmployee = () => {
        if (profileIndex === null) return;
        setProfileIndex((prev) =>
            prev === data.length - 1 ? 0 : (prev as number) + 1
        );
    };

    const getProfilePhoto = (item: Employee): string => {
        const photo = item.profile_photo;

        if (!photo) return "/avatar.png";

        if (typeof photo === "string") {
            if (!photo.trim()) return "/avatar.png";
            if (photo.startsWith("http")) return photo;
            if (photo.startsWith("/media")) return `${BASE_URL}${photo}`;
            if (photo.startsWith("data:")) return photo;

            return `data:image/jpeg;base64,${photo}`;
        }

        try {
            return `data:image/jpeg;base64,${btoa(
                String.fromCharCode(...new Uint8Array(photo))
            )}`;
        } catch {
            return "/avatar.png";
        }
    };

    return (
        <>
            <div className="w-full overflow-x-auto">
                <table
                    className="w-full min-w-[900px] border-collapse"
                    style={{ border: "none", borderSpacing: 0 }}
                >
                    <thead>
                        <tr
                            className="bg-[#edf1f7] text-gray-700 text-sm"
                            style={{ margin: 0 }}
                        >
                            <th style={{ border: "none" }} className="p-4 text-left font-semibold">Employee Name</th>
                            <th style={{ border: "none" }} className="p-4 text-left font-semibold">Contact</th>
                            <th style={{ border: "none" }} className="p-4 text-left font-semibold">Department</th>
                            <th style={{ border: "none" }} className="p-4 text-left font-semibold">Joined On</th>
                            <th style={{ border: "none" }} className="p-4 text-left font-semibold">Today's Status</th>
                            <th style={{ border: "none" }} className="p-4 text-left font-semibold">Action</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white">
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center p-10 text-gray-400">
                                    No employees found.
                                </td>
                            </tr>
                        )}

                        {data.map((item, idx) => {
                            const fullName =
                                item.name?.trim() ||
                                item.username ||
                                "No Name";

                            const department =
                                typeof item.department === "object"
                                    ? item.department?.name || "—"
                                    : item.department || "—";

                            const isPresent =
                                item.isPresentToday ??
                                item.is_present ??
                                false;

                            return (
                                <tr
                                    key={item.id ?? idx}
                                    onClick={() => handleRowClick(item)}
                                    className="hover:bg-[#f5f8ff] transition"
                                >
                                    <td style={{ border: "none" }} className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={getProfilePhoto(item)}
                                                className="w-10 h-10 rounded-full object-cover border"
                                                onError={(e) =>
                                                    ((e.target as HTMLImageElement).src =
                                                        "/avatar.png")
                                                }
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-800">
                                                    {fullName}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {item.designation || item.role}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td style={{ border: "none" }} className="p-4 text-sm text-gray-600">
                                        <div>{item.email || "—"}</div>
                                        <div>{item.phone || "—"}</div>
                                    </td>

                                    <td style={{ border: "none" }} className="p-4 text-gray-600">
                                        {department}
                                    </td>

                                    <td style={{ border: "none" }} className="p-4 text-gray-600">
                                        {item.joining_date
                                            ? new Date(item.joining_date).toLocaleDateString("en-US", {
                                                  year: "numeric",
                                                  month: "short",
                                                  day: "numeric",
                                              })
                                            : "N/A"}
                                    </td>

                                    <td style={{ border: "none" }} className="p-4">
                                        <span
                                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold border ${
                                                isPresent
                                                    ? "border-green-500 text-green-600 bg-green-50"
                                                    : "border-red-400 text-red-500 bg-red-50"
                                            }`}
                                        >
                                            {isPresent ? "Present" : "Absent"}
                                        </span>
                                    </td>

                                    <td style={{ border: "none" }} className="p-4">
                                        <button
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-gray-400 hover:text-gray-700"
                                        >
                                            ✏️
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* SLIDE PANEL */}
            <div className={`fixed top-0 right-0 h-full w-full md:w-1/2 bg-white shadow-lg z-50 transform transition-transform ${
                profileIndex !== null ? "translate-x-0" : "translate-x-full"
            }`}>
                <button
                    className="absolute top-2 right-4 text-2xl"
                    onClick={() => setProfileIndex(null)}
                >
                    ✕
                </button>

                {currentEmployee && (
                    <EmployeeDetails
                        data={currentEmployee}
                        onPrev={handlePrevEmployee}
                        onNext={handleNextEmployee}
                    />
                )}
            </div>

            {profileIndex !== null && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={() => setProfileIndex(null)}
                />
            )}
        </>
    );
};

export default EmployeeTable;