"use client";

import { fieldCls, labelCls, inputCls, textareaCls } from "@/lib/types/ReferalTypes/FieldStyles";


interface Props {
    jobId: string | null;
    referredBy: string | null;
    referralNote: string | null;
    onChange: (key: "jobId" | "referredBy" | "referralNote", value: string) => void;
}

export default function ReferralMetaSection({ jobId, referredBy, referralNote, onChange }: Props) {
    return (
        <div className="flex flex-col gap-5">
            <div className={fieldCls}>
                <label className={labelCls}>Job ID / Position</label>
                <input
                    className={inputCls}
                    placeholder="JOB-2024-001 or 'Senior Frontend Engineer'"
                    value={jobId ?? ""}
                    onChange={(e) => onChange("jobId", e.target.value)}
                />
                <p className="text-[11px] text-slate-600">The position this candidate is being referred for.</p>
            </div>

            <div className={fieldCls}>
                <label className={labelCls}>Referred By</label>
                <input
                    className={inputCls}
                    placeholder="Your name or employee ID"
                    value={referredBy ?? ""}
                    onChange={(e) => onChange("referredBy", e.target.value)}
                />
            </div>

            <div className={fieldCls}>
                <label className={labelCls}>Referral Note</label>
                <textarea
                    className={textareaCls}
                    rows={4}
                    placeholder="Why are you referring this candidate? What makes them a great fit?"
                    value={referralNote ?? ""}
                    onChange={(e) => onChange("referralNote", e.target.value)}
                />
            </div>

            <div className="flex items-start gap-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <svg className="text-indigo-400 shrink-0 mt-0.5" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-xs text-slate-400 leading-relaxed">
                    After submission, this referral will be added to the pipeline at the{" "}
                    <span className="text-indigo-300 font-medium">Applied</span> stage. Track it from the Referrals dashboard.
                </p>
            </div>
        </div>
    );
}