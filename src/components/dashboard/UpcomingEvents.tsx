"use client";

import React, { useEffect, useState } from "react";
import { Cake, Award } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { apiUrl } from "@/lib/data";
import useSWR from "swr";

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

const fetcher = async (url: string) => {
  const token = Cookies.get("access");
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return Array.isArray(res.data) ? res.data : [];
};

export default function UpcomingEvents() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [localEvents, setLocalEvents] = useState<EventData[] | undefined>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("dashboard_upcoming_events_cache");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse cached upcoming events", e);
        }
      }
    }
    return undefined;
  });

  const { data: fetchedEvents, isLoading } = useSWR<EventData[]>(
    `${apiUrl}/api/upcoming-events/`,
    fetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    if (fetchedEvents && typeof window !== "undefined") {
      localStorage.setItem("dashboard_upcoming_events_cache", JSON.stringify(fetchedEvents));
    }
  }, [fetchedEvents]);

  const events = isMounted ? (fetchedEvents || localEvents || []) : [];
  const displayEvents = events.slice(0, 10);
  const showLoading = !isMounted || (isLoading && !fetchedEvents && !localEvents);

  const getDaysLabel = (days: number) => {
    if (days === 0) return "Today! 🎉";
    if (days === 1) return "Tomorrow";
    if (days === -1) return "Yesterday";
    if (days < 0) return `${Math.abs(days)} Days ago`;
    return `in ${days} Days`;
  };

  return (
    <div className="bg-white border border-[#E9EBF0] rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold text-gray-900 leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
          Birthdays & Anniversaries
        </h3>
        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium whitespace-nowrap ml-2">
          Next 30 days
        </span>
      </div>

      {showLoading ? (
        <div className="py-6 flex items-center justify-center">
          <div className="h-5 w-5 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : displayEvents.length === 0 ? (
        <p className="text-sm text-gray-400 leading-relaxed py-4 text-center">
          No upcoming events in the next 30 days.
        </p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {displayEvents.map((event) => (
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

              {/* Name & Detail - allow wrapping */}
              <div className="flex flex-col justify-center min-w-0 pr-2">
                <span className="text-[14px] font-semibold text-gray-900 leading-tight whitespace-normal break-words">
                  {event.name}
                </span>
                <span className="text-[12px] text-gray-500 mt-0.5 leading-snug whitespace-normal">
                  {event.type === "anniversary" ? (
                    <>
                      {event.date} · <span className="text-indigo-500 font-medium">{event.days_until > 0 ? "Completing" : event.days_until === 0 ? "Completing" : "Completed"} {event.years} {(event.years ?? 0) === 1 ? "year" : "years"} with BuzzHire{event.days_until === 0 ? " today! 🎉" : ""}</span>
                    </>
                  ) : (
                    <>
                      {event.date} · <span className="text-rose-400 font-medium">Birthday</span>
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
