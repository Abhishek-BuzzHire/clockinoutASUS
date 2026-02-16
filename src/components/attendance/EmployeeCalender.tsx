"use client";

import {
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    isSameMonth,
    isToday,
    startOfMonth,
    startOfWeek,
    isAfter,
    startOfDay,
    isFuture,
} from "date-fns";

import { useMemo } from "react";
import type { employeeAttendance, CalendarDay } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

/* ================= PROPS ================= */

type EmployeeCalendarProps = {
    currentDate: Date;
    selectedDate: Date;
    attendanceData: Record<string, employeeAttendance>;
    activeTimer: string | null;

    expectedHours: string;
    totalHours: string;

    onSelectDate: (date: Date) => void;
    onMonthChange: (date: Date) => void;

    calendarMap: Record<string, CalendarDay>;
};

/* ================= STATUS DERIVATION ================= */

const deriveStatus = (
    entry: any,
    calendarDay?: CalendarDay,
    date?: Date
) => {

    if (date && isFuture(date)) return "FUTURE";

    if (calendarDay?.calendar_type === "HOLIDAY") return "HOLIDAY";

    if (calendarDay?.calendar_type === "WEEKEND") return "WEEKEND";

    if (entry?.work_status === "LEAVE") return "LEAVE";

    if (entry?.work_status === "WFH") return "WFH";

    if (entry?.checkInTime || entry?.punch_in_time) return "PRESENT";

    return "ABSENT";
};

const getStatusMeta = (status: string, calendarDay?: CalendarDay) => {
    switch (status) {
        case "PRESENT":
            return {
                label: "Present",
                color: "bg-emerald-100 text-emerald-700 border-emerald-200"
            };

        case "LEAVE":
            return {
                label: "Leave",
                color: "bg-blue-100 text-blue-700 border-blue-200"
            };

        case "WFH":
            return {
                label: "WFH",
                color: "bg-purple-100 text-purple-700 border-purple-200"
            };

        case "HOLIDAY":
            return {
                label: calendarDay?.holiday_name || "Holiday",
                color: "bg-rose-100 text-rose-700 border-rose-200"
            };

        case "WEEKEND":
            return {
                label: "Weekend",
                color: "bg-slate-100 text-slate-700 border-slate-200"
            };

        case "FUTURE":
            return {
                label: "Upcoming",
                color: "bg-gray-100 text-gray-500 border-gray-200"
            };

        default:
            return {
                label: "Absent",
                color: "bg-red-100 text-red-700 border-red-200"
            };
    }
};

/* ================= COMPONENT ================= */

