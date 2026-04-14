"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Job, Skill } from "@/lib/types/jobs";
import { jobsApi } from "@/apis/jobs/route";
import { Trash2 } from "lucide-react";

interface JobSettingsProps {
    job: Job;
    onSave?: (updated: Partial<Job>) => void;
}

const toTextArray = (value: unknown): string[] => {
    const extractText = (item: unknown): string => {
        if (item == null) return "";

        if (typeof item === "string") return item.trim();
        if (typeof item === "number" || typeof item === "boolean") return String(item).trim();

        if (Array.isArray(item)) {
            return item.map(extractText).find(Boolean) ?? "";
        }

        if (typeof item === "object") {
            const record = item as Record<string, unknown>;

            const preferredKeys = [
                "text",
                "name",
                "title",
                "label",
                "value",
                "qualification",
                "requirement",
                "description",
            ];

            for (const key of preferredKeys) {
                const val = record[key];
                if (typeof val === "string" && val.trim()) return val.trim();
            }

            const firstString = Object.values(record).find(
                (val): val is string => typeof val === "string" && val.trim().length > 0
            );
            if (firstString) return firstString.trim();

            return Object.values(record).map(extractText).find(Boolean) ?? "";
        }

        return "";
    };

    if (value == null) return [];

    if (Array.isArray(value)) {
        return value.map(extractText).filter(Boolean);
    }

    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return [];

        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                return parsed.map(extractText).filter(Boolean);
            }
        } catch {
            // Treat as plain text when JSON parsing fails.
        }

        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            const inner = trimmed.slice(1, -1).trim();
            if (!inner) return [];

            return inner
                .split(",")
                .map((part) => part.trim().replace(/^['\"]|['\"]$/g, ""))
                .filter(Boolean);
        }

        return [trimmed];
    }

    return [];
};



// ─── EDIT-MODE sub-components (original JobSettings design) ───────────────────

// Bullet List Editor — full sentences
const BulletListEditor = ({
    items,
    onChange,
    placeholder,
}: {
    items: string[];
    onChange: (items: string[]) => void;
    placeholder?: string;
}) => {
    const [draft, setDraft] = useState("");
    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const [editingVal, setEditingVal] = useState("");
    const safeItems = Array.isArray(items) ? items : [];

    const add = () => {
        const t = draft.trim();
        if (!t) return;
        onChange([...safeItems, t]);
        setDraft("");
    };
    const remove = (idx: number) => onChange(safeItems.filter((_, i) => i !== idx));
    const startEdit = (idx: number) => { setEditingIdx(idx); setEditingVal(safeItems[idx]); };
    const commitEdit = () => {
        if (editingIdx === null) return;
        const t = editingVal.trim();
        if (!t) { remove(editingIdx); }
        else {
            const updated = [...safeItems];
            updated[editingIdx] = t;
            onChange(updated);
        }
        setEditingIdx(null);
        setEditingVal("");
    };

    return (
        <div className="space-y-3">
            {safeItems.length > 0 && (
                <ul className="space-y-1.5">
                    {safeItems.map((item, i) => (
                        <li key={i} className="group flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50 transition">
                            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-400 mt-[7px]" />
                            {editingIdx === i ? (
                                <input
                                    autoFocus
                                    value={editingVal}
                                    onChange={e => setEditingVal(e.target.value)}
                                    onBlur={commitEdit}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") { e.preventDefault(); commitEdit(); }
                                        if (e.key === "Escape") setEditingIdx(null);
                                    }}
                                    className="flex-1 text-sm text-slate-700 bg-white border border-indigo-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                />
                            ) : (
                                <span
                                    className="flex-1 text-sm text-slate-700 leading-relaxed cursor-text"
                                    onClick={() => startEdit(i)}
                                >
                                    {item}
                                </span>
                            )}
                            <button
                                onClick={() => remove(i)}
                                className="opacity-0 group-hover:opacity-100 transition text-slate-300 hover:text-red-400 text-xs flex-shrink-0 mt-0.5"
                            >✕</button>
                        </li>
                    ))}
                </ul>
            )}
            <div className="flex gap-2 pt-1">
                <input
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
                    placeholder={placeholder}
                    className="flex-1 text-sm bg-white border border-dashed border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent transition placeholder:text-slate-300"
                />
                <button
                    onClick={add}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-xl text-xs font-bold hover:bg-indigo-100 transition"
                >
                    + Add
                </button>
            </div>
        </div>
    );
};

