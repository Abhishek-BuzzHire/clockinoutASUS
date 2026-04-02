import { clientApi } from "@/apis/clients/routes";
import { useState } from "react";
import { ClientPayload } from "@/lib/types/jobs";

type Props = {
    onClose: () => void;
    onClientCreated: (client: { client_id: number | null; client_name: string; client_industry: string }) => void;
};

export default function AddClientModal({ onClose, onClientCreated }: Props) {
    const [focused, setFocused] = useState<string | null>(null);
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [values, setValues] = useState<ClientPayload>({
        client_name: "",
        client_industry: "",
    });

    const handleChange = (field: keyof ClientPayload, value: string) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleBlur = (field: string) => {
        setFocused(null);
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const isInvalid = (key: string) => touched[key] && !values[key as keyof ClientPayload];
    const allFilled = Object.values(values).every(Boolean);

    const handleSubmit = async () => {
        const allTouched = Object.keys(values).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {}
        );
        setTouched(allTouched);
        if (!allFilled) return;

        const payload: ClientPayload = {
            client_name: values.client_name,
            client_industry: values.client_industry,
        };

        try {
            setIsLoading(true);
            // Change the onClientCreated call in handleSubmit
            const newClient = await clientApi.createClient(payload);
            onClientCreated({
                client_id: newClient.client_id,
                client_name: newClient.client_name,
                client_industry: newClient.client_industry,
            });
        } catch (error) {
            console.error("Failed to create client:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fields: { key: keyof ClientPayload; label: string; type: string; placeholder: string }[] = [
        { key: "client_name", label: "Company Name", type: "text", placeholder: "Acme Corporation" },
        { key: "client_industry", label: "Industry", type: "text", placeholder: "Technology, Finance…" },
    ];

    const filledCount = Object.values(values).filter(Boolean).length;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
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
                        style={{ width: `${(filledCount / fields.length) * 100}%` }}
                    />
                </div>

                {/* Header */}
                <div className="flex items-start justify-between px-7 pt-6 pb-0">
                    <div>
                        <h2 className="text-[16px] font-semibold tracking-widest uppercase text-indigo-500 mb-1">
                            Add New Client
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
                    {fields.map((f) => {
                        const val = values[f.key] ?? "";
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
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-xs font-medium">Required</span>
                                    )}
                                    {val && !invalid && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-400" />
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    <div className="h-px bg-gray-100 my-1" />

                    {/* Actions */}
                    <div className="flex gap-2.5">
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className={`flex-1 flex items-center justify-center gap-2 text-white text-sm font-medium py-2.5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0
                                ${allFilled && !isLoading
                                    ? "bg-gray-900 hover:bg-gray-700"
                                    : "bg-gray-300 cursor-not-allowed hover:translate-y-0 hover:shadow-none"
                                }`}
                        >
                            {isLoading ? "Saving..." : "Save & Continue"}
                            <span className={allFilled && !isLoading ? "text-indigo-400" : "text-gray-400"}>→</span>
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