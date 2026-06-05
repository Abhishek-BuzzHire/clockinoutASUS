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
    if (days === -1) return "Yesterday";
    if (days < 0) return `${Math.abs(days)}d ago`;
    return `in ${days}d`;
  };

  return (
    <div className="bg-white border border-[#E9EBF0] rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold text-gray-900 leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
          Birthdays & Anniversaries
        </h3>
        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium whitespace-nowrap ml-2">
          Past 10 & Next 30 days
        </span>
      </div>

      {loading ? (
        <div className="py-6 flex items-center justify-center">
          <div className="h-5 w-5 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <p className="text-sm text-gray-400 leading-relaxed py-4 text-center">
          No upcoming events in the next 30 days.
        </p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {events.map((event) => (
            <div
              key={`${event.type}-${event.emp_id}`}
              className="grid gap-2 p-2.5 rounded-lg hover:bg-[#F8F9FB] transition-colors duration-150"
              style={{ gridTemplateColumns: "36px 1fr auto" }}
            >
              {/* Icon - fixed size */}
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                  event.type === "birthday"
                    ? "bg-pink-50 text-rose-500"
                    : "bg-indigo-50 text-indigo-500"
                }`}
              >
                {event.type === "birthday" ? <Cake size={17} /> : <Award size={17} />}
              </div>

              {/* Name & Detail - takes remaining space, truncates */}
              <div className="flex flex-col justify-center min-w-0 overflow-hidden">
                <span className="text-[14px] font-semibold text-gray-900 truncate leading-tight">
                  {event.name}
                </span>
                <span className="text-[11px] text-gray-400 mt-0.5 truncate">
                  {event.type === "anniversary" ? (
                    <>
                      Completed <span className="text-indigo-500 font-semibold">{event.years} {(event.years ?? 0) === 1 ? "year" : "years"}</span> with BuzzHire
                    </>
                  ) : (
                    <>
                      {event.date} · <span className="text-rose-400">Birthday</span>
                    </>
                  )}
                </span>
              </div>

              {/* Badge - fixed size, never wraps */}
              <div className="flex items-center">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                    event.days_until < 0
                      ? "bg-gray-100 text-gray-500" // Past events
                      : event.days_until === 0
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
