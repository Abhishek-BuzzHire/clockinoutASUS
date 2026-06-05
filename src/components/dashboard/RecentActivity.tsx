"use client";

import { useEffect, useState } from "react";
import { FileText, UserCheck, RefreshCw, Briefcase, Calendar, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type ActivityType = "cv_parsed" | "leave_approved" | "shift_changed" | "wfh_approved" | "attendance_regularized";

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  time: string;
  timestamp: number;
}

const INITIAL_ACTIVITIES: Activity[] = [
  { id: "1", type: "cv_parsed", title: "CV Parsed: John Doe (Senior Dev)", time: "11 hours ago", timestamp: Date.now() - 11 * 3600000 },
  { id: "2", type: "leave_approved", title: "Leave Request Approved for Neha", time: "1 hour ago", timestamp: Date.now() - 3600000 },
  { id: "3", type: "shift_changed", title: "Shift Changed for Ankur", time: "2 minutes ago", timestamp: Date.now() - 120000 },
];

const MOCK_LIVE_EVENTS = [
  { type: "cv_parsed", title: "CV Parsed: Shivam Yadav (Full Stack)" },
  { type: "leave_approved", title: "Leave Request Approved for Arshpreet" },
  { type: "wfh_approved", title: "WFH Approved for Jyoti" },
  { type: "attendance_regularized", title: "Attendance Regularized for Somya" },
  { type: "cv_parsed", title: "CV Parsed: Emily Chen (UI/UX)" },
];

const getIcon = (type: ActivityType) => {
  switch (type) {
    case "cv_parsed":
      return <FileText className="h-5 w-5 text-purple-600" />;
    case "leave_approved":
    case "wfh_approved":
      return <UserCheck className="h-5 w-5 text-green-600" />;
    case "shift_changed":
    case "attendance_regularized":
      return <RefreshCw className="h-5 w-5 text-blue-600" />;
    default:
      return <CheckCircle className="h-5 w-5 text-gray-600" />;
  }
};

const getBgColor = (type: ActivityType) => {
  switch (type) {
    case "cv_parsed":
      return "bg-purple-100";
    case "leave_approved":
    case "wfh_approved":
      return "bg-green-100";
    case "shift_changed":
    case "attendance_regularized":
      return "bg-blue-100";
    default:
      return "bg-gray-100";
  }
};

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES.sort((a, b) => b.timestamp - a.timestamp));

  // Simulate live websocket updates
  useEffect(() => {
    const interval = setInterval(() => {
      const randomEvent = MOCK_LIVE_EVENTS[Math.floor(Math.random() * MOCK_LIVE_EVENTS.length)];
      
      const newActivity: Activity = {
        id: Math.random().toString(36).substr(2, 9),
        type: randomEvent.type as ActivityType,
        title: randomEvent.title,
        time: "Just now",
        timestamp: Date.now(),
      };

      setActivities((prev) => {
        const updated = [newActivity, ...prev];
        return updated.slice(0, 10); // keep only latest 10
      });
    }, 15000); // Add a new event every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="h-full border-none shadow-sm rounded-xl overflow-hidden flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative">
        <ScrollArea className="h-[300px] w-full px-6 pt-2 pb-6">
          <div className="relative border-l border-gray-200 ml-4 space-y-6">
            {activities.map((activity, index) => (
              <div key={activity.id} className="relative pl-6 flex flex-col gap-1 group animate-in fade-in slide-in-from-top-2 duration-500">
                <div className={`absolute -left-4 top-0 h-8 w-8 rounded-full border-2 border-white flex items-center justify-center ${getBgColor(activity.type)}`}>
                  {getIcon(activity.type)}
                </div>
                <p className="text-sm font-medium text-gray-800 leading-tight">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500">
                  {activity.time}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
