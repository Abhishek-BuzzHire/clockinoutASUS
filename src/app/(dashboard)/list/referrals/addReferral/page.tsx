"use client";

import RefResumeUpload from "@/components/Referrals/RefResumeUpload";
import ReferralForm from "@/components/Referrals/ReferralForm";
import { StepBadge } from "@/components/Referrals/StepBadge";
import { ReferralFormData } from "@/lib/types/ReferalTypes/referalindex";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Step = "upload" | "form";

export default function AddReferralPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("upload");
    const [parsedData, setParsedData] = useState<Partial<ReferralFormData>>({});

    const handleParsed = (data: Partial<ReferralFormData>) => {
        setParsedData(data);
        setStep("form");
    };

    const handleSkip = () => {
        setParsedData({});
        setStep("form");
    };

    const handleBack = () => {
        setStep("upload");
    };

    return (
        <main className="flex flex-col h-screen bg-sky-50 overflow-hidden">
            <header className="shrink-0 h-16 bg-sky-50 flex items-center px-6">
                <button
                    type="button"
                    onClick={step === "upload" ? () => router.push("/list/referrals") : handleBack}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-all"
                >
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    {step === "upload" ? "Back" : "Back to Upload"}
                </button>

                <div className="flex-1 flex items-center justify-center gap-3">
                    <StepBadge index={1} label="Upload Resume" state={step === "upload" ? "active" : "done"} />
                    <div className={`h-px w-12 ${step === "form" ? "bg-emerald-400" : "bg-gray-200"}`} />
                    <StepBadge index={2} label="Candidate Details" state={step === "form" ? "active" : "pending"} />
                </div>

                <div className="w-24" />
            </header>

            <div className="flex flex-1 overflow-hidden rounded-lg m-4 bg-white">
                {step === "upload" ? (
                    <RefResumeUpload onParsed={handleParsed} onSkip={handleSkip} />
                ) : (
                    <ReferralForm initialData={parsedData} />
                )}
            </div>
        </main>
    );
}