"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Job } from "@/lib/types/jobs";
import { jobsApi } from "@/apis/jobs/route";

interface JobSettingsProps {
    job: Job;
    onSave?: (updated: Partial<Job>) => void;
}

// 🔥 NORMALIZER
const normalizeArray = (val: any): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
        return val.split(",").map(v => v.trim()).filter(Boolean);
    }
    return [];
};

// ─── Tag List Editor ─────────────────────────────
const TagListEditor = ({
    items,
    onChange,
    placeholder,
}: {
    items: string[];
    onChange: (items: string[]) => void;
    placeholder?: string;
}) => {
    const [draft, setDraft] = useState("");
    const safeItems = normalizeArray(items);

    const add = () => {
        const t = draft.trim();
        if (!t) return;
        onChange([...safeItems, t]);
        setDraft("");
    };

    const remove = (idx: number) =>
        onChange(safeItems.filter((_, i) => i !== idx));

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <input
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
                    placeholder={placeholder}
                    className="flex-1 text-sm bg-slate-50 border border-dashed border-slate-300 rounded-lg px-3 py-2"
                />
                <button onClick={add} className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold">
                    + Add
                </button>
            </div>

            {safeItems.length > 0 && (
                <ul className="space-y-1.5">
                    {safeItems.map((item, i) => (
                        <li key={i} className="flex justify-between bg-slate-50 px-3 py-2 rounded-lg text-sm">
                            {item}
                            <button onClick={() => remove(i)} className="text-red-400">✕</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// ─── Delete Modal ─────────────────────────────
const DeleteModal = ({
    jobTitle,
    onClose,
    onConfirm,
    loading,
}: {
    jobTitle: string;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
}) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
        <div className="bg-white p-6 rounded-xl w-[350px] space-y-4">
            <h3 className="font-bold text-lg">Delete Job?</h3>
            <p className="text-sm text-gray-500">
                Are you sure you want to delete <b>{jobTitle}</b>? This cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 border rounded-lg">
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg"
                >
                    {loading ? "Deleting..." : "Delete"}
                </button>
            </div>
        </div>
    </div>
);

// ─── Main Component ─────────────────────────────
const JobSettings = ({ job, onSave }: JobSettingsProps) => {
    const router = useRouter();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [title, setTitle] = useState(job.job_title ?? "");
    const [location, setLocation] = useState(job.job_location ?? "");
    const [type, setType] = useState(job.job_type ?? "");
    const [overview, setOverview] = useState(job.job_overview ?? "");

    const [responsibilities, setResponsibilities] = useState(
        normalizeArray(job.job_responsibilities)
    );
    const [qualifications, setQualifications] = useState(
        normalizeArray(job.job_qualification)
    );

    const isDirty =
        title !== (job.job_title ?? "") ||
        location !== (job.job_location ?? "") ||
        type !== (job.job_type ?? "") ||
        overview !== (job.job_overview ?? "") ||
        JSON.stringify(responsibilities) !== JSON.stringify(normalizeArray(job.job_responsibilities)) ||
        JSON.stringify(qualifications) !== JSON.stringify(normalizeArray(job.job_qualification));

    const handleSave = () => {
        onSave?.({
            job_title: title,
            job_location: location,
            job_type: type,
            job_overview: overview,
            job_responsibilities: responsibilities,
            job_qualification: qualifications,
        });
    };

    const handleDiscard = () => {
        setTitle(job.job_title ?? "");
        setLocation(job.job_location ?? "");
        setType(job.job_type ?? "");
        setOverview(job.job_overview ?? "");
        setResponsibilities(normalizeArray(job.job_responsibilities));
        setQualifications(normalizeArray(job.job_qualification));
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await jobsApi.deleteJob(job.job_id);
            router.push("/list/jobs");
        } catch (err) {
            console.error("Delete failed", err);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <div className="space-y-6 mt-6 max-w-2xl">

                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Job Title" />
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" />
                <input value={type} onChange={e => setType(e.target.value)} placeholder="Type" />

                <textarea value={overview} onChange={e => setOverview(e.target.value)} placeholder="Overview" />

                <TagListEditor
                    items={responsibilities}
                    onChange={setResponsibilities}
                    placeholder="Add responsibility"
                />

                <TagListEditor
                    items={qualifications}
                    onChange={setQualifications}
                    placeholder="Add qualification"
                />

                <div className="flex justify-between">
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="text-red-500"
                    >
                        Delete Job
                    </button>

                    <div className="flex gap-3">
                        {isDirty && (
                            <button onClick={handleDiscard}>Discard</button>
                        )}
                        <button onClick={handleSave} disabled={!isDirty}>
                            Save
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
        </>
    );
};

export default JobSettings;