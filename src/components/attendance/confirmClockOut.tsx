"use client";

import React, { useEffect, useState } from "react";

interface Props {
    isOpen: boolean;
    workingHours?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const formatHours = (value?: string) => {
    if (!value) return "--";

    const [hrs, mins] = value.split(".");
    return `${hrs} hrs ${mins} minutes`;
};

export const ConfirmClockOutModal: React.FC<Props> = ({
    isOpen,
    workingHours,
    onConfirm,
    onCancel
}) => {
    if (!isOpen) return null;

    const [fullWorkHours, setFullWorkHours] = useState(false);
    const [remaining, setRemaining] = useState<{
        hours: number;
        minutes: number;
        formatted: string;
    } | null>(null);

    function leftTime(input?: string) {
        if (!input) return null; // prevent crash

        const FIXED = "9.30";

        function toMinutes(timeStr: string): number {
            const [h, m] = timeStr.split(".");
            const hours = parseInt(h, 10);
            const minutes = parseInt(m, 10);
            return hours * 60 + minutes;
        }

        const fixedMinutes = toMinutes(FIXED);
        const inputMinutes = toMinutes(input);

        const isFull = inputMinutes >= fixedMinutes;

        const remaining = fixedMinutes - inputMinutes;

        const remainingHours = Math.floor(remaining / 60);
        const remainingMinutes = Math.abs(remaining % 60);

        return {
            isFull,
            hours: remainingHours,
            minutes: remainingMinutes,
            formatted: `${remainingHours}.${remainingMinutes
                .toString()
                .padStart(2, "0")}`
        };
    }

        useEffect(() => {
        const result = leftTime(workingHours);
        if (result) {
            setFullWorkHours(result.isFull);
            setRemaining(result);
        }
    }, [workingHours]);

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md">
                <h2 className="text-xl font-semibold mb-3">Confirm Clock Out</h2>

                <p className="text-gray-700 mb-4">
                    Today you have worked:
                    <span className="font-bold"> {formatHours(workingHours) ?? "--"}</span>
                </p>

                {fullWorkHours ? (
                    <p className="text-gray-700 mb-4">
                        You have completed your working hours
                    </p>
                ) : (
                    <p className="text-gray-700 mb-4">
                        You still have remaining:{" "}
                        <span className="font-bold">
                            {formatHours(remaining?.formatted)}
                        </span>
                    </p>
                )}

                <p className="mb-6">Are you sure you want to clock out?</p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                        Yes, Clock Out
                    </button>
                </div>
            </div>
        </div>
    );
};
