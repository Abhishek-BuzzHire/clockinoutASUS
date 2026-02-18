// currently this component is getting data from this file's object but it has to fetch it from database for that we will later create a pipelineContainer.tsx. At the end of the file, this same code is modified to pass props :-jobs. 

// :- Future : filters implement like select jobs or recruiter that should be dynamic and change state according to selection like on SelectChange. Need to pass more props for this filteration.


import React from "react";

type Stage = {
    label: string;
    value: number;
};

type Job = {
    title: string;
    location: string;
    stages: Stage[];
};

// Example dataset
const jobs: Job[] = [
    {
        title: "Research and Development Officer",
        location: "Jogja",
        stages: [
            { label: "Applying Period", value: 55 },
            { label: "Screening", value: 40 },
            { label: "Background", value: 32 },
            { label: "Interviews", value: 28 },
            { label: "Technical Test", value: 14 },
        ],
    },
    {
        title: "Golang Back End Developer",
        location: "Jogja",
        stages: [
            { label: "Applying Period", value: 35 },
            { label: "Screening", value: 30 },
            { label: "Background", value: 16 },
            { label: "Interviews", value: 9 },
        ],
    },
    {
        title: "Principal Designer",
        location: "Purwokerto",
        stages: [
            { label: "Applying Period", value: 40 },
            { label: "Screening", value: 35 },
            { label: "Background", value: 25 },
        ],
    },
    {
        title: "Social Media Specialist",
        location: "Jogja",
        stages: [
            { label: "Applying Period", value: 55 },
            { label: "Screening", value: 30 },
            { label: "Hired", value: 2 }
        ],
    },
];

