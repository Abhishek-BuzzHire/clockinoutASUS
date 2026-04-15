"use client";

import { useState } from "react";

type EventType = "meeting" | "announcement" | "deadline" | "workshop";
type AudienceType = "all" | "selected" | "department";
type NotifyChannel = "email" | "in-app" | "sms";

interface SelectedCandidate {
    id: string;
    name: string;
    email: string;
    tag?: string;
}

interface EventFormData {
    type: EventType;
    title: string;
    description: string;
    date: string;
    time: string;
    endTime: string;
    location: string;
    meetLink: string;
    audienceType: AudienceType;
    department: string;
    selectedCandidates: SelectedCandidate[];
    channels: NotifyChannel[];
    isUrgent: boolean;
    requireRSVP: boolean;
    attachmentName: string;
}

interface EventBroadcastModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit?: (data: EventFormData) => void;
}

const EVENT_TYPES: {
    value: EventType;
    label: string;
    icon: string;
    color: string;
}[] = [
        {
            value: "meeting",
            label: "Meeting",
            icon: "👥",
            color: "bg-indigo-600 text-white",
        },
        {
            value: "announcement",
            label: "Announcement",
            icon: "📢",
            color: "bg-violet-600 text-white",
        },
        {
            value: "deadline",
            label: "Deadline",
            icon: "⏰",
            color: "bg-rose-500 text-white",
        },
        {
            value: "workshop",
            label: "Workshop",
            icon: "🛠",
            color: "bg-emerald-600 text-white",
        },
    ];

const DEPARTMENTS = [
    "Engineering",
    "Design",
    "Product",
    "Marketing",
    "Operations",
    "HR",
    "Finance",
];

// Mock candidates for demo — replace with API later
const MOCK_CANDIDATES: SelectedCandidate[] = [
    {
        id: "1",
        name: "Priya Sharma",
        email: "priya@example.com",
        tag: "Frontend",
    },
    {
        id: "2",
        name: "Arjun Mehta",
        email: "arjun@example.com",
        tag: "Backend",
    },
    {
        id: "3",
        name: "Sneha Patel",
        email: "sneha@example.com",
        tag: "Design",
    },
    {
        id: "4",
        name: "Rohit Verma",
        email: "rohit@example.com",
        tag: "DevOps",
    },
    {
        id: "5",
        name: "Kavya Nair",
        email: "kavya@example.com",
        tag: "Product",
    },
];