// Tag List Editor — short pill chips
const TagListEditor = ({
    items,
    onChange,
    placeholder,
    accent = "indigo",
}: {
    items: string[];
    onChange: (items: string[]) => void;
    placeholder?: string;
    accent?: string;
}) => {
    const [draft, setDraft] = useState("");
    const safeItems = Array.isArray(items) ? items : [];

    const add = () => {
        const t = draft.trim();
        if (!t) return;
        onChange([...safeItems, t]);
        setDraft("");
    };
    const remove = (idx: number) => onChange(safeItems.filter((_, i) => i !== idx));

    const accentMap: Record<string, string> = {
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100",
        violet: "bg-violet-50 text-violet-600 border-violet-200 hover:bg-violet-100",
        sky: "bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100",
    };
    const pillMap: Record<string, string> = {
        indigo: "bg-indigo-50 text-indigo-700 border border-indigo-100",
        violet: "bg-violet-50 text-violet-700 border border-violet-100",
        sky: "bg-sky-50 text-sky-700 border border-sky-100",
    };

    return (
        <div className="space-y-2.5">
            <div className="flex gap-2">
                <input
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
                    placeholder={placeholder}
                    className="flex-1 text-sm bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
                />
                <button
                    onClick={add}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${accentMap[accent]}`}
                >
                    + Add
                </button>
            </div>
            {safeItems.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {safeItems.map((item, i) => (
                        <span key={i} className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${pillMap[accent]}`}>
                            {item}
                            <button
                                onClick={() => remove(i)}
                                className="text-current opacity-40 hover:opacity-100 transition leading-none"
                            >×</button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

// Skill Selector — debounced API search
const SkillSelector = ({
    selected,
    onChange,
}: {
    selected: Skill[];
    onChange: (skills: Skill[]) => void;
}) => {
    const [results, setResults] = useState<Skill[]>([]);
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [searching, setSearching] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!query.trim()) { setResults([]); setOpen(false); return; }
        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const raw = await jobsApi.searchSkills(query);
                const normalised: Skill[] = raw.map((s: any) => ({
                    skill_id: s.id ?? s.skill_id,
                    skill_name: s.name ?? s.skill_name,
                }));
                setResults(normalised);
                setOpen(true);
            } catch (err) { console.error("Skill search failed", err); }
            finally { setSearching(false); }
        }, 300);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [query]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const selectedIds = new Set(selected.map(s => String(s.skill_id)));
    const filtered = results.filter(s => !selectedIds.has(String(s.skill_id)));

    const addSkill = (skill: Skill) => { onChange([...selected, skill]); setQuery(""); setResults([]); setOpen(false); };
    const removeSkill = (id: string | number) => onChange(selected.filter(s => String(s.skill_id) !== String(id)));

    return (
        <div className="space-y-2.5" ref={containerRef}>
            <div className="relative">
                <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Type to search skills…"
                    className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 pr-9 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent transition placeholder:text-slate-300"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {searching ? (
                        <svg className="w-4 h-4 animate-spin text-slate-300" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                    ) : query ? (
                        <button
                            onMouseDown={e => { e.preventDefault(); setQuery(""); setResults([]); setOpen(false); }}
                            className="pointer-events-auto text-slate-300 hover:text-slate-500 text-lg leading-none"
                        >×</button>
                    ) : null}
                </span>
                {open && filtered.length > 0 && (
                    <ul className="absolute z-30 mt-1.5 w-full bg-white border border-slate-100 rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
                        {filtered.map(skill => (
                            <li key={skill.skill_id}>
                                <button
                                    onMouseDown={e => { e.preventDefault(); addSkill(skill); }}
                                    className="w-full text-left text-sm px-4 py-2.5 hover:bg-sky-50 hover:text-sky-700 text-slate-700 transition"
                                >
                                    {skill.skill_name}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                {open && !searching && query && filtered.length === 0 && (
                    <div className="absolute z-30 mt-1.5 w-full bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-sm text-slate-400">
                        No matching skills found
                    </div>
                )}
            </div>
            {selected.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selected.map(skill => (
                        <span key={skill.skill_id} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                            {skill.skill_name}
                            <button
                                onClick={() => removeSkill(skill.skill_id)}
                                className="text-current opacity-40 hover:opacity-100 transition leading-none"
                            >×</button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

// Section Card — edit mode card wrapper
const SectionCard = ({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
            <span className="text-base">{icon}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</span>
        </div>
        <div className="p-5">{children}</div>
    </div>
);

// Field label wrapper
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
        {children}
    </div>
);

const inputCls =
    "w-full text-sm bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition text-slate-800 placeholder:text-slate-300";

// ─── Delete Modal ─────────────────────────────────────────────────────────────
const DeleteModal = ({
    jobTitle, onClose, onConfirm, loading,
}: {
    jobTitle: string; onClose: () => void; onConfirm: () => void; loading: boolean;
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-[380px] overflow-hidden">
            <div className="px-6 pt-6 pb-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-4">
                    <span className="text-red-500 text-lg">🗑</span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">Delete this job?</h3>
                <p className="text-sm text-slate-400">
                    <span className="font-semibold text-slate-600">{jobTitle}</span> will be permanently removed. This action cannot be undone.
                </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
                <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition">
                    {loading ? "Deleting…" : "Yes, Delete"}
                </button>
            </div>
        </div>
    </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type }: { message: string; type: "success" | "error" }) => (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium ${type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
        <span>{type === "success" ? "✓" : "✕"}</span>
        {message}
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const JobSettings = ({ job, onSave }: JobSettingsProps) => {
    const router = useRouter();

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // State
    const [title, setTitle] = useState(job.job_title ?? "");
    const [location, setLocation] = useState(job.job_location ?? "");
    const [type, setType] = useState(job.job_type ?? "");
    const [status, setStatus] = useState(job.job_status ?? "");
    const [overview, setOverview] = useState(job.job_overview ?? "");
    const [minExp, setMinExp] = useState<string>(String(job.job_min_exp ?? ""));
    const [maxExp, setMaxExp] = useState<string>(String(job.job_max_exp ?? ""));
    const [minSalary, setMinSalary] = useState<number | "">(job.job_min_salary ?? "");
    const [maxSalary, setMaxSalary] = useState<number | "">(job.job_max_salary ?? "");
    const [responsibilities, setResponsibilities] = useState<string[]>(
        toTextArray(job.job_responsibilities)
    );
    const [qualifications, setQualifications] = useState<string[]>(
        toTextArray(job.job_qualification)
    );

    const initialSkills: Skill[] = (job.skills ?? []).map(s =>
        typeof s === "object" && "skill_id" in s
            ? { skill_id: s.skill_id, skill_name: s.skill_name ?? String(s.skill_id) }
            : { skill_id: Number(s), skill_name: String(s) }
    );
    const [skills, setSkills] = useState<Skill[]>(initialSkills);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleDiscard = () => {
        setTitle(job.job_title ?? "");
        setLocation(job.job_location ?? "");
        setType(job.job_type ?? "");
        setStatus(job.job_status ?? "");
        setOverview(job.job_overview ?? "");
        setMinExp(String(job.job_min_exp ?? ""));
        setMaxExp(String(job.job_max_exp ?? ""));
        setMinSalary(job.job_min_salary ?? "");
        setMaxSalary(job.job_max_salary ?? "");
        setResponsibilities(toTextArray(job.job_responsibilities));
        setQualifications(toTextArray(job.job_qualification));
        setSkills(initialSkills);
    };

    const handleSave = async () => {
        setSaving(true);
        const payload: Partial<Job> = {
            job_title: title,
            job_location: location,
            job_type: type,
            job_status: status,
            job_overview: overview,
            job_min_exp: minExp !== "" ? String(minExp) : undefined,
            job_max_exp: maxExp !== "" ? String(maxExp) : undefined,
            job_min_salary: minSalary !== "" ? Number(minSalary) : undefined,
            job_max_salary: maxSalary !== "" ? Number(maxSalary) : undefined,
            job_responsibilities: responsibilities,
            job_qualification: qualifications,
            skills: skills as any,
        };
        try {
            await jobsApi.updateJob(job.job_id, payload);
            onSave?.(payload);
            showToast("Job updated successfully", "success");
        } catch (err) {
            console.error("Update failed", err);
            showToast("Failed to save changes", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await jobsApi.deleteJob(job.job_id);
            router.push("/list/jobs");
        } catch (err) {
            console.error("Delete failed", err);
            showToast("Failed to delete job", "error");
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const jobTypeOptions = ["Full-time", "Part-time", "Contract", "Internship", "Remote", "Hybrid"];
    const jobStatusOptions = ["Opened", "Closed"];

    return (
        <>
            <div className="max-w-2xl mx-auto py-6 space-y-4">

                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <p className="text-xl text-slate-900 mt-0.5">
                            {job.client_name && (
                                <span className="font-medium text-slate-500">{job.client_name} </span>
                            )}
                        </p>
                    </div>

                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 text-sm font-medium text-red-400 border border-red-200 rounded-xl px-3 py-1 hover:bg-red-50 transition"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Job
                    </button>
                </div>

                {/* Basic Info */}
                <SectionCard icon="" title="Basic Information">
                    <div className="space-y-4">
                        <Field label="Job Title">
                            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Senior Product Designer" className={inputCls} />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Location">
                                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. New York, NY" className={inputCls} />
                            </Field>
                            <Field label="Job Type">
                                <select value={type} onChange={e => setType(e.target.value)} className={inputCls}>
                                    <option value="">Select type</option>
                                    {jobTypeOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </Field>
                        </div>
                        <Field label="Status">
                            <div className="flex gap-2 flex-wrap">
                                {jobStatusOptions.map(s => {
                                    const colorMap: Record<string, string> = {
                                        Opened: "border-emerald-300 bg-emerald-50 text-emerald-700",
                                        Closed: "border-red-300 bg-red-50 text-red-700",
                                    };
                                    const isSelected = status === s;
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => setStatus(s)}
                                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${isSelected ? colorMap[s] : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"}`}
                                        >
                                            {s}
                                        </button>
                                    );
                                })}
                            </div>
                        </Field>
                        <Field label="Overview">
                            <textarea value={overview} onChange={e => setOverview(e.target.value)} placeholder="Brief description of the role..." rows={3} className={`${inputCls} resize-none`} />
                        </Field>
                    </div>
                </SectionCard>

                {/* Experience & Salary */}
                <SectionCard icon="" title="Experience & Compensation">
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Min Experience">
                            <input value={minExp} onChange={e => setMinExp(e.target.value)} placeholder="e.g. 2 years" className={inputCls} />
                        </Field>
                        <Field label="Max Experience">
                            <input value={maxExp} onChange={e => setMaxExp(e.target.value)} placeholder="e.g. 5 years" className={inputCls} />
                        </Field>
                        <Field label="Min Salary ($)">
                            <input type="number" value={minSalary} onChange={e => setMinSalary(e.target.value === "" ? "" : Number(e.target.value))} placeholder="e.g. 60000" className={inputCls} />
                        </Field>
                        <Field label="Max Salary ($)">
                            <input type="number" value={maxSalary} onChange={e => setMaxSalary(e.target.value === "" ? "" : Number(e.target.value))} placeholder="e.g. 100000" className={inputCls} />
                        </Field>
                    </div>
                </SectionCard>

                {/* Qualifications */}
                <SectionCard icon="" title="Qualifications">
                    <BulletListEditor
                        items={qualifications}
                        onChange={setQualifications}
                        placeholder="Describe a qualification and press Enter to add…"
                    />
                </SectionCard>

                {/* Responsibilities */}
                <SectionCard icon="" title="Key Responsibilities">
                    <BulletListEditor
                        items={responsibilities}
                        onChange={setResponsibilities}
                        placeholder="Describe a responsibility and press Enter to add…"
                    />
                </SectionCard>


                {/* Skills */}
                <div>
                    <div className="px-8 bg-slate-50 pb-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                            Skills
                        </span>
                    </div>
                    <SkillSelector selected={skills} onChange={setSkills} />
                </div>

                {/* Action bar */}
                <div className="flex items-center justify-between pt-2">
                    <button
                        onClick={handleDiscard}
                        className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                    >
                        Discard Changes
                    </button>
                    <div className="flex gap-3 items-center">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition shadow-sm shadow-indigo-200"
                        >
                            {saving ? "Saving…" : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>

            {showDeleteModal && (
                <DeleteModal
                    jobTitle={job.job_title}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDelete}
                    loading={deleting}
                />
            )}

            {toast && <Toast message={toast.message} type={toast.type} />}
        </>
    );
};

export default JobSettings;