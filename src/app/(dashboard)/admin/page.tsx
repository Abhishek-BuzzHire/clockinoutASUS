'use client'

import CVCount, { CVUserData } from "@/components/dashboard/CVCount"
import UpcomingEvents from "@/components/dashboard/UpcomingEvents"
import RecentRequests from "@/components/dashboard/RecentRequests"
import DailyOverview from "@/components/dashboard/DailyOverview"
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { apiUrl } from "@/lib/data";
import { format } from "date-fns";

interface CVCountData {
    date: string;
    users: CVUserData[];
}

const AdminDashboard = () => {
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
                <div className='p-6 flex flex-col gap-6 bg-slate-50 min-h-screen'>
                    {/* TOP ROW: Live Pulse */}
                    <div className="w-full">
                        <DailyOverview />
                    </div>

                    {/* BOTTOM ROW: Content Grid */}
                    <div className="flex flex-col lg:flex-row gap-6 w-full">
                        {/* LEFT COLUMN: Actions & Requests */}
                        <div className="w-full lg:w-2/3 flex flex-col gap-6">
                            <div className="flex-1">
                                <RecentRequests />
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Recruitment & Events */}
                        <div className="w-full lg:w-1/3 flex flex-col gap-6">
                            <div>
                                <CVCount data={todayCVData} loading={loading} />
                            </div>
                            <div>
                                <UpcomingEvents />
                            </div>
                        </div>
                    </div>
                </div>
        </>
    )
}

export default AdminDashboard