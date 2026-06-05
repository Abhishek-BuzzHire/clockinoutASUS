"use client";

import { useEffect, useState } from "react";
import { Calendar, PartyPopper } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import axios from "axios";
import Cookies from "js-cookie";
import { apiUrl } from "@/lib/data";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";

interface EventData {
  id: string;
  type: string;
  title: string;
  date: string;
  icon: JSX.Element;
  bg: string;
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = Cookies.get("access");
        const date = new Date();
        const start = format(startOfMonth(date), "yyyy-MM-dd");
        const end = format(endOfMonth(date), "yyyy-MM-dd");

        const res = await axios.get(`${apiUrl}/api/company-calendar`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { start_date: start, end_date: end }
        });

        const calendarDays = res.data.calendar || [];
        const mappedEvents: EventData[] = [];

        calendarDays.forEach((day: any) => {
          if (day.holiday_name) {
            mappedEvents.push({
              id: `hol-${day.date}`,
              type: "holiday",
              title: day.holiday_name,
              date: format(parseISO(day.date), "MMM d"),
              icon: <Calendar className="h-5 w-5 text-purple-700" />,
              bg: "bg-purple-100"
            });
          }
        });

        // If no events found, show a fallback message or just the array
        setEvents(mappedEvents.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch calendar", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <Card className="h-full border-none shadow-sm rounded-xl overflow-hidden flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800">Upcoming Holidays</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 px-6 pt-4 pb-6 flex flex-col gap-4">
        {loading ? (
          <p className="text-sm text-gray-500">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-gray-500">No upcoming events this month.</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${event.bg}`}>
                {event.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800">{event.title}</span>
                <span className="text-xs text-gray-500">{event.date}</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
