"use client";

import React, { useEffect, useState } from "react";
import { Cake, Award } from "lucide-react";
import { format } from "date-fns";
import axios from "axios";
import Cookies from "js-cookie";
import { apiUrl } from "@/lib/data";

interface EventData {
  emp_id: number;
  type: "birthday" | "anniversary";
  name: string;
  date: string;
  event_date: string;
  days_until: number;
  detail: string;
  years?: number;
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
        const data: EventData[] = Array.isArray(res.data) ? res.data : [];
        setEvents(data.slice(0, 10));
      } catch (err) {
        console.log("Upcoming events API not available yet", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getDaysLabel = (days: number) => {
    if (days === 0) return "Today!";
    if (days === 1) return "Tomorrow";
    return `in ${days}d`;
  };

  return (
    <div className="bg-white border border-[#E9EBF0] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-semibold text-gray-900 tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>Birthdays & Anniversaries</p>
        <span className="text-[11px] bg-gray-100 text-gray-500 px-2.5 py-1 rounded font-medium">Next 30 days</span>
      </div>
      {loading ? (
        <p className="text-xs text-gray-400 py-4">Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-xs text-gray-400 leading-relaxed mt-2">No upcoming birthdays or anniversaries in the next 30 days.</p>
      ) : (
        <div className="flex flex-col gap-1">
          {events.map((event) => (
            <div key={`${event.type}-${event.emp_id}`} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${event.type === "birthday" ? "bg-pink-50 text-pink-500" : "bg-indigo-50 text-indigo-500"}`}>
                  {event.type === "birthday" ? <Cake size={16} /> : <Award size={16} />}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-medium text-gray-800 truncate">{event.name}</span>
                  <span className="text-[11px] text-gray-400">
                    {event.date} · {event.type === "anniversary" ? `${event.years} Yr Anniversary` : "Birthday"}
                  </span>
                </div>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                event.days_until === 0 
                  ? "bg-green-100 text-green-700" 
                  : event.days_until <= 3 
                    ? "bg-amber-100 text-amber-700" 
                    : "bg-gray-100 text-gray-500"
              }`}>
                {getDaysLabel(event.days_until)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
