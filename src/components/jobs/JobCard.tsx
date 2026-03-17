import { Job } from "@/lib/types/jobs";

const JobCard = ({ job, onDeleted }: { job: Job; onDeleted?: (id: number) => void }) => (
    <div
        className={`bg-white p-4 rounded-lg border-t-4 flex flex-col justify-between ${job.job_status === "Draft" ? "border-gray-300" : "border-green-400"
            }`}
        style={{ minWidth: "200px" }}
    >
        <div>
            <span className="text-sm font-semibold text-gray-400">
                {job.client_name ?? "Unknown"}
            </span>
            <h3 className="text-xl font-bold mt-1">{job.job_title ?? job.job_title}</h3>
        </div>

        <div className="flex gap-12 mt-2 w-full p-8 pl-4 bg-sky-50 rounded-md">
            <div className="border-l-2 pl-2 border-gray-300">
                <span className="text-gray-500 text-md font-semibold block mb-3">TOTAL</span>
                <span className="text-3xl">{job.total_candidates ?? 0}</span>
            </div>
            <div className="border-l-2 pl-2 border-green-400">
                <span className="text-gray-500 text-md font-semibold block mb-3">NEW</span>
                <span className="text-3xl">{job.new_candidates ?? 0}</span>
            </div>
        </div>

        <div className="flex items-center space-x-4 text-sm font-semibold text-gray-400 mt-4">
            <span>{job.job_location}</span>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <span>{job.job_type}</span>
        </div>

        <div className="flex items-center justify-between mt-4">
            <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${job.job_status === "draft"
                    ? "bg-gray-200 text-gray-600"
                    : "bg-green-100 text-green-600"
                    }`}
            >
                {job.job_status ?? "Published"}
            </span>

            <a
                href={`/jobs/${job.job_id}`}
                className="flex items-center text-sm font-semibold text-blue-600 hover:underline"
            >
                See Details
                <svg
                    className="ml-1 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </a>
        </div>
    </div>
);

export default JobCard;