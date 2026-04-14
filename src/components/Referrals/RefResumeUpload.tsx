"use client";

import React, { useRef, useState } from "react";
import { ReferralFormData } from "@/lib/types/ReferalTypes/referalindex";
import { uploadAndParseRefResume } from "@/apis/referrals/route";

type UploadState = "idle" | "uploading" | "done" | "error";

interface RefResumeUploadProps {
    /** Called with parsed resume data on success */
    onParsed: (data: Partial<ReferralFormData>) => void;
    /** Called when user wants to skip and fill manually */
    onSkip?: () => void;
}

const RefResumeUpload: React.FC<RefResumeUploadProps> = ({ onParsed, onSkip }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [state, setState] = useState<UploadState>("idle");
    const [fileName, setFileName] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);

    const processFile = async (file: File) => {
        setFileName(file.name);
        setState("uploading");
        setErrorMsg(null);

        try {
            const parsedData = await uploadAndParseRefResume(file);
            console.log("[RefResumeUpload] parsed data received:", parsedData);
            setState("done");
            onParsed(parsedData); // ✅ pass parsed JSON to parent, not the File
        } catch (error) {
            console.error("[RefResumeUpload] upload error:", error);
            setState("error");
            setErrorMsg("Failed to parse resume. Try again or skip.");
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await processFile(file);
        // reset input so same file can be re-uploaded
        e.target.value = "";
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        await processFile(file);
    };

    return (
        <div className="flex flex-1 items-center justify-center p-10 bg-sky-50">
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                {/* top accent bar */}
                <div className="h-1 bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-400" />

                <div className="p-6 flex flex-col gap-6">
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
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Upload Resume</h1>
                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                Auto-fill candidate details from resume,<br />or skip to fill manually.
                            </p>
                        </div>
                    </div>

                    {/* Drop zone */}
                    <div
                        onClick={() => state !== "uploading" && fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); if (state !== "uploading") setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        className={[
                            "rounded-xl border-2 border-dashed p-9 flex flex-col items-center gap-3 transition-all",
                            state === "uploading" ? "cursor-not-allowed opacity-70" : "cursor-pointer",
                            dragging
                                ? "border-indigo-400 bg-indigo-50 scale-[1.01]"
                                : state === "done"
                                    ? "border-emerald-400 bg-emerald-50 border-solid"
                                    : state === "error"
                                        ? "border-red-300 bg-red-50 border-solid"
                                        : "border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/60",
                        ].join(" ")}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        {state === "uploading" && (
                            <div className="flex flex-col items-center gap-3 text-gray-500 text-sm">
                                <div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
                                <span>
                                    Parsing <span className="font-semibold text-gray-700">{fileName}</span>…
                                </span>
                                <span className="text-xs text-gray-400">This may take a few seconds</span>
                            </div>
                        )}

                        {state === "done" && (
                            <div className="flex flex-col items-center gap-2 text-emerald-600 text-sm">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <span className="font-semibold">{fileName}</span>
                                <span className="text-xs text-emerald-500">Parsed successfully — redirecting…</span>
                            </div>
                        )}

                        {state === "error" && (
                            <div className="flex flex-col items-center gap-2 text-red-500 text-sm">
                                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                </div>
                                <span className="font-semibold">Upload failed</span>
                                <span className="text-xs text-red-400">Click to try again</span>
                            </div>
                        )}

                        {state === "idle" && (
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

                    {/* Error message */}
                    {state === "error" && errorMsg && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                            ⚠️ {errorMsg}
                        </p>
                    )}

                    {onSkip && (
                        <>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-gray-100" />
                                <span className="text-xs text-gray-400 font-medium">or</span>
                                <div className="flex-1 h-px bg-gray-100" />
                            </div>
                            <button
                                type="button"
                                onClick={onSkip}
                                disabled={state === "uploading"}
                                className="w-full py-2.5 rounded-xl border-2 border-gray-200 text-sm text-gray-600 font-semibold hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Skip — fill manually
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RefResumeUpload;