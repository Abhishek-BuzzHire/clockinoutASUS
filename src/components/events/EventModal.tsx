"use client";

import { useState } from "react";
import InterviewScheduleModal from "./InterviewScheduleModal";
import EventBroadcastModal from "./EventBroadCastModal";

export default function EventModalDemo() {
    const [showInterview, setShowInterview] = useState(false);
    const [showEvent, setShowEvent] = useState(false);

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex flex-col items-center justify-center gap-6 p-8"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
            <div className="text-center mb-4">
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
                    Component Preview
                </p>
                <h1 className="text-3xl font-bold text-slate-800">Event Modals</h1>
                <p className="text-slate-400 text-sm mt-1">
                    Trigger from notifications, action buttons, sidebars, etc.
                </p>
            </div>

            <div className="flex gap-4 flex-wrap justify-center">
                {/* Interview Trigger */}
                <button
                    onClick={() => setShowInterview(true)}
                    className="group flex items-center gap-3 bg-white border border-indigo-100 hover:border-indigo-300 rounded-2xl px-6 py-4 shadow-sm shadow-indigo-100 hover:shadow-indigo-200 transition-all"
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-lg">
                        🧑‍💼
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-slate-800">
                            Schedule Interview
                        </p>
                        <p className="text-xs text-slate-400">Add interviewee, panel & time</p>
                    </div>
                    <span className="ml-2 text-indigo-300 group-hover:text-indigo-500 transition-colors">
                        →
                    </span>
                </button>

                {/* Event/Broadcast Trigger */}
                <button
                    onClick={() => setShowEvent(true)}
                    className="group flex items-center gap-3 bg-white border border-indigo-100 hover:border-indigo-300 rounded-2xl px-6 py-4 shadow-sm shadow-indigo-100 hover:shadow-indigo-200 transition-all"
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center text-white text-lg">
                        📢
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-slate-800">
                            Create Event / Notify
                        </p>
                        <p className="text-xs text-slate-400">
                            Meeting, announcement, deadline
                        </p>
                    </div>
                    <span className="ml-2 text-indigo-300 group-hover:text-indigo-500 transition-colors">
                        →
                    </span>
                </button>
            </div>

            {/* Usage hint */}
            <div className="mt-4 bg-white border border-indigo-100 rounded-2xl px-6 py-4 max-w-lg w-full shadow-sm">
                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-3">
                    Usage Example
                </p>
                <pre className="text-xs text-slate-600 bg-slate-50 rounded-xl p-4 overflow-x-auto">
                    {`// In a notification, action bar, sidebar:
<button onClick={() => setShowInterview(true)}>
  Schedule Interview
</button>

<InterviewScheduleModal
  open={showInterview}
  onClose={() => setShowInterview(false)}
  onSubmit={(data) => {
    // handle form data — connect API here
    console.log(data);
  }}
/>

<EventBroadcastModal
  open={showEvent}
  onClose={() => setShowEvent(false)}
  onSubmit={(data) => {
    // handle form data — connect API here
  }}
/>`}
                </pre>
            </div>

            <InterviewScheduleModal
                open={showInterview}
                onClose={() => setShowInterview(false)}
                onSubmit={(data) => {
                    console.log("Interview scheduled:", data);
                    setShowInterview(false);
                }}
            />

            <EventBroadcastModal
                open={showEvent}
                onClose={() => setShowEvent(false)}
                onSubmit={(data) => {
                    console.log("Event created:", data);
                    setShowEvent(false);
                }}
            />
        </div>
    );
}