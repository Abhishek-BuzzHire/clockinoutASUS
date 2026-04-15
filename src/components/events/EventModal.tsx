"use client";

import { useState } from "react";
import InterviewScheduleModal from "./InterviewScheduleModal";
import EventBroadcastModal from "./EventBroadCastModal";

type View = "picker" | "interview" | "event";

interface EventModalProps {
    open: boolean;
    onClose: () => void;
}

export default function EventModal({ open, onClose }: EventModalProps) {
    const [view, setView] = useState<View>("picker");

    if (!open) return null;

    const handleClose = () => {
        setView("picker"); // reset back to picker on close
        onClose();
    };

    // If one of the sub-modals is active, render it directly
    if (view === "interview") {
        return (
            <InterviewScheduleModal
                open={true}
                onClose={handleClose}
                onSubmit={(data) => {
                    console.log("[Interview] submitted:", data);
                    // TODO: connect API
                    handleClose();
                }}
            />
        );
    }

    if (view === "event") {
        return (
            <EventBroadcastModal
                open={true}
                onClose={handleClose}
                onSubmit={(data) => {
                    console.log("[Event] submitted:", data);
                    // TODO: connect API
                    handleClose();
                }}
            />
        );
    }

    // Picker view
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-indigo-950/20 "
                onClick={handleClose}
            />

            {/* Picker card */}
            <div className="relative bg-white rounded-2xl shadow-2xl shadow-indigo-200/60 border border-indigo-100 overflow-hidden w-full max-w-sm">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 flex items-center justify-between">
                    <div>
                        <p className="text-indigo-200 text-xs font-semibold tracking-widest uppercase mb-1">
                            New
                        </p>
                        <h2 className="text-white text-xl font-bold">Add Event</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white/60 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Options */}
                <div className="p-4 flex flex-col gap-3">
                    <p className="text-xs text-slate-400 font-medium px-1">
                        What would you like to create?
                    </p>

                    <button
                        onClick={() => setView("interview")}
                        className="group flex items-center gap-4 p-4 rounded-xl border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/60 transition-all text-left"
                    >
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-xl shrink-0 shadow-sm shadow-indigo-300">
                            🧑‍💼
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800">Schedule Interview</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Add interviewee, panel members & time slot
                            </p>
                        </div>
                        <span className="text-indigo-300 group-hover:text-indigo-500 transition-colors text-lg">
                            →
                        </span>
                    </button>

                    <button
                        onClick={() => setView("event")}
                        className="group flex items-center gap-4 p-4 rounded-xl border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/60 transition-all text-left"
                    >
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center text-xl shrink-0 shadow-sm shadow-violet-300">
                            📢
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800">Create Event / Notify</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Meeting, announcement, deadline or workshop
                            </p>
                        </div>
                        <span className="text-indigo-300 group-hover:text-indigo-500 transition-colors text-lg">
                            →
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}