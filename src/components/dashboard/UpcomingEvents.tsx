"use client";

import React, { useEffect, useState } from "react";
import { Cake, Award } from "lucide-react";
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
    if (days === 0) return "Today! 🎉";
    if (days === 1) return "Tomorrow";
    return `in ${days} days`;
  };

  return (
    <div className="bg-white border border-[#E9EBF0] rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>
          Birthdays & Anniversaries
        </h3>
        <span className="text-[11px] bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium tracking-wide">
          Next 30 days
        </span>
      </div>

      {loading ? (
        <div className="py-6 flex items-center justify-center">
          <div className="h-5 w-5 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <p className="text-sm text-gray-400 leading-relaxed py-4 text-center">
          No upcoming birthdays or anniversaries in the next 30 days.
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {events.map((event) => (
            <div
              key={`${event.type}-${event.emp_id}`}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8F9FB] transition-all duration-200 group"
            >
              <div className="flex items-center gap-3.5">
                {/* Icon */}
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                    event.type === "birthday"
                      ? "bg-gradient-to-br from-pink-50 to-rose-100 text-rose-500"
                      : "bg-gradient-to-br from-indigo-50 to-violet-100 text-indigo-500"
                  }`}
                >
                  {event.type === "birthday" ? <Cake size={18} /> : <Award size={18} />}
                </div>

                {/* Name & Detail */}
                <div className="flex flex-col min-w-0">
                  <span className="text-[15px] font-semibold text-gray-900 truncate leading-snug">
                    {event.name}
                  </span>
                  <span className="text-[12px] text-gray-400 mt-0.5">
                    {event.date} ·{" "}
                    <span className={event.type === "birthday" ? "text-rose-400" : "text-indigo-400"}>
                      {event.type === "anniversary"
                        ? `${event.years} Yr Work Anniversary`
                        : "Birthday"}
                    </span>
                  </span>
                </div>
              </div>

              {/* Days Badge */}
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 tracking-wide ${
                  event.days_until === 0
                    ? "bg-emerald-100 text-emerald-700"
                    : event.days_until <= 3
                    ? "bg-amber-100 text-amber-700"
                    : event.days_until <= 7
                    ? "bg-blue-50 text-blue-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {getDaysLabel(event.days_until)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