const Pipeline: React.FC = () => {
    const colors = [
        'bg-orange-500',
        'bg-blue-500',
        'bg-yellow-400 text-black',
        'bg-blueLight-500',
        'bg-teal-500',
        'bg-green-500',
        'bg-gray-300 text-black',

    ];
    // Collect all unique stage labels across jobs (for table headers)
    const allStageLabels = Array.from(
        new Set(jobs.flatMap((job) => job.stages.map((s) => s.label)))
    );

    return (
        <div className="w-full mx-auto">
            <div className="p-4 bg-white rounded-2xl shadow-lg">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Hiring Pipeline</h2>

                </div>
                {/* Filters Section */}
                <div className="flex items-center space-x-4 mb-6">
                    <div className="relative">
                        <select className="appearance-none bg-white border border-gray-300 rounded-lg py-2 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Select Jobs</option>
                            <option>Design Jobs</option>
                            <option>Engineering Jobs</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg
                                className="fill-current h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.293 12.95a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L10 10.586 6.707 7.293a1 1 0 00-1.414 1.414l4 4z" />
                            </svg>
                        </div>
                    </div>
                    <div className="relative">
                        <select className="appearance-none bg-white border border-gray-300 rounded-lg py-2 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Select Recruiter</option>
                            <option>John Jobs</option>
                            <option>Debby Jobs</option>
                            <option>Nieve Jobs</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg
                                className="fill-current h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.293 12.95a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L10 10.586 6.707 7.293a1 1 0 00-1.414 1.414l4 4z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <table className="table-auto w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="text-left font-semibold text-sm p-2 w-[150px]">Job Title</th>
                            {allStageLabels.map((label) => (
                                <th key={label} className="text-center font-normal text-sm text-gray-600 p-2 min-w-[100px]">
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {jobs.map((job, rowIndex) => (
                            <tr key={rowIndex} className="border-t border-gray-200">
                                <td className="p-4">
                                    <div>
                                        <div className="font-semibold text-gray-800 min-w-[250px]">{job.title}</div>
                                        <div className="text-sm text-gray-500">{job.location}</div>
                                    </div>
                                </td>
                                {allStageLabels.map((label) => {
                                    const stage = job.stages.find((s) => s.label === label);
                                    if (!stage) {
                                        return <td key={label} className="p-1"><div className="w-full h-10 relative">
                                            <div
                                                className="bg-gray-200  h-full rounded-md flex items-center justify-center text-xs font-semibold">
                                                <span>-</span>
                                            </div>
                                        </div>
                                        </td>;
                                    }
                                    const colorIndex = allStageLabels.findIndex(l => l === label);
                                    const color = colors[colorIndex] || 'bg-gray-200';
                                    return (
                                        <td key={label} className="p-1">
                                            <div className="w-full h-10 relative">
                                                <div
                                                    className={`
                            ${color}
                            h-full rounded-md flex items-center justify-center text-xs font-semibold
                            transform transition-all duration-300 ease-in-out
                          `}
                                                >
                                                    <span className={`${color.includes('text-black') ? 'text-black' : 'text-white'} z-10`}>{stage.value}</span>
                                                </div>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Pipeline;


// Dynamic Props code starts here


// import React from 'react';

// type Stage = {
//   label: string;
//   value: number;
// };

// type Job = {
//   title: string;
//   location: string;
//   stages: Stage[];
// };

// type PipelineProps = {
//   jobs: Job[];
//   allStageLabels: string[];
//   stageColors: Record<string, string>;
// };

// const Pipeline: React.FC<PipelineProps> = ({ jobs, allStageLabels, stageColors }) => {
//   return (
//     <div className="w-full md:w-2/3 mx-auto">
//       <div className="p-6 bg-white rounded-2xl shadow-lg">
//         {/* Header Section */}
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold">Hiring Pipeline</h2>
//         </div>

//         {/* Filters Section */}
//         <div className="flex items-center space-x-4 mb-6">
//           <div className="relative">
//             <select className="appearance-none bg-white border border-gray-300 rounded-lg py-2 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500">
//               <option>Design Jobs</option>
//               <option>Engineering Jobs</option>
//             </select>
//             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
//               <svg
//                 className="fill-current h-4 w-4"
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 20 20"
//               >
//                 <path d="M9.293 12.95a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L10 10.586 6.707 7.293a1 1 0 00-1.414 1.414l4 4z" />
//               </svg>
//             </div>
//           </div>
//         </div>

//         {/* Table Section */}
//         <table className="table-auto w-full border-collapse">
//           <thead>
//             <tr>
//               <th className="text-left font-semibold text-sm p-2 w-[150px]">Job Title</th>
//               {allStageLabels.map((label) => (
//                 <th key={label} className="text-center font-normal text-sm text-gray-600 p-2 min-w-[100px]">
//                   {label}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {jobs.map((job, rowIndex) => (
//               <tr key={rowIndex} className="border-t border-gray-200">
//                 <td className="p-4">
//                   <div>
//                     <div className="font-semibold text-gray-800 min-w-[250px]">{job.title}</div>
//                     <div className="text-sm text-gray-500">{job.location}</div>
//                   </div>
//                 </td>
//                 {allStageLabels.map((label) => {
//                   const stage = job.stages.find((s) => s.label === label);
//                   if (!stage) {
//                     return <td key={label} className="p-2"></td>;
//                   }
//                   const color = stageColors[label] || 'bg-gray-200';
//                   return (
//                     <td key={label} className="p-2">
//                       <div className="w-full h-8 bg-gray-200 rounded-full relative">
//                         <div
//                           className={`${color} h-full rounded-full flex items-center justify-center text-xs font-semibold transform transition-all duration-300 ease-in-out`}
//                           // This line is commented out because it was causing an error.
//                           // It will be replaced with a different approach to styling.
//                           // style={{ width: `${(stage.value / 100) * 100}%` }}
//                         >
//                           <span className={`${stageColors[label]?.includes('text-black') ? 'text-black' : 'text-white'} z-10`}>{stage.value}</span>
//                         </div>
//                       </div>
//                     </td>
//                   );
//                 })}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default Pipeline;