export default function EventBroadcastModal({
    open,
    onClose,
    onSubmit,
}: EventBroadcastModalProps) {
    const [form, setForm] = useState<EventFormData>({
        type: "meeting",
        title: "",
        description: "",
        date: "",
        time: "",
        endTime: "",
        location: "",
        meetLink: "",
        audienceType: "all",
        department: "",
        selectedCandidates: [],
        channels: ["email", "in-app"],
        isUrgent: false,
        requireRSVP: false,
        attachmentName: "",
    });

    const [candidateSearch, setCandidateSearch] = useState("");

    if (!open) return null;

    const toggleCandidate = (candidate: SelectedCandidate) => {
        const exists = form.selectedCandidates.find((c) => c.id === candidate.id);
        if (exists) {
            setForm({
                ...form,
                selectedCandidates: form.selectedCandidates.filter(
                    (c) => c.id !== candidate.id
                ),
            });
        } else {
            setForm({
                ...form,
                selectedCandidates: [...form.selectedCandidates, candidate],
            });
        }
    };

    const toggleChannel = (ch: NotifyChannel) => {
        const exists = form.channels.includes(ch);
        setForm({
            ...form,
            channels: exists
                ? form.channels.filter((c) => c !== ch)
                : [...form.channels, ch],
        });
    };

    const filteredCandidates = MOCK_CANDIDATES.filter(
        (c) =>
            c.name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
            c.email.toLowerCase().includes(candidateSearch.toLowerCase())
    );

    const currentType = EVENT_TYPES.find((t) => t.value === form.type)!;

    const isEvent = form.type === "meeting" || form.type === "workshop";

    const handleSubmit = () => {
        onSubmit?.(form);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-indigo-950/20 "
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl shadow-indigo-200/60 border border-indigo-100 overflow-hidden">
                {/* Header */}
                <div
                    className={`px-6 py-5 ${form.isUrgent
                        ? "bg-gradient-to-r from-rose-500 to-orange-500"
                        : "bg-gradient-to-r from-indigo-600 to-violet-600"
                        } transition-all duration-500`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{currentType.icon}</span>
                            <div>
                                <p className="text-indigo-200 text-xs font-semibold tracking-widest uppercase">
                                    {form.isUrgent ? "🔴 Urgent" : "Broadcast"}
                                </p>
                                <h2
                                    className="text-white text-xl font-bold"
                                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                                >
                                    New {currentType.label}
                                </h2>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/60 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Type Selector */}
                    <div className="flex gap-2">
                        {EVENT_TYPES.map((t) => (
                            <button
                                key={t.value}
                                onClick={() => setForm({ ...form, type: t.value })}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${form.type === t.value
                                    ? "bg-white text-indigo-700"
                                    : "bg-white/10 text-white/70 hover:bg-white/20"
                                    }`}
                            >
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[62vh] overflow-y-auto space-y-5">
                    {/* Title + Urgent */}
                    <div className="flex gap-3 items-start">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                Title
                            </label>
                            <input
                                type="text"
                                placeholder={
                                    form.type === "announcement"
                                        ? "e.g. Office closed on Friday"
                                        : form.type === "deadline"
                                            ? "e.g. Document submission deadline"
                                            : "e.g. All-hands Q2 Review"
                                }
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="w-full border border-indigo-100 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                            />
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={() =>
                                    setForm({ ...form, isUrgent: !form.isUrgent })
                                }
                                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${form.isUrgent
                                    ? "bg-rose-50 border-rose-300 text-rose-600"
                                    : "bg-slate-50 border-slate-200 text-slate-400 hover:border-rose-200"
                                    }`}
                            >
                                🔴 Urgent
                            </button>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                            {form.type === "announcement" ? "Message" : "Description"}
                        </label>
                        <textarea
                            rows={3}
                            placeholder={
                                form.type === "announcement"
                                    ? "Write your announcement message here..."
                                    : "Agenda, what to prepare, key objectives..."
                            }
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                            className="w-full border border-indigo-100 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                        />
                    </div>

                    {/* Date/Time — only for meeting/workshop/deadline */}
                    {form.type !== "announcement" && (
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                    className="w-full border border-indigo-100 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    value={form.time}
                                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                                    className="w-full border border-indigo-100 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                />
                            </div>
                            {isEvent && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                        End Time
                                    </label>
                                    <input
                                        type="time"
                                        value={form.endTime}
                                        onChange={(e) =>
                                            setForm({ ...form, endTime: e.target.value })
                                        }
                                        className="w-full border border-indigo-100 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Location for events */}
                    {isEvent && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Location / Room
                                </label>
                                <input
                                    placeholder="Room 4A / Virtual"
                                    value={form.location}
                                    onChange={(e) =>
                                        setForm({ ...form, location: e.target.value })
                                    }
                                    className="w-full border border-indigo-100 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Meeting Link
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://meet.google.com/..."
                                    value={form.meetLink}
                                    onChange={(e) =>
                                        setForm({ ...form, meetLink: e.target.value })
                                    }
                                    className="w-full border border-indigo-100 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                />
                            </div>
                        </div>
                    )}

                    {/* Audience */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            Notify
                        </label>
                        <div className="flex gap-2 mb-3">
                            {(
                                [
                                    { v: "all", label: "🌐 Everyone" },
                                    { v: "department", label: "🏢 Department" },
                                    { v: "selected", label: "🎯 Selected" },
                                ] as { v: AudienceType; label: string }[]
                            ).map(({ v, label }) => (
                                <button
                                    key={v}
                                    onClick={() => setForm({ ...form, audienceType: v })}
                                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${form.audienceType === v
                                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-300"
                                        : "bg-indigo-50 text-indigo-500 hover:bg-indigo-100"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {form.audienceType === "department" && (
                            <select
                                value={form.department}
                                onChange={(e) =>
                                    setForm({ ...form, department: e.target.value })
                                }
                                className="w-full border border-indigo-100 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            >
                                <option value="">Select department...</option>
                                {DEPARTMENTS.map((d) => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>
                        )}

                        {form.audienceType === "selected" && (
                            <div className="border border-indigo-100 rounded-xl overflow-hidden">
                                <div className="p-3 bg-indigo-50">
                                    <input
                                        type="text"
                                        placeholder="Search candidates..."
                                        value={candidateSearch}
                                        onChange={(e) => setCandidateSearch(e.target.value)}
                                        className="w-full bg-white border border-indigo-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    />
                                </div>
                                <div className="max-h-36 overflow-y-auto">
                                    {filteredCandidates.map((c) => {
                                        const selected = form.selectedCandidates.some(
                                            (s) => s.id === c.id
                                        );
                                        return (
                                            <button
                                                key={c.id}
                                                onClick={() => toggleCandidate(c)}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${selected
                                                    ? "bg-indigo-50"
                                                    : "hover:bg-slate-50"
                                                    } border-b border-indigo-50 last:border-0`}
                                            >
                                                <div
                                                    className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-all ${selected
                                                        ? "bg-indigo-600 border-indigo-600"
                                                        : "border-slate-300"
                                                        }`}
                                                >
                                                    {selected && (
                                                        <span className="text-white text-[10px]">✓</span>
                                                    )}
                                                </div>
                                                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                                                    {c.name[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-slate-700 truncate">
                                                        {c.name}
                                                    </p>
                                                    <p className="text-xs text-slate-400 truncate">
                                                        {c.email}
                                                    </p>
                                                </div>
                                                {c.tag && (
                                                    <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                                                        {c.tag}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                {form.selectedCandidates.length > 0 && (
                                    <div className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold">
                                        {form.selectedCandidates.length} selected
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Channels & RSVP */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Notify Via
                            </label>
                            <div className="flex gap-2">
                                {(
                                    [
                                        { v: "email" as NotifyChannel, icon: "📧", label: "Email" },
                                        {
                                            v: "in-app" as NotifyChannel,
                                            icon: "🔔",
                                            label: "In-App",
                                        },
                                        { v: "sms" as NotifyChannel, icon: "💬", label: "SMS" },
                                    ]
                                ).map(({ v, icon, label }) => (
                                    <button
                                        key={v}
                                        onClick={() => toggleChannel(v)}
                                        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${form.channels.includes(v)
                                            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-300"
                                            : "bg-indigo-50 text-indigo-400 hover:bg-indigo-100"
                                            }`}
                                    >
                                        <span>{icon}</span>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {isEvent && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Options
                                </label>
                                <div
                                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${form.requireRSVP
                                        ? "bg-indigo-50 border border-indigo-200"
                                        : "bg-slate-50 border border-slate-100"
                                        }`}
                                    onClick={() =>
                                        setForm({ ...form, requireRSVP: !form.requireRSVP })
                                    }
                                >
                                    <div>
                                        <p className="text-xs font-semibold text-slate-700">
                                            Require RSVP
                                        </p>
                                        <p className="text-[11px] text-slate-400">
                                            Track attendance
                                        </p>
                                    </div>
                                    <div
                                        className={`w-9 h-5 rounded-full relative transition-all ${form.requireRSVP ? "bg-indigo-600" : "bg-slate-200"
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.requireRSVP ? "left-4" : "left-0.5"
                                                }`}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-indigo-50 flex items-center justify-between">
                    <div className="text-xs text-slate-400">
                        {form.audienceType === "all"
                            ? "Will be sent to all candidates"
                            : form.audienceType === "department" && form.department
                                ? `Sending to ${form.department} team`
                                : form.audienceType === "selected"
                                    ? `${form.selectedCandidates.length} recipient${form.selectedCandidates.length !== 1 ? "s" : ""
                                    } selected`
                                    : "Choose audience above"}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className={`px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all shadow-sm ${form.isUrgent
                                ? "bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 shadow-rose-300"
                                : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-indigo-300"
                                }`}
                        >
                            {form.isUrgent ? "🔴 " : ""}
                            {form.type === "announcement"
                                ? "Send Announcement"
                                : form.type === "deadline"
                                    ? "Set Deadline"
                                    : "Schedule & Notify"}{" "}
                            →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}