export default function EmployeeCalendar({
    currentDate,
    selectedDate,
    attendanceData,
    activeTimer,
    expectedHours,
    totalHours,
    onSelectDate,
    calendarMap,
}: EmployeeCalendarProps) {

    const firstDayOfMonth = startOfMonth(currentDate);

    const daysInMonth = useMemo(() => {
        return eachDayOfInterval({
            start: startOfWeek(firstDayOfMonth),
            end: endOfWeek(endOfMonth(firstDayOfMonth)),
        });
    }, [firstDayOfMonth]);

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <Card className="border-0 shadow-md xl:border xl:shadow-md bg-gradient-to-br from-white to-slate-50">

            <CardContent className="p-3 sm:p-5">

                {/* WEEK HEADERS */}
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500 mb-2">
                    {daysOfWeek.map((day) => (
                        <div key={day}>{day}</div>
                    ))}
                </div>

                {/* GRID */}
                <div className="grid grid-cols-7 gap-2">

                    {daysInMonth.map((day) => {

                        const dateKey = format(day, "yyyy-MM-dd");

                        const entry = attendanceData?.[dateKey];
                        const calendarDay = calendarMap?.[dateKey];

                        const status = deriveStatus(entry, calendarDay, day);
                        const statusMeta = getStatusMeta(status, calendarDay);

                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isSelected = isSameDay(day, selectedDate);
                        const isTodaysDate = isToday(day);
                        const isFutureDay = isAfter(startOfDay(day), startOfDay(new Date()));

                        return (
                            <button
                                key={dateKey}
                                onClick={() => onSelectDate(day)}
                                disabled={!isCurrentMonth}
                                className={cn(
                                    "relative flex flex-col justify-between p-2 h-32 sm:h-40 rounded-xl transition-all duration-200 border",
                                    isCurrentMonth
                                        ? "bg-white hover:shadow-lg hover:border-indigo-300"
                                        : "bg-slate-50 opacity-60",
                                    isSelected && "ring-2 ring-indigo-500",
                                    isTodaysDate && "border-indigo-400 shadow-md"
                                )}
                            >

                                {/* DATE */}
                                <time
                                    className={cn(
                                        "text-sm font-semibold",
                                        isTodaysDate &&
                                        "flex items-center justify-center h-7 w-7 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow"
                                    )}
                                >
                                    {format(day, "d")}
                                </time>

                                {/* DATA CARD */}
                                {isCurrentMonth && !isFutureDay && (
                                    <div className="rounded-lg border bg-white p-2 text-xs space-y-1 shadow-sm">

                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">In</span>
                                            <span className="font-medium">
                                                {entry?.checkInTime ?? "--:--"}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Out</span>
                                            <span className="font-medium">
                                                {entry?.checkOutTime ?? "--:--"}
                                            </span>
                                        </div>

                                        <div className="flex justify-between font-semibold text-muted-foreground">
                                            <span>Hrs</span>
                                            <span>{entry?.hoursWorked ?? "0:00"}</span>
                                        </div>

                                        {/* STATUS BADGE */}
                                        <div className="flex justify-center pt-1">
                                            <span className={cn(
                                                "text-[10px] px-2 py-0.5 rounded-full border font-semibold",
                                                statusMeta.color
                                            )}>
                                                {statusMeta.label}
                                            </span>
                                        </div>

                                    </div>
                                )}

                            </button>
                        );
                    })}

                    {/* MONTH SUMMARY */}
                    <div className="col-span-7 grid md:grid-cols-2 gap-4 mt-6">

                        <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-sm">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-indigo-600" />
                                <span className="text-sm font-semibold text-indigo-900">
                                    Expected Monthly Hours
                                </span>
                            </div>
                            <span className="font-bold text-indigo-900 tabular-nums">
                                {expectedHours}
                            </span>
                        </div>

                        <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 shadow-sm">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-emerald-600" />
                                <span className="text-sm font-semibold text-emerald-900">
                                    Your Monthly Hours
                                </span>
                            </div>
                            <span className="font-bold text-emerald-900 tabular-nums">
                                {totalHours}
                            </span>
                        </div>

                    </div>

                </div>

            </CardContent>
        </Card>
    );
}









//                     <div className="w-full flex items-center gap-4">
//                         {/* Component 1 - Left to Right */}
//                         <div className="flex-1 flex items-center justify-between px-2 py-1 rounded-lg border-2 border-indigo-500 bg-white hover:bg-indigo-500 hover:text-white shadow-sm transition-all duration-200 group">
//                             <div className="flex items-center gap-3">
//                                 <Clock className="w-7 h-7 text-indigo-500 group-hover:text-white transition-colors duration-200" />
//                                 <span className="text-base whitespace-nowrap">
//                                     Expected Monthly Hours-
//                                 </span>
//                             </div>

//                             <span className="pl-2  font-semibold tabular-nums">
//                                 {expectedHours}
//                             </span>
//                         </div>
//                     </div>
//                     <div className="w-full flex items-center gap-4">

//                         <div className="ml-138 flex px-2 py-1 rounded-lg border-2 border-indigo-500 bg-white hover:bg-indigo-500 hover:text-white shadow-sm transition-all duration-200 group">
//                             <div className="flex items-center gap-3">
//                                 <Clock className="w-7 h-7 text-indigo-500 group-hover:text-white transition-colors duration-200" />

//                                 <span className=" text-base whitespace-nowrap">
//                                     Your Monthly Hours-
//                                 </span>
//                             </div>

//                             <span className="pl-2 font-semibold tabular-nums">
//                                 {totalHours}
//                             </span>
//                         </div>
//                     </div>








//                 </div>


//             </CardContent>
//         </Card>
//     );
// }