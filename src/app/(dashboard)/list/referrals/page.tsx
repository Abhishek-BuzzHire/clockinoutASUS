"use client";

import ReferralForm from "@/components/Referrals/ReferralForm";
import RefResumeUpload from "@/components/Referrals/RefResumeUpload";
import { ReferralFormData } from "@/lib/types/ReferalTypes/referalindex";
import { useState } from "react";

type Step = "upload" | "form";

export default function ReferralsPage() {
    const [step, setStep] = useState<Step>("upload");
    const [parsed, setParsed] = useState<Partial<ReferralFormData> | undefined>();

    const handleParsed = (data: Partial<ReferralFormData>) => {
        setParsed(data);
        setStep("form");
    };

    const handleSkip = () => {
        setParsed(undefined);
        setStep("form");
    };

    return (
        <main className="flex flex-col h-screen bg-sky-50 overflow-hidden">

            {/* ── Top bar ─────────────────────────────────────────────────────── */}
            <header className="shrink-0 h-16 bg-sky-50 flex items-center px-6 z-50">

                {/* Left section (Back button) */}
                <div className="w-40 flex items-center">
                    {step === "form" && (
                        <button
                            type="button"
                            onClick={() => setStep("upload")}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-all"
                        >
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <line x1="19" y1="12" x2="5" y2="12" />
                                <polyline points="12 19 5 12 12 5" />
                            </svg>
                            Back
                        </button>
                    )}
                </div>

                {/* ── Center Stepper ── */}
                <div className="flex-1 flex items-center justify-center gap-3">

                    {/* Step 1 */}
                    <div className={`flex items-center gap-2 text-xs font-medium transition-colors ${step === "upload" ? "text-indigo-600" : "text-emerald-600"
                        }`}>
                        <span className={[
                            "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold border-2",
                            step === "upload"
                                ? "bg-indigo-50 border-indigo-500 text-indigo-600"
                                : "bg-emerald-50 border-emerald-500 text-emerald-600",
                        ].join(" ")}>
                            {step === "form" ? (
                                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            ) : "1"}
                        </span>
                        <span className="hidden sm:block">Upload Resume</span>
                    </div>

                    {/* Connector */}
                    <div className={`h-px w-12 ${step === "form" ? "bg-emerald-400" : "bg-gray-200"
                        }`} />

                    {/* Step 2 */}
                    <div className={`flex items-center gap-2 text-xs font-medium transition-colors ${step === "form" ? "text-indigo-600" : "text-gray-400"
                        }`}>
                        <span className={[
                            "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold border-2",
                            step === "form"
                                ? "bg-indigo-50 border-indigo-500 text-indigo-600"
                                : "bg-gray-50 border-gray-300 text-gray-400",
                        ].join(" ")}>
                            2
                        </span>
                        <span className="hidden sm:block">Candidate Details</span>
                    </div>
                </div>

                {/* Right spacer */}
                <div className="w-40" />
            </header>

            {/* ── Content ─────────────────────────────────────────────────────── */}
            <div className="flex flex-1 overflow-hidden rounded-lg m-4 bg-white">
                {step === "upload" ? (
                    <RefResumeUpload onParsed={handleParsed} onSkip={handleSkip} />
                ) : (
                    <ReferralForm initialData={parsed} />
                )}
            </div>
        </main>
    );
}