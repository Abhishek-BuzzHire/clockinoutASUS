import AddClientModal from "@/components/clients/AddClientModal";
import { useEffect, useState } from "react";
import { jobsApi } from "@/apis/jobs/route";
import { Job } from "@/lib/types/jobs";

type JobStatus = "open" | "closed" | "draft";
type Skill = { id: number; name: string };

// CHANGED: added industry field
type Client = {
    client_id: number | null;
    client_name: string;
    client_industry: string;
};

type Props = {
    onClose: () => void;
    onSuccess?: () => void;
    existingClients: Client[];
};

export default function AddJobModal({ onClose, onSuccess, existingClients }: Props) {
    const [focused, setFocused] = useState<string | null>(null);
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [showClientForm, setShowClientForm] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const [values, setValues] = useState({
        title: "",
        overview: "",
        location: "",
        min_exp: "",
        max_exp: "",
        status: "open" as JobStatus,
        min_salary: "",
        max_salary: "",
    });

    const [qualifications, setQualifications] = useState<string[]>([""]);
    const [responsibilities, setResponsibilities] = useState<string[]>([""]);

    // Skills
    const [skillInput, setSkillInput] = useState("");
    const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
    const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);
    const [skillSuggestions, setSkillSuggestions] = useState<Skill[]>([]);
    const [skillsLoading, setSkillsLoading] = useState(false);

    const fetchSkills = async (query: string) => {
        if (!query.trim()) {
            setSkillSuggestions([]);
            return;
        }
        setSkillsLoading(true);
        try {
            const data = await jobsApi.searchSkills(query);
            setSkillSuggestions(data);
        } catch (err) {
            console.error("Skill search failed", err);
            setSkillSuggestions([]);
        } finally {
            setSkillsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchSkills(skillInput), 800);
        return () => clearTimeout(timer);
    }, [skillInput]);

    const handleChange = (field: string, value: string) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleBlur = (field: string) => {
        setFocused(null);
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const isInvalid = (key: string) =>
        touched[key] && !values[key as keyof typeof values];

    const updateListItem = (
        list: string[],
        setList: React.Dispatch<React.SetStateAction<string[]>>,
        index: number,
        value: string
    ) => {
        const updated = [...list];
        updated[index] = value;
        setList(updated);
    };

    const addListItem = (
        list: string[],
        setList: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        if (list[list.length - 1].trim() !== "") setList([...list, ""]);
    };

    const removeListItem = (
        list: string[],
        setList: React.Dispatch<React.SetStateAction<string[]>>,
        index: number
    ) => {
        if (list.length === 1) setList([""]);
        else setList(list.filter((_, i) => i !== index));
    };

    const allFilled =
        !!selectedClient &&
        Object.entries(values)
            .filter(([key]) => key !== "status")
            .every(([, val]) => Boolean(val)) &&
        qualifications.some((q) => q.trim() !== "") &&
        responsibilities.some((r) => r.trim() !== "") &&
        selectedSkills.length > 0;

    const handleSubmit = async () => {
        const allTouched = Object.keys(values).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {}
        );
        setTouched(allTouched);
        if (!allFilled) return;

        const payload: Partial<Job> = {
            job_title: values.title,
            job_location: values.location,
            job_status: values.status,
            client_id: String(selectedClient!.client_id),
            job_overview: values.overview,
            job_min_exp: values.min_exp,
            job_max_exp: values.max_exp,
            job_qualification: qualifications.filter((q) => q.trim()),
            job_responsibilities: responsibilities.filter((r) => r.trim()),
            skill_ids: selectedSkills.map((s) => s.id),
            job_min_salary: toActualSalary(values.min_salary),
            job_max_salary: toActualSalary(values.max_salary),
        };

        setSubmitting(true);
        setSubmitError(null);
        try {
            await jobsApi.createJob(payload);
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error("Failed to create job", err);
            setSubmitError("Failed to post job. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleClientCreated = (client: Client) => {
        setSelectedClient(client);
        setShowClientForm(false);
    };

    const simpleFields = [
        { key: "title", label: "Job Title", type: "text", placeholder: "e.g. Senior Frontend Engineer" },
        { key: "overview", label: "Overview", type: "text", placeholder: "Brief description of the role…" },
        { key: "location", label: "Location", type: "text", placeholder: "e.g. New York, Remote" },
    ];

    const filledCount = [
        selectedClient ? "c" : "",
        ...Object.values(values).filter(Boolean),
        qualifications.some((q) => q.trim()) ? "q" : "",
        responsibilities.some((r) => r.trim()) ? "r" : "",
        selectedSkills.length > 0 ? "s" : "",
    ].filter(Boolean).length;

    const totalCount = Object.keys(values).length + 4;

    const statusOptions: { value: JobStatus; label: string; color: string }[] = [
        { value: "open", label: "Open", color: "bg-indigo-100 text-indigo-700 border-indigo-300" },
        { value: "draft", label: "Draft", color: "bg-amber-100 text-amber-700 border-amber-300" },
        { value: "closed", label: "Closed", color: "bg-red-100 text-red-600 border-red-300" },
    ];

    const [salaryUnit, setSalaryUnit] = useState<"thou" | "lakh" | "cr">("lakh");

    function toActualSalary(displayValue: string | number): number {
        const n = Number(displayValue);
        if (!n) return 0;
        if (salaryUnit === "lakh") return n * 100_000;
        if (salaryUnit === "cr") return n * 10_000_000;
        return n; // thou — no conversion, send as-is
    }

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                onClick={onClose}
            >
                <div
                    className="bg-white w-[520px] max-w-[calc(100vw-32px)] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Progress bar */}
                    <div className="h-1 bg-gray-100 w-full flex-shrink-0">
                        <div
                            className="h-full bg-indigo-500 transition-all duration-500 rounded-full"
                            style={{ width: `${(filledCount / totalCount) * 100}%` }}
                        />
                    </div>

                    {/* Header */}
                    <div className="flex items-start justify-between px-7 pt-6 pb-4 flex-shrink-0">
                        <div>
                            <p className="text-[10px] font-semibold tracking-widest uppercase text-indigo-500 mb-1">
                                New Posting
                            </p>
                            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
                                Add Job
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center text-sm mt-1"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Scrollable body */}
                    <div className="px-7 pb-7 flex flex-col gap-5 overflow-y-auto">

                        {/* ── CLIENT SELECTOR ── */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                                Client <span className="text-red-400">*</span>
                            </label>

                            {selectedClient ? (
                                // CHANGED: selected pill now shows industry if available
                                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50">
                                    <div className="flex items-center gap-3">
                                        <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-indigo-700 leading-tight">
                                                #{selectedClient.client_id} · {selectedClient.client_name}
                                            </span>
                                            {selectedClient.client_industry && (
                                                <span className="text-xs text-indigo-400 leading-tight mt-0.5">
                                                    {selectedClient.client_industry}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedClient(null)}
                                        className="text-indigo-300 hover:text-red-400 transition-colors text-xs ml-2"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <button
                                            onClick={() => setClientDropdownOpen((o) => !o)}
                                            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all outline-none
                                                ${clientDropdownOpen
                                                    ? "border-indigo-400 bg-white ring-2 ring-indigo-100"
                                                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                                                }`}
                                        >
                                            <span className="text-gray-400">Select existing client…</span>
                                            <span className="text-gray-400 text-xs">▾</span>
                                        </button>

                                        {clientDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setClientDropdownOpen(false)} />
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-52 overflow-y-auto">
                                                    {existingClients.length === 0 ? (
                                                        <p className="px-4 py-3 text-sm text-gray-400">No existing clients</p>
                                                    ) : (
                                                        existingClients.map((c, index) => (
                                                            // CHANGED: each row shows number · name · industry
                                                            <button
                                                                key={c.client_id ?? `client-${index}`}
                                                                onClick={() => { setSelectedClient(c); setClientDropdownOpen(false); }}
                                                                className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border-b border-gray-50 last:border-0"
                                                            >
                                                                {/* Left: number + name */}
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span className="text-xs font-semibold text-gray-400 flex-shrink-0">
                                                                        #{c.client_id}
                                                                    </span>
                                                                    <span className="font-medium truncate">{c.client_name}</span>
                                                                </div>
                                                                {/* Right: industry badge */}
                                                                {c.client_industry && (
                                                                    <span className="ml-3 flex-shrink-0 text-[10px] font-semibold uppercase tracking-wide bg-indigo-50 text-indigo-400 border border-indigo-100 px-2 py-0.5 rounded-md">
                                                                        {c.client_industry}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setShowClientForm(true)}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-indigo-300 text-indigo-500 hover:bg-indigo-50 text-xs font-semibold transition-all whitespace-nowrap"
                                    >
                                        <span className="text-sm leading-none">+</span> New Client
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ── SIMPLE FIELDS ── */}
                        {simpleFields.map((f) => {
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
                                        {invalid && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-xs font-medium">Required</span>}
                                        {val && !invalid && <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-400" />}
                                    </div>
                                </div>
                            );
                        })}

                        {/* ── QUALIFICATIONS & RESPONSIBILITIES ── */}
                        {[
                            { label: "Qualifications", list: qualifications, setList: setQualifications },
                            { label: "Responsibilities", list: responsibilities, setList: setResponsibilities },
                        ].map(({ label, list, setList }) => (
                            <div key={label} className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                                    {label} <span className="text-red-400">*</span>
                                </label>
                                <div className="flex flex-col gap-2">
                                    {list.map((item, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <span className="w-5 h-5 mt-2.5 flex-shrink-0 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center">
                                                {index + 1}
                                            </span>
                                            <textarea
                                                placeholder={`Add ${label.toLowerCase().slice(0, -1)}…`}
                                                value={item}
                                                rows={2}
                                                onChange={(e) => updateListItem(list, setList, index, e.target.value)}
                                                onFocus={() => setFocused(`${label}-${index}`)}
                                                onBlur={() => setFocused(null)}
                                                className={`flex-1 rounded-xl px-4 py-2 text-sm text-gray-800 bg-gray-50 border outline-none transition-all placeholder:text-gray-300 resize-none
                                                    ${focused === `${label}-${index}`
                                                        ? "border-indigo-400 bg-white ring-2 ring-indigo-100"
                                                        : item
                                                            ? "border-indigo-200 bg-white"
                                                            : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                            />
                                            <button
                                                onClick={() => removeListItem(list, setList, index)}
                                                className="mt-2 w-6 h-6 flex-shrink-0 rounded-full bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-400 transition-colors flex items-center justify-center text-xs"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addListItem(list, setList)}
                                        className="self-start flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all"
                                    >
                                        <span className="text-sm leading-none">+</span> Add {label.slice(0, -1)}
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* ── SKILLS ── */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                                Skills <span className="text-red-400">*</span>
                            </label>

                            {selectedSkills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-1">
                                    {selectedSkills.map((skill) => (
                                        <span
                                            key={skill.id}
                                            className="flex items-center gap-1.5 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-lg"
                                        >
                                            {skill.name}
                                            <button
                                                onClick={() =>
                                                    setSelectedSkills((prev) => prev.filter((s) => s.id !== skill.id))
                                                }
                                                className="text-indigo-400 hover:text-red-500 transition-colors leading-none"
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Type to search skills… "
                                    value={skillInput}
                                    onChange={(e) => {
                                        setSkillInput(e.target.value);
                                        setSkillDropdownOpen(true);
                                    }}
                                    onFocus={() => {
                                        setFocused("skill");
                                        setSkillDropdownOpen(true);
                                    }}
                                    onBlur={() => {
                                        setFocused(null);
                                        setTimeout(() => setSkillDropdownOpen(false), 200);
                                    }}
                                    className={`w-full rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border outline-none transition-all placeholder:text-gray-300
                                        ${focused === "skill"
                                            ? "border-indigo-400 bg-white ring-2 ring-indigo-100"
                                            : "border-gray-200 hover:border-gray-300"
                                        }`}
                                />

                                {skillsLoading && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 animate-pulse">
                                        Searching…
                                    </span>
                                )}

                                {skillDropdownOpen && skillSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-44 overflow-y-auto">
                                        {skillSuggestions
                                            .filter((s) => !selectedSkills.find((sel) => sel.id === s.id))
                                            .map((skill, index) => (
                                                <button
                                                    key={`${skill.id}-${index}`}
                                                    onMouseDown={() => {
                                                        setSelectedSkills((prev) => [...prev, skill]);
                                                        setSkillInput("");
                                                        setSkillDropdownOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                                >
                                                    {skill.name}
                                                </button>
                                            ))}
                                    </div>
                                )}

                                {skillDropdownOpen && !skillsLoading && skillInput.trim() && skillSuggestions.length === 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 px-4 py-3 text-sm text-gray-400">
                                        No skills found for "{skillInput}"
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── EXPERIENCE ── */}
                        <div className="flex gap-3">
                            {(["min_exp", "max_exp"] as const).map((key) => {
                                const label = key === "min_exp" ? "Min Experience (yrs)" : "Max Experience (yrs)";
                                const isFocused = focused === key;
                                const val = values[key];
                                const invalid = isInvalid(key);
                                return (
                                    <div key={key} className="flex-1 flex flex-col gap-1.5">
                                        <label className={`text-[11px] font-semibold uppercase tracking-widest transition-colors
                                            ${invalid ? "text-red-400" : isFocused ? "text-indigo-500" : "text-gray-400"}`}>
                                            {label} <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                placeholder="0"
                                                min={0}
                                                value={val}
                                                onChange={(e) => handleChange(key, e.target.value)}
                                                onFocus={() => setFocused(key)}
                                                onBlur={() => handleBlur(key)}
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
                                            {invalid && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-xs font-medium">Required</span>}
                                            {val && !invalid && <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-400" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── SALARY ── */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                                    Salary Range <span className="text-gray-300">(optional)</span>
                                </label>
                                <select
                                    value={salaryUnit}
                                    onChange={(e) => setSalaryUnit(e.target.value as "thou" | "lakh" | "cr")}
                                    className="text-xs rounded-lg px-2.5 py-1.5 border border-gray-200 bg-gray-50 text-gray-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
                                >
                                    <option value="thou">Thou / yr</option>
                                    <option value="lakh">Lakh / yr</option>
                                    <option value="cr">Cr / yr</option>
                                </select>
                            </div>
                            {/* Min / Max salary */}
                            {(["min_salary", "max_salary"] as const).map((key) => {
                                const label = key === "min_salary" ? "Min Salary" : "Max Salary";
                                const isFocused = focused === key;
                                const val = values[key];

                                return (
                                    <div key={key} className="flex-1 flex flex-col gap-1.5">
                                        <label className={`text-[10px] font-semibold uppercase tracking-widest transition-colors ${isFocused ? "text-indigo-500" : "text-gray-300"}`}>
                                            {label}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                placeholder="0"
                                                min={0}
                                                value={val}
                                                onChange={(e) => handleChange(key, e.target.value)}
                                                onFocus={() => setFocused(key)}
                                                onBlur={() => setFocused(null)}
                                                className={`w-full rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border outline-none transition-all placeholder:text-gray-300 ${isFocused
                                                    ? "border-indigo-400 bg-white ring-2 ring-indigo-100"
                                                    : val
                                                        ? "border-indigo-200 bg-white"
                                                        : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                            />
                                            {/* Unit hint inside input */}
                                            {!isFocused && (
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 pointer-events-none">
                                                    {salaryUnit === "lakh" ? "L" : salaryUnit === "cr" ? "Cr" : "K"}
                                                </span>
                                            )}
                                            {val && !isFocused && (
                                                <span className="absolute right-7 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-400" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>


                        {/* ── STATUS ── */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                                Status
                            </label>
                            <div className="flex gap-2">
                                {statusOptions.map((s) => (
                                    <button
                                        key={s.value}
                                        onClick={() => handleChange("status", s.value)}
                                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all
                                            ${values.status === s.value
                                                ? s.color + " shadow-sm"
                                                : "bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-gray-100" />
                        {submitError && (
                            <p className="text-xs text-red-500 text-center -mb-2">{submitError}</p>
                        )}

                        {/* ── ACTIONS ── */}
                        <div className="flex gap-2.5">
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className={`flex-1 flex items-center justify-center gap-2 text-white text-sm font-medium py-2.5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0
                                    ${allFilled && !submitting
                                        ? "bg-gray-900 hover:bg-gray-700"
                                        : "bg-gray-300 cursor-not-allowed hover:translate-y-0 hover:shadow-none"
                                    }`}
                            >
                                {submitting ? "Posting…" : "Post Job"}
                                <span className={allFilled && !submitting ? "text-indigo-400" : "text-gray-400"}>→</span>
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

            {showClientForm && (
                <AddClientModal
                    onClose={() => setShowClientForm(false)}
                    onClientCreated={handleClientCreated}
                />
            )}
        </>
    );
}