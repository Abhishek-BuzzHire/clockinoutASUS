"use client";

import { useState } from "react";

type InterviewType = "technical" | "hr" | "managerial" | "final";
type InterviewMode = "in-person" | "video" | "phone";

interface Participant {
    id: string;
    name: string;
    email: string;
    role: "interviewer" | "interviewee" | "observer";
}

interface InterviewScheduleModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit?: (data: InterviewFormData) => void;
}

export interface InterviewFormData {
    title: string;
    type: InterviewType;
    mode: InterviewMode;
    date: string;
    time: string;
    duration: number;
    location: string;
    meetLink: string;
    participants: Participant[];
    notes: string;
    sendCalendarInvite: boolean;
    sendReminder: boolean;
    reminderMinutes: number;
}

const INTERVIEW_TYPES: { value: InterviewType; label: string }[] = [
    { value: "technical", label: "Technical" },
    { value: "hr", label: "HR Round" },
    { value: "managerial", label: "Managerial" },
    { value: "final", label: "Final Round" },
];

const DURATIONS = [15, 30, 45, 60, 90, 120];

export default function InterviewScheduleModal({
    open,
    onClose,
    onSubmit,
}: InterviewScheduleModalProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [form, setForm] = useState<InterviewFormData>({
        title: "",
        type: "technical",
        mode: "video",
        date: "",
        time: "",
        duration: 60,
        location: "",
        meetLink: "",
        participants: [],
        notes: "",
        sendCalendarInvite: true,
        sendReminder: true,
        reminderMinutes: 30,
    });

    const [participantInput, setParticipantInput] = useState({
        name: "",
        email: "",
        role: "interviewer" as Participant["role"],
    });

    if (!open) return null;

    const addParticipant = () => {
        if (!participantInput.name || !participantInput.email) return;
        setForm((prev) => ({
            ...prev,
            participants: [
                ...prev.participants,
                { ...participantInput, id: crypto.randomUUID() },
            ],
        }));
        setParticipantInput({ name: "", email: "", role: "interviewer" });
    };

    const removeParticipant = (id: string) => {
        setForm((prev) => ({
            ...prev,
            participants: prev.participants.filter((p) => p.id !== id),
        }));
    };

    const handleSubmit = () => {
        onSubmit?.(form);
        onClose();
    };

    const roleColors: Record<Participant["role"], string> = {
        interviewer: "bg-indigo-100 text-indigo-700",
        interviewee: "bg-violet-100 text-violet-700",
        observer: "bg-slate-100 text-slate-600",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-indigo-950/20 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl shadow-indigo-200/60 border border-indigo-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-indigo-200 text-xs font-semibold tracking-widest uppercase mb-1">
                                Schedule
                            </p>
                            <h2
                                className="text-white text-xl font-bold"
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                                Interview Session
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-indigo-200 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Steps */}
                    <div className="flex gap-2 mt-4">
                        {[
                            { n: 1, label: "Details" },
                            { n: 2, label: "Participants" },
                            { n: 3, label: "Settings" },
                        ].map(({ n, label }) => (
                            <button
                                key={n}
                                onClick={() => setStep(n as 1 | 2 | 3)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${step === n
                                        ? "bg-white text-indigo-700"
                                        : step > n
                                            ? "bg-white/30 text-white"
                                            : "bg-white/10 text-indigo-200"
                                    }`}
                            >
                                <span
                                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${step === n
                                            ? "bg-indigo-600 text-white"
                                            : step > n
                                                ? "bg-emerald-400 text-white"
                                                : "bg-white/20 text-indigo-200"
                                        }`}
                                >
                                    {step > n ? "✓" : n}
                                </span>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {/* Step 1: Details */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Interview Title
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Frontend Engineer – Round 2"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full border border-indigo-100 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Type
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {INTERVIEW_TYPES.map((t) => (
                                            <button
                                                key={t.value}
                                                onClick={() => setForm({ ...form, type: t.value })}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${form.type === t.value
                                                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-300"
                                                        : "bg-indigo-50 text-indigo-500 hover:bg-indigo-100"
                                                    }`}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Mode
                                    </label>
                                    <div className="flex gap-2">
                                        {(["video", "in-person", "phone"] as InterviewMode[]).map(
                                            (m) => (
                                                <button
                                                    key={m}
                                                    onClick={() => setForm({ ...form, mode: m })}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${form.mode === m
                                                            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-300"
                                                            : "bg-indigo-50 text-indigo-500 hover:bg-indigo-100"
                                                        }`}
                                                >
                                                    {m === "in-person"
                                                        ? "🏢"
                                                        : m === "video"
                                                            ? "📹"
                                                            : "📞"}{" "}
                                                    {m}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={form.date}
                                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                                        className="w-full border border-indigo-100 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        value={form.time}
                                        onChange={(e) => setForm({ ...form, time: e.target.value })}
                                        className="w-full border border-indigo-100 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Duration
                                    </label>
                                    <select
                                        value={form.duration}
                                        onChange={(e) =>
                                            setForm({ ...form, duration: Number(e.target.value) })
                                        }
                                        className="w-full border border-indigo-100 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    >
                                        {DURATIONS.map((d) => (
                                            <option key={d} value={d}>
                                                {d} min
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {form.mode === "in-person" && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Location / Room
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Conference Room B, 3rd Floor"
                                        value={form.location}
                                        onChange={(e) =>
                                            setForm({ ...form, location: e.target.value })
                                        }
                                        className="w-full border border-indigo-100 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    />
                                </div>
                            )}

                            {form.mode === "video" && (
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
                                        className="w-full border border-indigo-100 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Participants */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="bg-indigo-50 rounded-xl p-4">
                                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">
                                    Add Participant
                                </p>
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    <input
                                        placeholder="Full name"
                                        value={participantInput.name}
                                        onChange={(e) =>
                                            setParticipantInput({
                                                ...participantInput,
                                                name: e.target.value,
                                            })
                                        }
                                        className="border border-indigo-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                                    />
                                    <input
                                        placeholder="Email address"
                                        type="email"
                                        value={participantInput.email}
                                        onChange={(e) =>
                                            setParticipantInput({
                                                ...participantInput,
                                                email: e.target.value,
                                            })
                                        }
                                        className="border border-indigo-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                                    />
                                    <select
                                        value={participantInput.role}
                                        onChange={(e) =>
                                            setParticipantInput({
                                                ...participantInput,
                                                role: e.target.value as Participant["role"],
                                            })
                                        }
                                        className="border border-indigo-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white capitalize"
                                    >
                                        <option value="interviewer">Interviewer</option>
                                        <option value="interviewee">Interviewee</option>
                                        <option value="observer">Observer</option>
                                    </select>
                                </div>
                                <button
                                    onClick={addParticipant}
                                    className="w-full py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
                                >
                                    + Add
                                </button>
                            </div>

                            {form.participants.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-sm">
                                    No participants added yet
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {form.participants.map((p) => (
                                        <div
                                            key={p.id}
                                            className="flex items-center justify-between bg-white border border-indigo-100 rounded-xl px-4 py-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                    {p.name[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {p.name}
                                                    </p>
                                                    <p className="text-xs text-slate-400">{p.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${roleColors[p.role]
                                                        }`}
                                                >
                                                    {p.role}
                                                </span>
                                                <button
                                                    onClick={() => removeParticipant(p.id)}
                                                    className="text-slate-300 hover:text-red-400 transition-colors text-sm w-6 h-6 flex items-center justify-center"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Settings */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Internal Notes
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Add any notes for interviewers, topics to cover, etc."
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    className="w-full border border-indigo-100 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Notifications
                                </label>

                                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">
                                            Send Calendar Invite
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            Send .ics to all participants
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            setForm({
                                                ...form,
                                                sendCalendarInvite: !form.sendCalendarInvite,
                                            })
                                        }
                                        className={`w-10 h-6 rounded-full transition-all relative ${form.sendCalendarInvite ? "bg-indigo-600" : "bg-slate-200"
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.sendCalendarInvite ? "left-4" : "left-0.5"
                                                }`}
                                        />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">
                                            Send Reminder
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            Email reminder before the interview
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {form.sendReminder && (
                                            <select
                                                value={form.reminderMinutes}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        reminderMinutes: Number(e.target.value),
                                                    })
                                                }
                                                className="text-xs border border-indigo-200 rounded-lg px-2 py-1 text-indigo-700 bg-white"
                                            >
                                                <option value={15}>15 min</option>
                                                <option value={30}>30 min</option>
                                                <option value={60}>1 hr</option>
                                                <option value={120}>2 hrs</option>
                                                <option value={1440}>1 day</option>
                                            </select>
                                        )}
                                        <button
                                            onClick={() =>
                                                setForm({
                                                    ...form,
                                                    sendReminder: !form.sendReminder,
                                                })
                                            }
                                            className={`w-10 h-6 rounded-full transition-all relative ${form.sendReminder ? "bg-indigo-600" : "bg-slate-200"
                                                }`}
                                        >
                                            <span
                                                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.sendReminder ? "left-4" : "left-0.5"
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="border border-indigo-100 rounded-xl p-4 bg-gradient-to-br from-indigo-50 to-violet-50">
                                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
                                    Summary
                                </p>
                                <p className="text-sm font-bold text-slate-800">
                                    {form.title || "Untitled Interview"}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {form.type} · {form.mode} · {form.duration} min
                                </p>
                                {form.date && form.time && (
                                    <p className="text-xs text-slate-500">
                                        {new Date(`${form.date}T${form.time}`).toLocaleString()}
                                    </p>
                                )}
                                <p className="text-xs text-slate-500">
                                    {form.participants.length} participant
                                    {form.participants.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-indigo-50 flex items-center justify-between">
                    <button
                        onClick={() => step > 1 && setStep((step - 1) as 1 | 2 | 3)}
                        className={`text-sm font-semibold text-indigo-500 hover:text-indigo-700 transition-colors ${step === 1 ? "invisible" : ""
                            }`}
                    >
                        ← Back
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        {step < 3 ? (
                            <button
                                onClick={() => setStep((step + 1) as 2 | 3)}
                                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-300"
                            >
                                Continue →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all shadow-sm shadow-indigo-300"
                            >
                                Schedule Interview ✓
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}