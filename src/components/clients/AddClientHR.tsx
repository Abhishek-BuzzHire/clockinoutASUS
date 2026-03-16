import { useState } from "react";

type Props = {
    onClose: () => void;
    clientId: number;
};

export default function AddClientHRForm({ onClose, clientId }: Props) {
    const [focused, setFocused] = useState<string | null>(null);
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [values, setValues] = useState({
        name: "",
        email: "",
        phone: "",
        job_title: "",
    });

    const handleChange = (field: string, value: string) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleBlur = (field: string) => {
        setFocused(null);
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const isInvalid = (key: string) =>
        touched[key] && !values[key as keyof typeof values];

    const allFilled = Object.values(values).every(Boolean);

    const handleSubmit = () => {
        const allTouched = Object.keys(values).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {}
        );
        setTouched(allTouched);

        if (!allFilled) return;

        const payload = {
            ...values,
            phone: `+91${values.phone}`,
            clientId,
        };
        console.log("Submitting HR:", payload);
        onClose();
    };

    const fields = [
        { key: "name", label: "Full Name", type: "text", placeholder: "Jane Smith" },
        { key: "email", label: "Email", type: "email", placeholder: "jane@acme.com" },
        { key: "job_title", label: "Job Title", type: "text", placeholder: "HR Manager" },
    ];

    const filledCount = Object.values(values).filter(Boolean).length;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 "
            onClick={onClose}
        >
            <div
                className="bg-white w-[460px] max-w-[calc(100vw-32px)] rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Progress bar */}
                <div className="h-1 bg-gray-100 w-full">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-500 rounded-full"
                        style={{ width: `${(filledCount / (fields.length + 1)) * 100}%` }}
                    />
                </div>

                {/* Header */}
                <div className="flex items-start justify-between px-7 pt-6 pb-0">
                    <div>
                        <p className="text-[10px] font-semibold tracking-widest uppercase text-indigo-500 mb-1">
                            New Record · Client #{clientId}
                        </p>
                        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
                            Add HR Contact
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center text-sm mt-1"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="px-7 py-6 flex flex-col gap-4">

                    {/* Regular fields */}
                    {fields.map((f) => {
                        const val = values[f.key as keyof typeof values];
                        const isFocused = focused === f.key;
                        const invalid = isInvalid(f.key);

                        return (
                            <div key={f.key} className="flex flex-col gap-1.5">
                                <label className={`text-[11px] font-semibold uppercase tracking-widest transition-colors
                                    ${invalid ? "text-red-400" : isFocused ? "text-indigo-500" : "text-gray-400"}`}>
                                    {f.label} <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={f.type}
                                        placeholder={f.placeholder}
                                        value={val}
                                        onChange={(e) => handleChange(f.key, e.target.value)}
                                        onFocus={() => setFocused(f.key)}
                                        onBlur={() => handleBlur(f.key)}
                                        className={`w-full rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border outline-none transition-all placeholder:text-gray-300
                                            ${invalid
                                                ? "border-red-300 bg-red-50 ring-2 ring-red-100"
                                                : isFocused
                                                    ? "border-indigo-400 bg-white ring-2 ring-indigo-100"
                                                    : val
                                                        ? "border-indigo-200 bg-white"
                                                        : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    />
                                    {invalid && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-xs font-medium">
                                            Required
                                        </span>
                                    )}
                                    {val && !invalid && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-400" />
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Phone field */}
                    <div className="flex flex-col gap-1.5">
                        <label className={`text-[11px] font-semibold uppercase tracking-widest transition-colors
                            ${isInvalid("phone") ? "text-red-400" : focused === "phone" ? "text-indigo-500" : "text-gray-400"}`}>
                            Phone <span className="text-red-400">*</span>
                        </label>
                        <div className={`flex rounded-xl border overflow-hidden transition-all
                            ${isInvalid("phone")
                                ? "border-red-300 ring-2 ring-red-100"
                                : focused === "phone"
                                    ? "border-indigo-400 ring-2 ring-indigo-100"
                                    : values.phone
                                        ? "border-indigo-200"
                                        : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <div className="flex items-center gap-1.5 px-3 bg-gray-50 border-r border-gray-200 text-sm font-medium text-gray-600 select-none whitespace-nowrap">
                                🇮🇳 +91
                            </div>
                            <div className="relative flex-1">
                                <input
                                    type="tel"
                                    placeholder="98765 43210"
                                    value={values.phone}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    onFocus={() => setFocused("phone")}
                                    onBlur={() => handleBlur("phone")}
                                    className="w-full px-4 py-2.5 text-sm text-gray-800 bg-white outline-none placeholder:text-gray-300"
                                />
                                {isInvalid("phone") && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-xs font-medium">
                                        Required
                                    </span>
                                )}
                                {values.phone && !isInvalid("phone") && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-400" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-100 my-1" />

                    {/* Actions */}
                    <div className="flex gap-2.5">
                        <button
                            onClick={handleSubmit}
                            className={`flex-1 flex items-center justify-center gap-2 text-white text-sm font-medium py-2.5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0
                                ${allFilled
                                    ? "bg-gray-900 hover:bg-gray-700"
                                    : "bg-gray-300 cursor-not-allowed hover:translate-y-0 hover:shadow-none"
                                }`}
                        >
                            Save HR Contact
                            <span className={allFilled ? "text-indigo-400" : "text-gray-400"}>→</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}