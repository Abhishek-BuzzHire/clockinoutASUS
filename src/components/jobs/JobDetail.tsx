import { Job } from "@/lib/types/jobs";

interface JobDetailProps {
    job: Job | null;
}

const normalizeArray = (val: unknown): string[] => {
    if (!val) return [];

    if (Array.isArray(val)) {
        return val.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof val !== "string") return [];

    const str = val.trim();

    if (!str.startsWith("[")) return str ? [str] : [];

    const inner = str.slice(1, -1).trim();
    const items: string[] = [];
    let current = "";
    let inQuote = false;
    let quoteChar = "";
    let i = 0;

    while (i < inner.length) {
        const ch = inner[i];

        if (!inQuote && (ch === '"' || ch === "'")) {
            inQuote = true;
            quoteChar = ch;
            i++;
            continue;
        }

        if (inQuote && ch === quoteChar) {
            if (inner[i + 1] === quoteChar) {
                current += ch;
                i += 2;
                continue;
            }
            inQuote = false;
            quoteChar = "";
            i++;
            continue;
        }

        if (!inQuote && ch === ",") {
            const trimmed = current.trim();
            if (trimmed) items.push(trimmed);
            current = "";
            i++;
            continue;
        }

        current += ch;
        i++;
    }

    const last = current.trim();
    if (last) items.push(last);

    return items
        .map((item) =>
            item
                .replace(/\\n/g, " ")
                .replace(/\s+/g, " ")
                .trim()
        )
        .filter(Boolean);
};

const cleanText = (text?: string | null) => {
    if (!text) return "";
    return text
        .replace(/\\n/g, " ")
        .replace(/\n/g, " ")
        .replace(/'/g, "")
        .replace(/\s+/g, " ")
        .trim();
};

const JobDetail = ({ job }: JobDetailProps) => {
    if (!job) return <div className="p-6 text-gray-400">Loading job...</div>;

    const responsibilities = normalizeArray(job.job_responsibilities);
    const qualifications = normalizeArray(job.job_qualification);

    const metaItemStyle =
        "flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border border-orange-200 bg-orange-50 text-orange-600";

    const metaDotStyle =
        "w-2 h-2 rounded-full border-2 border-orange-400 bg-transparent";

    const statusBaseStyle =
        "ml-auto text-xs font-semibold px-3 py-1 rounded-full border";

    const getStatusStyle = (status?: string) =>
        status?.toLowerCase() === "open"
            ? "bg-green-50 text-green-600 border-green-200"
            : "bg-gray-100 text-gray-500 border-gray-200";

    const formatExperience = (
        min?: string | number | null,
        max?: string | number | null
    ) => {
        const minVal = min != null ? Number(min) : null;
        const maxVal = max != null ? Number(max) : null;

        if (minVal != null && maxVal != null) return `${minVal} - ${maxVal} yrs exp`;
        if (minVal != null) return `${minVal}+ yrs exp`;
        if (maxVal != null) return `Up to ${maxVal} yrs exp`;
        return null;
    };

    return (
        <div className="w-full">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm overflow-auto">

                {/* Top strip */}
                <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400" />

                <div className="p-8 space-y-7">

                    {/* Header */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase">
                            {cleanText(job.client_name)}
                        </p>

                        <h1 className="text-2xl font-bold text-gray-900 leading-snug">
                            {cleanText(job.job_title)}
                        </h1>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">

                            {job.job_location && (
                                <span className={metaItemStyle}>
                                    <span className={metaDotStyle} />
                                    {cleanText(job.job_location)}
                                </span>
                            )}

                            {formatExperience(job.job_min_exp, job.job_max_exp) && (
                                <span className={metaItemStyle}>
                                    <span className={metaDotStyle} />
                                    {formatExperience(job.job_min_exp, job.job_max_exp)}
                                </span>
                            )}

                            {job.job_type && (
                                <span className={metaItemStyle}>
                                    <span className={metaDotStyle} />
                                    {cleanText(job.job_type)}
                                </span>
                            )}

                            <span className={`${statusBaseStyle} ${getStatusStyle(job.job_status)}`}>
                                {cleanText(job.job_status)}
                            </span>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                        <div className="space-y-2">
                            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                Must Have Skills
                            </h2>

                            <div className="flex flex-wrap gap-2">
                                {job.skills.map((s) => (
                                    <span
                                        key={s.skill_name}
                                        className="text-xs font-medium px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100"
                                    >
                                        {cleanText(s.skill_name)}
                                    </span>
                                ))}
                            </div>

                            {job.job_overview && (
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {cleanText(job.job_overview)}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Qualifications */}
                    {qualifications.length > 0 && (
                        <div className="space-y-2.5">
                            <h2 className="text-sm font-bold text-gray-900">Qualifications</h2>
                            <ul className="space-y-2">
                                {qualifications.map((q, i) => (
                                    <li key={i} className="flex gap-2.5 text-sm text-gray-600 leading-relaxed">
                                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                                        {q}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Responsibilities */}
                    {responsibilities.length > 0 && (
                        <div className="space-y-2.5">
                            <h2 className="text-sm font-bold text-gray-900">Responsibilities</h2>
                            <ul className="space-y-2">
                                {responsibilities.map((r, i) => (
                                    <li key={i} className="flex gap-2.5 text-sm text-gray-600 leading-relaxed">
                                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                                        {r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default JobDetail;