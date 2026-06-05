"use client";

import { useEffect, useState } from "react";
import { FileText, UserCheck, RefreshCw, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from "axios";
import Cookies from "js-cookie";
import { apiUrl } from "@/lib/data";

type ActivityType = "cv_parsed" | "leave_approved" | "shift_changed" | "wfh_approved" | "attendance_regularized";

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  time: string;
  timestamp: number;
}

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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = Cookies.get("access");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetching leaves to simulate activity stream with real data
        const leavesRes = await axios.get(`${apiUrl}/api/admin/leaves/`, { headers, params: { status: "APPROVED" } });
        
        const fetchedActivities: Activity[] = [];

        if (leavesRes.data && leavesRes.data.results) {
          leavesRes.data.results.forEach((l: any) => {
            fetchedActivities.push({
              id: `leave-act-${l.leave_id}`,
              type: "leave_approved",
              title: `Leave Approved for ${l.employee_name || 'Employee'}`,
              time: l.start_date || "Recently",
              timestamp: Date.now() - Math.random() * 100000 // sorting dummy
            });
          });
        }

        setActivities(fetchedActivities.slice(0, 10));
      } catch (err) {
        console.error("Error fetching activities", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <Card className="h-full border-none shadow-sm rounded-xl overflow-hidden flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative">
        <ScrollArea className="h-[300px] w-full px-6 pt-2 pb-6">
          <div className="relative border-l border-gray-200 ml-4 space-y-6">
            {loading ? (
              <p className="text-sm text-gray-500 pl-4 mt-2">Loading live feed...</p>
            ) : activities.length === 0 ? (
              <p className="text-sm text-gray-500 pl-4 mt-2">No recent activity.</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="relative pl-6 flex flex-col gap-1 group animate-in fade-in slide-in-from-top-2 duration-500 mt-6">
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
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
