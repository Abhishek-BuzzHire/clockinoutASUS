"use client";

import { Calendar, PartyPopper } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function UpcomingEvents() {
  const events = [
    {
      id: 1,
      type: "holiday",
      title: "Republic Day",
      date: "Jan 26",
      icon: <Calendar className="h-5 w-5 text-purple-700" />,
      bg: "bg-purple-100"
    },
    {
      id: 2,
      type: "birthday",
      title: "Rompy Birthday",
      date: "August 8",
      icon: <PartyPopper className="h-5 w-5 text-purple-700" />,
      bg: "bg-purple-100"
    },
    {
      id: 3,
      type: "anniversary",
      title: "Ankur Work Anniversary",
      date: "August 15 - 2 Years",
      icon: <PartyPopper className="h-5 w-5 text-purple-700" />,
      bg: "bg-purple-100"
    }
  ];

  return (
    <Card className="h-full border-none shadow-sm rounded-xl overflow-hidden flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800">Upcoming Holidays & Birthdays</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 px-6 pt-4 pb-6 flex flex-col gap-4">
        {events.map((event) => (
          <div key={event.id} className="flex items-center gap-4">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${event.bg}`}>
              {event.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-800">{event.title}</span>
              <span className="text-xs text-gray-500">{event.date}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
