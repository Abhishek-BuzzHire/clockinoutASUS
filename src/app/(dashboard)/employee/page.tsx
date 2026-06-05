'use client';

import CVCount from "@/components/dashboard/CVCount";

const EmployeeDashboard = () => {
    return (
        <>
            <>
                <div className='p-4 flex gap-4 flex-col md:flex-row bg-blueLight-50'>
                    <div className="w-full lg:w-2/3 flex flex-col">
                        {/* <Pipeline /> */}
                        {/* <WeeklyStats /> */}
                    </div>
                    <div className="w-full lg:w-1/3 flex flex-col gap-4">
                        <CVCount />
                    </div>
                </div>
            </>
        </>
    )
}

export default EmployeeDashboard