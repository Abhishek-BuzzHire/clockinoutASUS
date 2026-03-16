import { Job } from "@/lib/types/jobs";

// Type props for JobCard
const JobCard = ({ job }: { job: Job }) => (
    <div
        className={`bg-white p-4 rounded-lg border-t-4 flex flex-col justify-between ${job.status === 'Draft' ? "border-gray-300" : "border-green-400"}`}
        style={{ minWidth: "200px" }}
    >
        <div>
            <span className="text-sm font-semibold text-gray-400">{job.client}</span>
            <h3 className="text-xl font-bold mt-1">{job.title}</h3>
        </div>
        <div className="block items-center mt-4">
            <span className="text-sm text-gray-400">Candidates:</span>
            <div className="flex gap-12 mt-2 w-full p-8 pl-4 bg-sky-50 rounded-md">
                <div className="border-l-2 pl-2 border-gray-300">
                    <span className="text-gray-500 text-md font-semibold block mb-3">TOTAL</span>
                    <span className="text-3xl"> {job.candidates.total}</span>
                </div>
                <div className="border-l-2 pl-2 border-green-400">
                    <span className="text-gray-500 text-md font-semibold block mb-3">NEW</span>
                    <span className="text-3xl">{job.candidates.new}</span>
                </div>
            </div>
        </div>
        <div className="flex items-center space-x-4 text-sm font-semibold text-gray-400 mt-4">
            <span>{job.location}</span>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <span>{job.type}</span>
        </div>
        <div className="flex items-center justify-between mt-4">
            <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${job.status === "Draft"
                    ? "bg-gray-200 text-gray-600"
                    : "bg-green-100 text-green-600"
                    }`}
            >
                {job.status}
            </span>
            <a
                href={`/jobs/${job.id}`}
                className="flex items-center text-sm font-semibold text-blue-600 hover:underline"
            >
                See Details
                <svg
                    className="ml-1 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                    ></path>
                </svg>
            </a>
        </div>
    </div>
);

export default JobCard