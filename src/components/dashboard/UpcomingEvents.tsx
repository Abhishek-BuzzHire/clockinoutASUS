"use client";

import React, { useEffect, useState } from "react";
import { Cake, Award } from "lucide-react";
import { format } from "date-fns";
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
        console.log("Upcoming events API not available yet", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="bg-white border border-[#E9EBF0] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-semibold text-gray-900 tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>Birthdays & Anniversaries</p>
        <span className="text-[11px] bg-gray-100 text-gray-500 px-2.5 py-1 rounded font-medium">{format(new Date(), "MMMM yyyy")}</span>
      </div>
      {loading ? (
        <p className="text-xs text-gray-400 py-4">Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-xs text-gray-400 leading-relaxed mt-2">No upcoming birthdays or anniversaries this month. Connect the API to see data here.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {events.map((event) => (
            <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${event.type === "birthday" ? "bg-pink-50 text-pink-500" : "bg-indigo-50 text-indigo-500"}`}>
                {event.type === "birthday" ? <Cake size={16} /> : <Award size={16} />}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-medium text-gray-800 truncate">{event.name}</span>
                <span className="text-[11px] text-gray-400">{event.date}{event.detail ? ` · ${event.detail}` : ""}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
