"use client";
import { useState, useRef } from "react";
import { Job } from "@/lib/types/jobs";
import { JobPipelinePayload } from "@/lib/types/jobs";

const STAGE_COLORS = [
    "#f97316", "#eab308", "#3b82f6", "#ef4444",
    "#14b8a6", "#22c55e", "#a855f7", "#6366f1",
];

const uid = () => Math.random().toString(36).slice(2, 8);

// Internal UI model — just id + name; order and is_final are derived on save
type UIStage = { id: string; name: string };

type PipelineFormProps = {
    job: Job;
    existing: JobPipelinePayload | null;
    saving: boolean;
    onSave: (stageNames: string[]) => void;
    onCancel: () => void;
};

const PipelineForm = ({ job, existing, saving, onSave, onCancel }: PipelineFormProps) => {
    const initial: UIStage[] = existing?.stages.length
        ? existing.stages.map(s => ({ id: uid(), name: s.name }))
        : [{ id: uid(), name: "Screening" }];

    const [stages, setStages] = useState<UIStage[]>(initial);
    const [newName, setNewName] = useState("");
    const [error, setError] = useState("");
    const [dragIdx, setDragIdx] = useState<number | null>(null);
    const [overIdx, setOverIdx] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    /* ── Mutations ── */
    const add = () => {
        const trimmed = newName.trim();
        if (!trimmed) { setError("Stage name can't be empty."); return; }
        if (stages.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
            setError("A stage with that name already exists.");
            return;
        }
        setStages(prev => [...prev, { id: uid(), name: trimmed }]);
        setNewName("");
        setError("");
        inputRef.current?.focus();
    };

    const remove = (id: string) => setStages(prev => prev.filter(s => s.id !== id));

    const rename = (id: string, val: string) =>
        setStages(prev => prev.map(s => s.id === id ? { ...s, name: val } : s));

    /* ── Drag-to-reorder ── */
    const onDragStart = (idx: number) => setDragIdx(idx);
    const onDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setOverIdx(idx); };
    const onDrop = (idx: number) => {
        if (dragIdx === null || dragIdx === idx) return;
        const next = [...stages];
        const [moved] = next.splice(dragIdx, 1);
        next.splice(idx, 0, moved);
        setStages(next);
        setDragIdx(null);
        setOverIdx(null);
    };
    const onDragEnd = () => { setDragIdx(null); setOverIdx(null); };

    /* ── Save — passes only names; routes.ts derives order + is_final ── */
    const handleSave = () => {
        if (stages.length === 0) { setError("Add at least one stage."); return; }
        onSave(stages.map(s => s.name));
    };

    const lastIdx = stages.length - 1;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div
                className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                style={{ maxHeight: "90vh" }}
            >
                {/* ── Header ── */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                        {job.client_name ?? "Client"}
                    </p>
                    <h2 className="text-xl font-bold text-gray-900">Configure Hiring Pipeline</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{job.job_title}</p>
                </div>

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                    <p className="text-xs text-gray-400 mb-3">
                        Drag to reorder · Click a name to rename · Last stage is auto-marked&nbsp;
                        <span className="font-semibold text-green-600">Final</span>
                    </p>

                    {stages.map((stage, idx) => {
                        const color = STAGE_COLORS[idx % STAGE_COLORS.length];
                        const isFinal = idx === lastIdx;
                        const isDragging = dragIdx === idx;
                        const isOver = overIdx === idx && dragIdx !== idx;

                        return (
                            <div
                                key={stage.id}
                                draggable
                                onDragStart={() => onDragStart(idx)}
                                onDragOver={e => onDragOver(e, idx)}
                                onDrop={() => onDrop(idx)}
                                onDragEnd={onDragEnd}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-150
                                    ${isDragging ? "opacity-40 scale-95" : "opacity-100"}
                                    ${isOver ? "border-blue-400 bg-blue-50" : "border-gray-100 bg-gray-50"}
                                    hover:border-gray-300 cursor-grab active:cursor-grabbing`}
                            >
                                {/* colour dot */}
                                <span className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ background: color }} />

                                {/* order badge */}
                                <span className="text-xs font-bold text-gray-400 w-5 text-center select-none">
                                    {idx + 1}
                                </span>

                                {/* editable name */}
                                <input
                                    value={stage.name}
                                    onChange={e => rename(stage.id, e.target.value)}
                                    className="flex-1 bg-transparent text-sm font-semibold text-gray-800
                                               focus:outline-none border-b border-transparent
                                               focus:border-blue-400 transition-colors"
                                />

                                {/* is_final badge — shown on last item */}
                                {isFinal && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full
                                                     bg-green-100 text-green-600 flex-shrink-0">
                                        Final
                                    </span>
                                )}

                                {/* drag handle */}
                                <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                                </svg>

                                {/* remove */}
                                {stages.length > 1 && (
                                    <button onClick={() => remove(stage.id)}
                                        className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    {/* ── Add stage ── */}
                    <div className="flex gap-2 pt-2">
                        <input
                            ref={inputRef}
                            value={newName}
                            onChange={e => { setNewName(e.target.value); setError(""); }}
                            onKeyDown={e => e.key === "Enter" && add()}
                            placeholder="New stage name…"
                            className="flex-1 text-sm border border-dashed border-gray-300 rounded-xl
                                       px-4 py-2.5 focus:outline-none focus:border-blue-400
                                       placeholder:text-gray-300 transition-colors"
                        />
                        <button
                            onClick={add}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white
                                       text-sm font-semibold px-4 py-2 rounded-xl transition-colors
                                       flex items-center gap-1.5"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Add
                        </button>
                    </div>
                    {error && <p className="text-xs text-red-500 pl-1">{error}</p>}
                </div>

                {/* ── Payload preview ── */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                        Payload Preview
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {stages.map((s, i) => (
                            <span key={s.id}
                                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full text-white
                                    ${i === lastIdx ? "ring-2 ring-green-400 ring-offset-1" : ""}`}
                                style={{ background: STAGE_COLORS[i % STAGE_COLORS.length] }}
                                title={`order: ${i}${i === lastIdx ? " · is_final: true" : ""}`}
                            >
                                {s.name || "…"}
                            </span>
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5">
                        Ringed pill = <span className="text-green-600 font-semibold">is_final: true</span>
                    </p>
                </div>

                {/* ── Footer ── */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={saving}
                        className="text-sm font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-50
                                   px-5 py-2 rounded-xl border border-gray-200 hover:border-gray-400 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="text-sm font-semibold text-white bg-green-500 hover:bg-green-600
                                   disabled:opacity-60 px-6 py-2 rounded-xl transition-colors flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M12 4v4m0 8v4m8-8h-4M8 12H4" />
                                </svg>
                                Saving…
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Save Pipeline
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PipelineForm;