"use client";

import { ReferralFormData, ResumeParseResponse } from "@/lib/types/ReferalTypes/referalindex";
import { useRef, useState } from "react";

interface RefResumeUploadProps {
    onParsed: (data: Partial<ReferralFormData>) => void;
    onSkip: () => void;
}

export default function RefResumeUpload({ onParsed, onSkip }: RefResumeUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFile = async (file: File) => {
        setFileName(file.name);
        setError(null);
        setUploading(true);
        const fd = new FormData();
        fd.append("resume", file);
        try {
            const res = await fetch("/api/referrals?action=parse-resume", { method: "POST", body: fd });
            const json: ResumeParseResponse = await res.json();
            onParsed(json.data ?? {});
        } catch {
            setError("Parsing service unreachable — proceeding with empty form.");
            onParsed({});
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-1 items-center justify-center p-10 bg-sky-50 ">
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">

                {/* Card top accent */}
                <div className="h-1 bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-400" />

                <div className="p-5 flex flex-col gap-7">
                    {/* Header */}
                    <div className="flex flex-col items-center gap-3 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shadow-sm">
                            <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="12" y1="18" x2="12" y2="12" />
                                <line x1="9" y1="15" x2="15" y2="15" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Add a Referral</h1>
                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                Upload a resume to auto-fill the form,<br />or skip to fill it manually.
                            </p>
                        </div>
                    </div>

                    {/* Drop zone */}
                    <div
                        onClick={() => inputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                        className={[
                            "rounded-xl border-2 border-dashed p-9 flex flex-col items-center gap-3 cursor-pointer transition-all",
                            dragging
                                ? "border-indigo-400 bg-indigo-50 scale-[1.01]"
                                : fileName
                                    ? "border-emerald-400 bg-emerald-50 border-solid"
                                    : "border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/60",
                        ].join(" ")}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                        />

                        {uploading ? (
                            <div className="flex items-center gap-3 text-gray-500 text-sm">
                                <div className="w-5 h-5 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
                                Parsing resume…
                            </div>
                        ) : fileName ? (
                            <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {fileName}
                            </div>
                        ) : (
                            <>
                                <svg className="text-gray-300" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                <p className="text-sm text-gray-500 text-center">
                                    <span className="text-gray-800 font-semibold">Drop your resume here</span>
                                    <br />or click to browse
                                </p>
                                <p className="text-[11px] text-gray-400 font-mono bg-gray-100 px-2.5 py-1 rounded-full">
                                    PDF · DOC · DOCX — max 5 MB
                                </p>
                            </>
                        )}
                    </div>

                    {error && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                            {error}
                        </p>
                    )}

                    {/* Divider */}
                    <div className="flex items-center ">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-xs text-gray-400 font-medium">or</span>
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    {/* Skip */}
                    <button
                        type="button"
                        onClick={onSkip}
                        className="w-full py-2.5 rounded-xl border-2 border-gray-200 text-sm text-gray-600 font-semibold hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                    >
                        Skip — fill manually
                    </button>


                </div>
            </div>
        </div>
    );
}