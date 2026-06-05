"use client";

import React, { useEffect, useState } from "react";
import { Cake, Award } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import axios from "axios";
import Cookies from "js-cookie";
import { apiUrl } from "@/lib/data";

interface EventData {
  id: string;
  type: "birthday" | "anniversary";
  name: string;
  date: string;
  detail: string;
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = Cookies.get("access");

        // This endpoint will be built to pull from employee/candidate table
        const res = await axios.get(`${apiUrl}/api/upcoming-events/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data?.events || res.data?.results || res.data || [];
        const mappedEvents: EventData[] = [];

        data.forEach((item: any) => {
          mappedEvents.push({
            id: `${item.type}-${item.id || item.emp_id || Math.random()}`,
            type: item.type === "anniversary" ? "anniversary" : "birthday",
            name: item.name || item.employee_name || "—",
            date: item.date || item.event_date || "—",
            detail: item.detail || (item.type === "anniversary" ? `${item.years || ""} Years` : ""),
          });
        });

        setEvents(mappedEvents.slice(0, 8));
      } catch (err) {
        // API not built yet — silently fail
        console.log("Upcoming events API not available yet", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <Card className="h-full border-none shadow-sm rounded-xl overflow-hidden flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800">Birthdays & Anniversaries</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 px-6 pt-4 pb-6 flex flex-col gap-3">
        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No upcoming birthdays or anniversaries this month. Connect the API to see data here.</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`h-9 w-9 rounded-full flex items-center justify-center ${event.type === "birthday" ? "bg-pink-50 text-pink-500" : "bg-indigo-50 text-indigo-500"}`}>
                {event.type === "birthday" ? <Cake size={18} /> : <Award size={18} />}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-gray-800 truncate">{event.name}</span>
                <span className="text-xs text-gray-500">{event.date}{event.detail ? ` · ${event.detail}` : ""}</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
