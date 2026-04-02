"use client";

import { fieldCls, inputCls, labelCls, textareaCls } from "@/lib/types/ReferalTypes/FieldStyles";
import { BasicInfo } from "@/lib/types/ReferalTypes/referalindex";

interface Props { data: BasicInfo; onChange: (d: BasicInfo) => void; }

export default function BasicInfoSection({ data, onChange }: Props) {
    const set = (k: keyof BasicInfo, v: string) => onChange({ ...data, [k]: v || null });

    return (
        <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
                <div className={fieldCls}>
                    <label className={labelCls}>First Name</label>
                    <input className={inputCls} placeholder="Jane" value={data.firstName ?? ""} onChange={(e) => set("firstName", e.target.value)} />
                </div>
                <div className={fieldCls}>
                    <label className={labelCls}>Last Name</label>
                    <input className={inputCls} placeholder="Doe" value={data.lastName ?? ""} onChange={(e) => set("lastName", e.target.value)} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className={fieldCls}>
                    <label className={labelCls}>Email</label>
                    <input className={inputCls} type="email" placeholder="jane@example.com" value={data.email ?? ""} onChange={(e) => set("email", e.target.value)} />
                </div>
                <div className={fieldCls}>
                    <label className={labelCls}>Phone</label>
                    <input className={inputCls} type="tel" placeholder="+91 98765 43210" value={data.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
                </div>
            </div>
            <div className={fieldCls}>
                <label className={labelCls}>Location</label>
                <input className={inputCls} placeholder="City, State, Country" value={data.location ?? ""} onChange={(e) => set("location", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className={fieldCls}>
                    <label className={labelCls}>LinkedIn URL</label>
                    <input className={inputCls} placeholder="linkedin.com/in/janedoe" value={data.linkedIn ?? ""} onChange={(e) => set("linkedIn", e.target.value)} />
                </div>
                <div className={fieldCls}>
                    <label className={labelCls}>Portfolio / Website</label>
                    <input className={inputCls} placeholder="janedoe.dev" value={data.portfolio ?? ""} onChange={(e) => set("portfolio", e.target.value)} />
                </div>
            </div>
            <div className={fieldCls}>
                <label className={labelCls}>Professional Summary</label>
                <textarea className={textareaCls} rows={4} placeholder="Brief background and key strengths…" value={data.summary ?? ""} onChange={(e) => set("summary", e.target.value)} />
            </div>
        </div>
    );
}