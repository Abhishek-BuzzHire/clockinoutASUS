"use client";

import { fieldCls, inputCls, labelCls, textareaCls } from "@/lib/types/ReferalTypes/FieldStyles";
import { BasicInfo } from "@/lib/types/ReferalTypes/referalindex";

interface Props { data: BasicInfo; onChange: (d: BasicInfo) => void; }

export default function BasicInfoSection({ data, onChange }: Props) {
    const set = <K extends keyof BasicInfo>(k: K, v: BasicInfo[K]) =>
        onChange({ ...data, [k]: v });

    const setStr = (k: keyof BasicInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        set(k as any, e.target.value || null);

    // ✅ Safe setter (handles undefined profile_experience)
    const setExp = (field: "years" | "months", val: string) =>
        set("profile_experience", {
            ...(data.profile_experience ?? { years: null, months: null }),
            [field]: val ? Number(val) : null,
        });

    return (
        <div className="flex flex-col gap-5">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
                <div className={fieldCls}>
                    <label className={labelCls}>First Name</label>
                    <input className={inputCls} placeholder="Jane" value={data.firstName ?? ""} onChange={setStr("firstName")} />
                </div>
                <div className={fieldCls}>
                    <label className={labelCls}>Last Name</label>
                    <input className={inputCls} placeholder="Doe" value={data.lastName ?? ""} onChange={setStr("lastName")} />
                </div>
            </div>

            {/* Contact row */}
            <div className="grid grid-cols-2 gap-4">
                <div className={fieldCls}>
                    <label className={labelCls}>Email</label>
                    <input className={inputCls} type="email" placeholder="jane@example.com" value={data.email ?? ""} onChange={setStr("email")} />
                </div>
                <div className={fieldCls}>
                    <label className={labelCls}>Phone</label>
                    <input className={inputCls} type="tel" placeholder="+91 98765 43210" value={data.phone ?? ""} onChange={setStr("phone")} />
                </div>
            </div>

            {/* Location */}
            <div className={fieldCls}>
                <label className={labelCls}>Location</label>
                <input className={inputCls} placeholder="City, State, Country" value={data.location ?? ""} onChange={setStr("location")} />
            </div>

            {/* Current role */}
            <div className="grid grid-cols-2 gap-4">
                <div className={fieldCls}>
                    <label className={labelCls}>Current Designation</label>
                    <input className={inputCls} placeholder="Senior Engineer" value={data.current_designation ?? ""} onChange={setStr("current_designation")} />
                </div>
                <div className={fieldCls}>
                    <label className={labelCls}>Current Company</label>
                    <input className={inputCls} placeholder="Acme Corp" value={data.current_company ?? ""} onChange={setStr("current_company")} />
                </div>
            </div>

            {/* Experience years/months */}
            <div className="grid grid-cols-2 gap-4">
                <div className={fieldCls}>
                    <label className={labelCls}>Experience — Years</label>
                    <input
                        className={inputCls}
                        type="number"
                        min={0}
                        max={60}
                        placeholder="5"
                        value={data.profile_experience?.years ?? ""} // ✅ safe access
                        onChange={(e) => setExp("years", e.target.value)}
                    />
                </div>
                <div className={fieldCls}>
                    <label className={labelCls}>Experience — Months</label>
                    <input
                        className={inputCls}
                        type="number"
                        min={0}
                        max={11}
                        placeholder="6"
                        value={data.profile_experience?.months ?? ""} // ✅ safe access
                        onChange={(e) => setExp("months", e.target.value)}
                    />
                </div>
            </div>

            {/* CTC / Notice */}
            <div className="grid grid-cols-3 gap-4">
                <div className={fieldCls}>
                    <label className={labelCls}>Current CTC</label>
                    <input className={inputCls} placeholder="₹12 LPA" value={data.current_ctc ?? ""} onChange={setStr("current_ctc")} />
                </div>
                <div className={fieldCls}>
                    <label className={labelCls}>Expected CTC</label>
                    <input className={inputCls} placeholder="₹18 LPA" value={data.expected_ctc ?? ""} onChange={setStr("expected_ctc")} />
                </div>
                <div className={fieldCls}>
                    <label className={labelCls}>Notice Period (days)</label>
                    <input
                        className={inputCls}
                        type="number"
                        min={0}
                        placeholder="30"
                        value={data.notice_period_days ?? ""}
                        onChange={(e) => set("notice_period_days", e.target.value ? Number(e.target.value) : null)}
                    />
                </div>
            </div>

            {/* Summary */}
            <div className={fieldCls}>
                <label className={labelCls}>Professional Summary</label>
                <textarea
                    className={textareaCls}
                    rows={4}
                    placeholder="Brief background and key strengths…"
                    value={data.summary ?? ""}
                    onChange={setStr("summary")}
                />
            </div>
        </div>
    );
}
