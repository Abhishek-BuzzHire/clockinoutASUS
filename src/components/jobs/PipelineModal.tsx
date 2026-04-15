"use client";
import { useState, useRef, useMemo } from "react";
import { EditPipelinePayload, Job, PipelineSavePayload } from "@/lib/types/jobs";
import { jobsApi } from "@/apis/jobs/route";


const STAGE_COLORS = [
    "#f97316", "#eab308", "#3b82f6", "#ef4444",
    "#14b8a6", "#22c55e", "#a855f7", "#6366f1",
];

const uid = () => Math.random().toString(36).slice(2, 8);

type UIStage = { id: string; name: string };

// ─── Delta types ────────────────────────────────────────────────────────────

/** What can change on an existing stage in a single PATCH */
type StageDelta = {
    stage_name?: string;
    order?: number;
    is_final?: boolean;
};

/** One entry in the PATCH body — id + only changed keys */
type StagePatchEntry = {
    id: number;          // the real DB stage id from EditPipelinePayload
    delta: StageDelta;
};

/** Full PATCH body sent to the server */
type PipelinePatchPayload = {
    pipeline_id: number;       // from existing.pipeline_id, NOT job.job_id
    pipeline_name?: string;    // only present when it actually changed
    stage_deltas: StagePatchEntry[];
    added_stages: { stage_name: string; order: number; is_final: boolean }[];
    removed_stage_ids: number[];
};

// ─── Component ───────────────────────────────────────────────────────────────

type PipelineModalProps = {
    job: Job;
    existing: EditPipelinePayload | null;
    onSaved: (result: EditPipelinePayload) => void;
    onCancel: () => void;
};

