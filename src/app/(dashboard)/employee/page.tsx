'use client';

import CVCount from "@/components/dashboard/CVCount";
import { apiUrl } from "@/lib/data";
import { CVCountData, CVUserData } from "@/lib/types";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const EmployeeDashboard = () => {
    const [todayCVData, setTodayCVData] = useState<CVUserData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchTodayCVCounts = async () => {
        try {
            const token = Cookies.get('access');
            const today = format(new Date(), 'yyyy-MM-dd'); // Format today's date as YYYY-MM-DD
            // console.log("today's date: ", today);

            const response = await axios.get<CVCountData[]>(
                `${apiUrl}/api/cv-count/`,
                {
                    params: { start_date: today },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Since we only requested today, we take the first day's user list
            if (response.data.length > 0) {
                setTodayCVData(response.data[0].users);
            }
        } catch (error) {
            console.error("Error fetching CV counts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodayCVCounts();
    }, []);

    return (
        <>
            <>
                <div className='p-4 flex gap-4 flex-col md:flex-row bg-blueLight-50'>
                    <div className="w-full lg:w-2/3 flex flex-col">
                        {/* < Pipeline /> */}
                        {/* < WeeklyStats /> */}
                    </div>
                    <div className="w-full lg:w-1/3 flex flex-col gap-4">
                        <CVCount data={todayCVData} loading={loading}/>
                    </div>
                </div>
            </>
        </>
    )
}

export default EmployeeDashboard