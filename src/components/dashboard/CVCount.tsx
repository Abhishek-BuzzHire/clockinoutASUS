"use client";

import { PieChart, Pie, ResponsiveContainer, Tooltip } from 'recharts';
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '@/lib/data';
import { format, subDays, addDays, isToday } from 'date-fns';

const getFirstName = (fullName: string) => {
    return fullName ? fullName.split(' ')[0] : 'Unknown';
};

const colors = [
    "#E24B4A", "#1D6AE5", "#16A34A", "#F59E0B", "#8B5CF6",
    "#EC4899", "#0891B2", "#6B7280", "#D97706", "#64748B",
    "#FF3B3B", "#0DD9C4", "#2A6BFF", "#FF8A1C", "#B12AF7",
];

export interface CVUserData {
    id: number;
    name: string;
    cv_count: number;
}

interface CVCountData {
    date: string;
    users: CVUserData[];
}

const CVCount = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [data, setData] = useState<CVUserData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCVCounts = useCallback(async (date: Date) => {
        setLoading(true);
        try {
            const token = Cookies.get('access');
            const dateStr = format(date, 'yyyy-MM-dd');

            const response = await axios.get<CVCountData[]>(
                `${apiUrl}/api/cv-count/`,
                {
                    params: { start_date: dateStr },
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.length > 0) {
                setData(response.data[0].users);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error("Error fetching CV counts:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCVCounts(selectedDate);
    }, [selectedDate, fetchCVCounts]);

    const goBack = () => setSelectedDate(prev => subDays(prev, 1));
    const goForward = () => {
        if (!isToday(selectedDate)) {
            setSelectedDate(prev => addDays(prev, 1));
        }
    };

    const chartData = data
        .filter(user => user.cv_count > 0)
        .map((user, index) => ({
            name: getFirstName(user.name),
            value: user.cv_count,
            fill: colors[index % colors.length]
        }));

    const totalCvs = data.reduce((acc, entry) => acc + entry.cv_count, 0);

    const dateLabel = isToday(selectedDate)
        ? "Today's CV Count"
        : `${format(selectedDate, "MMM d")} CV Count`;

    return (
        <div className="bg-white border border-[#E9EBF0] rounded-xl p-5">
            {/* Header with arrows */}
            <div className="flex items-center justify-between mb-1">
                <div>
                    <p className="text-[13px] font-semibold text-gray-900 tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>{dateLabel}</p>
                    <p className="text-xs text-gray-400">CVs received {isToday(selectedDate) ? "today" : format(selectedDate, "EEEE")}</p>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={goBack}
                        className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={goForward}
                        disabled={isToday(selectedDate)}
                        className={`w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center transition-colors ${
                            isToday(selectedDate) ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-50"
                        }`}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="h-[150px] flex items-center justify-center text-sm text-gray-400">Loading...</div>
            ) : (
                <>
                    {/* Chart */}
                    <div className="relative my-3">
                        <ResponsiveContainer height={150}>
                            <PieChart>
                                <Pie
                                    data={chartData.length > 0 ? chartData : [{ name: "No Data", value: 1, fill: "#F3F4F6" }]}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={65}
                                    innerRadius={50}
                                    paddingAngle={chartData.length > 1 ? 2 : 0}
                                    stroke="none"
                                />
                                {chartData.length > 0 && <Tooltip />}
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                            <span className="text-2xl font-semibold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>{totalCvs}</span><br />
                            <span className="text-[10px] text-gray-400">CVs {isToday(selectedDate) ? "today" : format(selectedDate, "MMM d")}</span>
                        </div>
                    </div>

                    {/* Recruiter chips */}
                    <div className="flex flex-wrap gap-1.5">
                        {data.map((entry, index) => (
                            <div key={`legend-${entry.id}`} className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                                <div className="w-[7px] h-[7px] rounded-full shrink-0" style={{ backgroundColor: colors[index % colors.length] }}></div>
                                <span className="text-gray-600">{getFirstName(entry.name)}</span>
                                <span className="font-semibold text-gray-900">{entry.cv_count}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default CVCount;
