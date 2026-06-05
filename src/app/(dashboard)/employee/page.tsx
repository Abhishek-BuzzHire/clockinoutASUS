'use client';

import CVCount from "@/components/dashboard/CVCount";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";

const EmployeeDashboard = () => {
    return (
        <div className='p-6 flex flex-col gap-5 bg-[#F4F5F7] min-h-screen'>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
                {/* LEFT COLUMN */}
                <div className="flex flex-col gap-5">
                    {/* Future employee components */}
                </div>

                {/* RIGHT COLUMN */}
                <div className="flex flex-col gap-5">
                    <CVCount />
                    <UpcomingEvents />
                </div>
            </div>
        </div>
    )
}

export default EmployeeDashboard