const PipelineModal = ({ job, existing, onSaved, onCancel }: PipelineModalProps) => {

    // ── Build initial UI stages from existing data (or empty for create) ──
    const initial: UIStage[] = existing?.stages.length
        ? existing.stages.map(s => ({ id: uid(), name: s.name }))
        : [];

    // ── STATE ────────────────────────────────────────────────────────────────

    const [stages, setStages] = useState<UIStage[]>(initial);
    const [newName, setNewName] = useState("");
    const [pipelineName, setPipelineName] = useState<string>(existing?.pipeline_name ?? "");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [dragIdx, setDragIdx] = useState<number | null>(null);
    const [overIdx, setOverIdx] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // ── SNAPSHOT ─────────────────────────────────────────────────────────────
    // Captured once on mount — the immutable "ground truth" for diffing.
    // Using useRef so it never re-initialises on re-renders.

    const snapshot = useRef<{
        pipelineName: string;
        stages: UIStage[];       // parallel array to existing?.stages for id mapping
        stageDbIds: number[];    // real DB ids from EditPipelinePayload, same order
    }>({
        pipelineName: existing?.pipeline_name ?? "",
        stages: initial.map(s => ({ ...s })),          // deep-copy
        stageDbIds: existing?.stages.map(s => s.id) ?? [],
    });

    // ── DIRTY TRACKING ───────────────────────────────────────────────────────
    // Recomputed cheaply on every render — drives the badge / save guard.

    const dirty = useMemo(() => {
        if (!existing) return false;   // create mode — always "dirty"
        if (pipelineName.trim() !== snapshot.current.pipelineName.trim()) return true;
        if (stages.length !== snapshot.current.stages.length) return true;
        return stages.some(
            (s, i) => s.name.trim() !== snapshot.current.stages[i]?.name.trim()
        );
    }, [pipelineName, stages, existing]);

    // ── DRAG HANDLERS ────────────────────────────────────────────────────────

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

    // ── STAGE MUTATION HELPERS ───────────────────────────────────────────────

    const add = () => {
        const trimmed = newName.trim();
        if (!trimmed) { setError("Stage name can't be empty."); return; }
        if (stages.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
            setError("A stage with that name already exists."); return;
        }
        setStages(prev => [...prev, { id: uid(), name: trimmed }]);
        setNewName("");
        setError("");
        inputRef.current?.focus();
    };

    const remove = (id: string) => setStages(prev => prev.filter(s => s.id !== id));
    const rename = (id: string, val: string) =>
        setStages(prev => prev.map(s => s.id === id ? { ...s, name: val } : s));

    // ── DELTA BUILDER ────────────────────────────────────────────────────────
    // Compares current state against snapshot, returns only the changed keys
    // per stage. Stages that are unchanged produce no entry at all.

    const buildDelta = (): PipelinePatchPayload => {
        const snap = snapshot.current;
        const snapIds = new Set(snap.stageDbIds);
        const currentIds = new Set<string>();   // UI ids of stages that existed before

        const stage_deltas: StagePatchEntry[] = [];
        const added_stages: PipelinePatchPayload["added_stages"] = [];

        stages.forEach((s, i) => {
            const snapIdx = snap.stages.findIndex(ss => ss.id === s.id);
            const isExisting = snapIdx !== -1;

            if (isExisting) {
                currentIds.add(s.id);
                const dbId = snap.stageDbIds[snapIdx];
                const delta: StageDelta = {};
                const isFinal = i === stages.length - 1;
                const wasName = snap.stages[snapIdx].name.trim();
                const wasOrder = snapIdx;
                const wasFinal = snapIdx === snap.stages.length - 1;

                if (s.name.trim() !== wasName) delta.stage_name = s.name.trim();
                if (i !== wasOrder) delta.order = i;
                if (isFinal !== wasFinal) delta.is_final = isFinal;

                if (Object.keys(delta).length > 0) {
                    stage_deltas.push({ id: dbId, delta });
                }
            } else {
                // Brand-new stage — goes into added_stages
                added_stages.push({
                    stage_name: s.name.trim(),
                    order: i,
                    is_final: i === stages.length - 1,
                });
            }
        });

        // Stages in the snapshot that are no longer in current = removed
        const removed_stage_ids = snap.stageDbIds.filter(
            (dbId, i) => !currentIds.has(snap.stages[i].id)
        );

        const payload: PipelinePatchPayload = {
            pipeline_id: existing!.pipeline_id,
            stage_deltas,
            added_stages,
            removed_stage_ids,
        };

        // Pipeline name only if it actually changed
        if (pipelineName.trim() !== snap.pipelineName.trim()) {
            payload.pipeline_name = pipelineName.trim();
        }

        return payload;
    };

    // ── SAVE HANDLER ─────────────────────────────────────────────────────────

    const handleSave = async () => {
        // ── Validation ──
        if (!pipelineName.trim()) { setError("Pipeline name can't be empty."); return; }
        if (stages.length === 0) { setError("Add at least one stage."); return; }
        const emptyStage = stages.find(s => !s.name.trim());
        if (emptyStage) { setError("All stage names must be filled in."); return; }

        // ── CREATE path — full POST payload, no diffing needed ──
        if (!existing) {
            const payload: PipelineSavePayload = {
                job_id: job.job_id,
                pipeline_name: pipelineName.trim(),
                stages: stages.map((s, i) => ({
                    stage_name: s.name.trim(),
                    order: i + 1,
                    is_final: i === stages.length - 1,
                })),
            };
            console.log("📦 Pipeline CREATE payload:", JSON.stringify(payload, null, 2));
            try {
                setSaving(true);
                setError("");
                const result = await jobsApi.savePipeline(payload);
                onSaved(result);
            } catch (err: any) {
                console.error(err);
                setError(err?.message ?? "Failed to save pipeline.");
            } finally {
                setSaving(false);
            }
            return;
        }

        // ── EDIT path — delta-only PATCH ──
        const deltaPayload = buildDelta();

        const noChanges =
            !deltaPayload.pipeline_name &&
            deltaPayload.stage_deltas.length === 0 &&
            deltaPayload.added_stages.length === 0 &&
            deltaPayload.removed_stage_ids.length === 0;

        if (noChanges) {
            // Nothing actually changed — skip the network call entirely
            onCancel();
            return;
        }

        console.log("📦 Pipeline PATCH delta:", JSON.stringify(deltaPayload, null, 2));

        // ── Optimistic snapshot of UI state before the request ──
        // Used to roll back the UI if the server rejects the PATCH.
        const preRequestStages = stages.map(s => ({ ...s }));
        const preRequestName = pipelineName;

        try {
            setSaving(true);
            setError("");
            const result = await jobsApi.updatePipeline(deltaPayload as any);

            // ── Commit: advance snapshot to new ground truth ──
            snapshot.current = {
                pipelineName: pipelineName.trim(),
                stages: stages.map(s => ({ ...s })),
                stageDbIds: result.stages?.map((s: any) => s.id) ?? snapshot.current.stageDbIds,
            };

            onSaved(result);
        } catch (err: any) {
            console.error(err);

            // ── Rollback: revert optimistic UI to pre-request state ──
            setStages(preRequestStages);
            setPipelineName(preRequestName);
            setError(err?.message ?? "Failed to update pipeline. Changes rolled back.");
        } finally {
            setSaving(false);
        }
    };

    // ── RENDER ───────────────────────────────────────────────────────────────

    const lastIdx = stages.length - 1;

    return (
        <div
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col"
            style={{ maxHeight: "88vh" }}
        >
            {/* ── Header ── */}
            <div className="px-6 pt-5 pb-4 border-b border-gray-100">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full
                                                 bg-violet-100 text-violet-600 uppercase tracking-wider">
                                {job.client_name ?? "Client"}
                            </span>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full
                                                 bg-gray-100 text-gray-500 font-mono">
                                #{job.job_id}
                            </span>

                            {/* ── Dirty indicator badge (edit mode only) ── */}
                            {existing && dirty && (
                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full
                                                     bg-amber-50 text-amber-500 border border-amber-200">
                                    Unsaved changes
                                </span>
                            )}
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">
                            Configure Hiring Pipeline
                        </h2>
                        <p className="text-sm text-gray-400 mt-0.5 truncate max-w-xs">
                            {job.job_title}
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-gray-300 hover:text-gray-500 transition-colors mt-0.5"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* ── Pipeline identifier ── */}
                <div className="mt-4">
                    <label className="text-[11px] font-semibold text-gray-400 uppercase
                                          tracking-widest block mb-1.5">
                        Pipeline Identifier
                    </label>
                    <div className={`flex items-center gap-2 border rounded-xl px-3 py-2
                                         transition-colors bg-gray-50
                                         ${error && !pipelineName.trim()
                            ? "border-red-300 focus-within:border-red-400"
                            : "border-gray-200 focus-within:border-blue-400"}`}>
                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                        <input
                            value={pipelineName}
                            onChange={e => { setPipelineName(e.target.value); setError(""); }}
                            placeholder="e.g. pipeline name"
                            className="flex-1 bg-transparent text-sm font-mono text-gray-800
                                           focus:outline-none placeholder:text-gray-300"
                        />
                    </div>
                </div>
            </div>

            {/* ── Stage list ── */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase
                                          tracking-widest block mb-1.5">
                    Add Stages
                </label>
                {stages.map((stage, idx) => {
                    const color = STAGE_COLORS[idx % STAGE_COLORS.length];
                    const isFinal = idx === lastIdx;
                    const isDragging = dragIdx === idx;
                    const isOver = overIdx === idx && dragIdx !== idx;

                    // Per-stage dirty indicator — only in edit mode
                    const snapIdx = snapshot.current.stages.findIndex(ss => ss.id === stage.id);
                    const isStageDirty = existing && snapIdx !== -1 &&
                        stage.name.trim() !== snapshot.current.stages[snapIdx].name.trim();
                    const isNewStage = existing && snapIdx === -1;

                    return (
                        <div
                            key={stage.id}
                            draggable
                            onDragStart={() => onDragStart(idx)}
                            onDragOver={e => onDragOver(e, idx)}
                            onDrop={() => onDrop(idx)}
                            onDragEnd={onDragEnd}
                            className={`
                                    group flex items-center gap-3 px-3 py-2.5 rounded-xl border
                                    transition-all duration-150 select-none
                                    ${isDragging ? "opacity-30 scale-95 shadow-none" : "opacity-100"}
                                    ${isOver
                                    ? "border-blue-300 bg-blue-50 shadow-sm"
                                    : isStageDirty
                                        ? "border-amber-200 bg-amber-50/40 hover:shadow-sm"
                                        : isNewStage
                                            ? "border-green-200 bg-green-50/40 hover:shadow-sm"
                                            : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"}
                                    cursor-grab active:cursor-grabbing
                                `}
                        >
                            <div className="w-1 h-8 rounded-full flex-shrink-0"
                                style={{ background: color }} />
                            <span className="text-[11px] font-bold text-gray-300 w-4
                                                 text-center flex-shrink-0">
                                {idx + 1}
                            </span>
                            <input
                                value={stage.name}
                                onChange={e => { rename(stage.id, e.target.value); setError(""); }}
                                placeholder="Stage name…"
                                className="flex-1 bg-transparent text-sm font-semibold text-gray-700
                                               focus:outline-none focus:text-gray-900 transition-colors
                                               placeholder:text-gray-300"
                            />
                            {/* Final badge or new-stage pill */}
                            {isNewStage ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full
                                                     bg-green-50 text-green-500 border border-green-200
                                                     flex-shrink-0">
                                    New
                                </span>
                            ) : isFinal ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full
                                                     bg-green-50 text-green-500 border border-green-200
                                                     flex-shrink-0">
                                    Final
                                </span>
                            ) : (
                                <span className="w-[46px] flex-shrink-0" />
                            )}
                            <svg className="w-3.5 h-3.5 text-gray-200 group-hover:text-gray-400
                                                flex-shrink-0 transition-colors"
                                fill="currentColor" viewBox="0 0 24 24">
                                <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
                                <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                                <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
                            </svg>
                            {stages.length > 1 && (
                                <button
                                    onClick={() => remove(stage.id)}
                                    className="opacity-0 group-hover:opacity-100 text-gray-300
                                                   hover:text-red-400 transition-all flex-shrink-0"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    );
                })}

                {/* ── Add stage row ── */}
                <div className="flex gap-2 pt-2">
                    <input
                        ref={inputRef}
                        value={newName}
                        onChange={e => { setNewName(e.target.value); setError(""); }}
                        onKeyDown={e => e.key === "Enter" && add()}
                        placeholder="New stage name…"
                        className="flex-1 text-sm border border-dashed border-gray-200 rounded-xl
                                       px-3.5 py-2 focus:outline-none focus:border-blue-400
                                       placeholder:text-gray-300 transition-colors bg-gray-50/50"
                    />
                    <button
                        onClick={add}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50
                                       text-white text-sm font-semibold px-4 py-2 rounded-xl
                                       transition-all flex items-center gap-1.5"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Add
                    </button>
                </div>

                {error && (
                    <p className="text-xs text-red-500 flex items-center gap-1 pl-1">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0
                                       001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                        {error}
                    </p>
                )}
            </div>

            {/* ── Footer ── */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5">
                <button
                    onClick={onCancel}
                    disabled={saving}
                    className="text-sm font-semibold text-gray-500 hover:text-gray-800
                                   disabled:opacity-50 px-5 py-2.5 rounded-xl border border-gray-200
                                   hover:border-gray-300 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving || (!!existing && !dirty)}
                    className="text-sm font-semibold text-white bg-green-500 hover:bg-green-600
                                   active:scale-95 disabled:opacity-40 px-6 py-2.5 rounded-xl
                                   transition-all flex items-center gap-2 shadow-sm shadow-green-200"
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
                            {existing ? "Update Pipeline" : "Save Pipeline"}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default PipelineModal;