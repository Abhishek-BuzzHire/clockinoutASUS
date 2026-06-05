'use client'

import CVCount, { CVUserData } from "@/components/dashboard/CVCount"
import Pipeline from "@/components/dashboard/Pipeline"
import WeeklyStats from "@/components/dashboard/WeeklyStats"
import RecentActivity from "@/components/dashboard/RecentActivity"
import UpcomingEvents from "@/components/dashboard/UpcomingEvents"
import RecentRequests from "@/components/dashboard/RecentRequests"
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
            <>
                <div className='p-4 flex gap-4 flex-col md:flex-row bg-blueLight-50 min-h-screen'>
                    {/* LEFT / CENTER AREA - New Widgets */}
                    <div className="w-full lg:w-2/3 flex flex-col gap-4">
                        {/* Top Row: Activity & Events */}
                        <div className="flex flex-col md:flex-row gap-4 h-[350px]">
                            <div className="w-full md:w-1/2 h-full">
                                <RecentActivity />
                            </div>
                            <div className="w-full md:w-1/2 h-full">
                                <UpcomingEvents />
                            </div>
                        </div>
                        {/* Bottom Row: Recent Requests */}
                        <div className="w-full mt-2">
                            <RecentRequests />
                        </div>
                    </div>

                    {/* RIGHT AREA - Existing CV Count */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-4">
                        <CVCount data={todayCVData} loading={loading}/>
                    </div>
                </div>
            </>
        </>
    )
}

export default AdminDashboard