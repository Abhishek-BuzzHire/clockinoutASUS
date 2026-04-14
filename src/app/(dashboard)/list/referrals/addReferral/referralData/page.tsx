"use client";

import ReferralForm from "@/components/Referrals/ReferralForm";
import { StepBadge } from "@/components/Referrals/StepBadge";
import { ReferralFormData } from "@/lib/types/ReferalTypes/referalindex";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

function ReferralDetailsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Receive parsed data passed via query param from upload page
    const initialData = useMemo<Partial<ReferralFormData>>(() => {
        const raw = searchParams.get("parsed");
        if (!raw) return {};
        try {
            return JSON.parse(decodeURIComponent(raw));
        } catch {
            return {};
        }
    }, [searchParams]);

    return (
        <main className="flex flex-col h-screen bg-sky-50 overflow-hidden">
            <header className="shrink-0 h-16 bg-sky-50 flex items-center px-6">
                <button
                    type="button"
                    onClick={() => router.push("/list/referrals/addReferral")}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-all"
                >
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back to Upload
                </button>

                <div className="flex-1 flex items-center justify-center gap-3">
                    <StepBadge index={1} label="Upload Resume" state="done" />
                    <div className="h-px w-12 bg-emerald-400" />
                    <StepBadge index={2} label="Candidate Details" state="active" />
                </div>

                <div className="w-24" />
            </header>

            <div className="flex flex-1 overflow-hidden rounded-lg m-4 bg-white">
                <ReferralForm initialData={initialData} />
            </div>
        </main>
    );
}

export default function ReferralDataPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-sm text-gray-400">Loading…</div>}>
            <ReferralDetailsContent />
        </Suspense>
    );
}