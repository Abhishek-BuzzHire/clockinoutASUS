// Update this to get data of current week, previous week. Also to get data of current month on the basis of days and also previous months on the basis of days and weeks too. Like a month selection

"use client"

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Dummy data for the weekly stats
const weeklyData = [
    { name: 'Monday', candidates: 25 },
    { name: 'Tuesday', candidates: 14 },
    { name: 'Wednesday', candidates: 19 },
    { name: 'Thusday', candidates: 12 },
    { name: 'Friday', candidates: 30 },
    { name: 'Saturday', candidates: 23 },
    { name: 'Sunday', candidates: 1 },
];

const monthlyData = [
    { name: 'Week 1', candidates: 124 },
    { name: 'Week 2', candidates: 100 },
    { name: 'Week 3', candidates: 80 },
    { name: 'Week 4', candidates: 110 },
];

const weeklyCVs = weeklyData.reduce((acc, entry) => acc + entry.candidates, 0);
const monthlyCVs = monthlyData.reduce((acc, entry) => acc + entry.candidates, 0);

const WeeklyStats = () => {

    const [view, setView] = useState('weekly');

    const chartData = view === 'weekly' ? weeklyData : monthlyData;
    return (
        <div className="w-full mx-auto mt-6">
            <div className="p-4 bg-white rounded-2xl shadow-lg">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Weekly CV Count</h2>
                        <span className='text-md font-semibold text-gray-500'>{view === "weekly" ? weeklyCVs + " this week" : monthlyCVs + " this month"}</span>
                    </div>
                    <div className="flex justify-start mb-6 space-x-2">
                        <button
                            onClick={() => setView('weekly')}
                            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${view === 'weekly' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
                                }`}
                        >
                            Weekly
                        </button>
                        <button
                            onClick={() => setView('monthly')}
                            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${view === 'monthly' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
                                }`}
                        >
                            Monthly
                        </button>
                    </div>
                </div>
                {/* Chart Section */}
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 35]} />
                        <Tooltip />
                        <Bar dataKey="candidates" fill="#444CE7" barSize={50} radius={[5, 5, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default WeeklyStats;
