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
    addMonths,
    subMonths,
    isAfter,
    startOfDay,
} from "date-fns";

import { useMemo } from "react";
import type { employeeAttendance, CalendarDay } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AttendanceDay } from '@/app/(dashboard)/list/attendance/admin/page';
import { Clock } from "lucide-react";
import { employeeData } from "@/lib/data";

/* ================= PROPS ================= */

type EmployeeCalendarProps = {
    currentDate: Date;
    selectedDate: Date;
    attendanceData: Record<string, employeeAttendance>;

    activeTimer: string | null;
    elapsedTime: number;

    calculateHoursWorked: (date: string) => number;

    onSelectDate: (date: Date) => void;
    onMonthChange: (date: Date) => void;

    calendarMap: Record<string, CalendarDay>;
};


/* ================= COMPONENT ================= */

export default function EmployeeCalendar({
    currentDate,
    selectedDate,
    activeTimer,
    onSelectDate,
    calendarMap,
    attendanceData,
}: EmployeeCalendarProps) {

    const firstDayOfMonth = startOfMonth(currentDate);


    const totalMonthlyHours: string = "00:00";
    const yourMonthlyHours: string = "00:00";


    const daysInMonth = useMemo(() => {
        return eachDayOfInterval({
            start: startOfWeek(firstDayOfMonth),
            end: endOfWeek(endOfMonth(firstDayOfMonth)),
        });
    }, [firstDayOfMonth]);

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <Card className="border-0 shadow-md xl:border xl:shadow-md">

            <CardContent className="p-2 sm:p-4">

                {/* WEEK HEADERS */}
                <div className="grid grid-cols-7 gap-1 text-center text-sm text-muted-foreground">
                    {daysOfWeek.map((day) => (
                        <div key={day} className="font-medium py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* GRID */}
                <div className="grid grid-cols-7 gap-1">

                    {daysInMonth.map((day) => {

                        const dateKey = format(day, "yyyy-MM-dd");

                        const entry = attendanceData[dateKey];

                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isSelected = isSameDay(day, selectedDate);
                        const isTodaysDate = isToday(day);

                        const calendarDay = calendarMap[dateKey];

                        const isWeekend = calendarDay?.calendar_type === "WEEKEND";
                        const isHoliday = calendarDay?.calendar_type === "HOLIDAY";
                        const isWorkingDay = calendarDay?.is_working_day;

                        const isFutureDay = isAfter(startOfDay(day), startOfDay(new Date()));

                        const isActive = activeTimer === dateKey;

                        return (
                            <button
                                key={dateKey}
                                onClick={() => onSelectDate(day)}
                                disabled={!isCurrentMonth}
                                className={cn(
                                    "relative flex flex-col justify-between p-2 h-32 sm:h-40 rounded-md transition",
                                    isCurrentMonth
                                        ? "bg-card hover:bg-secondary"
                                        : "bg-muted/50 opacity-60",
                                    isSelected && "ring-2 ring-primary ring-offset-2"
                                )}
                            >

                                {/* DATE */}
                                <time
                                    className={cn(
                                        "text-md font-semibold",
                                        isTodaysDate &&
                                        "flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white"
                                    )}
                                >
                                    {format(day, "d")}
                                </time>

                                {isCurrentMonth && !isFutureDay && (

                                    <div className={cn(
                                        "w-full rounded-xl border p-2 text-xs space-y-1 mt-1",
                                        entry
                                            ? "bg-emerald-50 border-emerald-200"
                                            : isWeekend || isHoliday
                                                ? "bg-slate-50 border-slate-200"
                                                : "bg-red-50 border-red-200"
                                    )}>

                                        {(() => {

                                            const inTime =
                                                entry?.checkInTime ??
                                                "--:--";

                                            const outTime =
                                                entry?.checkOutTime ??
                                                "--:--";

                                            const hrs =
                                                entry?.hoursWorked ??
                                                "00:00";

                                            return (
                                                <>
                                                    {/* In */}
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">In</span>
                                                        <span className="font-medium">{inTime}</span>
                                                    </div>

                                                    {/* Out */}
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Out</span>
                                                        <span className="font-medium">{outTime}</span>
                                                    </div>

                                                    <div className="flex justify-between font-semibold text-muted-foreground">
                                                        <span>Hrs</span>
                                                        <span>{hrs}</span>
                                                    </div>

                                                    {/* Status */}
                                                    {!entry && isWorkingDay && (
                                                        <div className="text-red-500 font-semibold text-center">
                                                            Absent
                                                        </div>
                                                    )}

                                                    {entry && isWorkingDay && (
                                                        <div className="text-green-500 font-semibold text-center">
                                                            Present
                                                        </div>
                                                    )}

                                                    {!entry && isWorkingDay && (
                                                        <div className="text-yellow-500 font-semibold text-center">
                                                            Leave
                                                        </div>
                                                    )}

                                                    {/* Weekend */}
                                                    {isWeekend && (
                                                        <div className="text-center text-muted-foreground font-semibold">
                                                            Weekend
                                                        </div>
                                                    )}

                                                    {/* Holiday */}
                                                    {isHoliday && (
                                                        <div className="text-center text-red-500 font-semibold">
                                                            {calendarDay?.holiday_name}
                                                        </div>
                                                    )}

                                                </>
                                            );
                                        })()}

                                    </div>
                                )}

                            </button>


                        );

                    })}

                    <div className="w-full flex items-center gap-4">
                        {/* Component 1 - Left to Right */}
                        <div className="flex-1 flex items-center justify-between px-2 py-1 rounded-lg border-2 border-indigo-500 bg-white hover:bg-indigo-500 hover:text-white shadow-sm transition-all duration-200 group">
                            <div className="flex items-center gap-3">
                                <Clock className="w-7 h-7 text-indigo-500 group-hover:text-white transition-colors duration-200" />
                                <span className="text-base whitespace-nowrap">
                                    Total Monthly Hours-
                                </span>
                            </div>

                            <span className="pl-2  font-semibold tabular-nums">
                                {totalMonthlyHours}
                            </span>
                        </div>
                    </div>
                    <div className="w-full flex items-center gap-4">

                        <div className="ml-138 flex px-2 py-1 rounded-lg border-2 border-indigo-500 bg-white hover:bg-indigo-500 hover:text-white shadow-sm transition-all duration-200 group">
                            <div className="flex items-center gap-3">
                                <Clock className="w-7 h-7 text-indigo-500 group-hover:text-white transition-colors duration-200" />

                                <span className=" text-base whitespace-nowrap">
                                    Your Monthly Hours-
                                </span>
                            </div>

                            <span className="pl-2 font-semibold tabular-nums">
                                {yourMonthlyHours}
                            </span>
                        </div>


                    </div>
                </div>


            </CardContent>
        </Card>
    );
}