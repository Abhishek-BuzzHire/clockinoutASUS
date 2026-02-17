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

/* ================================================================
   PROPS
================================================================ */

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

/* ================================================================
   STATUS TYPES
================================================================ */

type StatusKey =
    | "PRESENT"
    | "WFH"
    | "LEAVE"
    | "INCOMPLETE"
    | "ABSENT"
    | "HOLIDAY"
    | "WEEKEND"
    | "FUTURE";

interface StatusMeta {
    label: string;
    badge: string;
    bg: string;
}

const STATUS_META: Record<StatusKey, StatusMeta> = {
    PRESENT: {
        label: "Present",
        badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
        bg: "bg-emerald-50/60",
    },
    WFH: {
        label: "WFH",
        badge: "bg-purple-100 text-purple-700 border-purple-200",
        bg: "bg-purple-50/60",
    },
    LEAVE: {
        label: "Leave",
        badge: "bg-orange-100 text-orange-700 border-orange-200",
        bg: "bg-orange-50/60",
    },
    INCOMPLETE: {
        label: "Incomplete",
        badge: "bg-amber-100 text-amber-700 border-amber-200",
        bg: "bg-amber-50/60",
    },
    ABSENT: {
        label: "Absent",
        badge: "bg-rose-100 text-rose-700 border-rose-200",
        bg: "bg-rose-50/40",
    },
    HOLIDAY: {
        label: "Holiday",              // overridden below with actual name
        badge: "bg-sky-100 text-sky-700 border-sky-200",
        bg: "bg-sky-50/60",
    },
    WEEKEND: {
        label: "Weekend",
        badge: "bg-slate-100 text-slate-500 border-slate-200",
        bg: "bg-slate-50/80",
    },
    FUTURE: {
        label: "Upcoming",
        badge: "bg-gray-100 text-gray-400 border-gray-200",
        bg: "bg-white",
    },
};

/* ================================================================
   STATUS DERIVATION
   
   Priority order:
   1. Holiday     → calendarDay.holiday_name is set
   2. Weekend     → calendarDay.is_working_day === false
                    OR calendarDay.calendar_type === "WEEKEND"
                    OR no calendarDay entry AND it's Sat/Sun
   3. Future      → date is after today
   4. Leave       → attendance status/work_status contains LEAVE
   5. WFH         → attendance status/work_status contains WFH
   6. Present     → has checkInTime + checkOutTime
   7. Incomplete  → has checkInTime but no checkOutTime
   8. Absent      → working day, no punch data
================================================================ */

function deriveStatus(
    entry: employeeAttendance | undefined,
    calendarDay: CalendarDay | undefined,
    date: Date
): { key: StatusKey; label: string } {

    // 1. Holiday — highest priority, even beats weekend
    if (calendarDay?.holiday_name) {
        return { key: "HOLIDAY", label: calendarDay.holiday_name };
    }

    // 2. Weekend / non-working day
    //    Covers: is_working_day=false, calendar_type="WEEKEND",
    //    OR no calendar entry at all for a Sat/Sun (common API gap)
    const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
    const isWeekendByDayOfWeek = dayOfWeek === 0 || dayOfWeek === 6;

    if (
        calendarDay?.is_working_day === false ||
        calendarDay?.calendar_type === "WEEKEND" ||
        (!calendarDay && isWeekendByDayOfWeek)
    ) {
        return { key: "WEEKEND", label: "Weekend" };
    }

    // 3. Future date
    if (isFuture(startOfDay(date))) {
        return { key: "FUTURE", label: "Upcoming" };
    }

    // 4–8: Past working days — use attendance entry
    const rawStatus = (
        entry?.status ??
        entry?.workStatus ??
        ""
    ).toString().trim().toUpperCase();

    if (rawStatus.includes("LEAVE")) {
        return { key: "LEAVE", label: "On Leave" };
    }

    if (rawStatus.includes("WFH")) {
        return { key: "WFH", label: "Work From Home" };
    }

    const hasCheckIn = Boolean(entry?.checkInTime);
    const hasCheckOut = Boolean(entry?.checkOutTime);

    if (hasCheckIn && hasCheckOut) {
        return { key: "PRESENT", label: "Present" };
    }

    if (hasCheckIn && !hasCheckOut) {
        return { key: "INCOMPLETE", label: "Incomplete" };
    }

    return { key: "ABSENT", label: "Absent" };
}

/* ================================================================
   COMPONENT
================================================================ */

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

                {/* DAY GRID */}
                <div className="grid grid-cols-7 gap-2">
                    {daysInMonth.map((day) => {

                        const dateKey = format(day, "yyyy-MM-dd");
                        const entry = attendanceData?.[dateKey];
                        const calendarDay = calendarMap?.[dateKey];

                        const { key: statusKey, label: statusLabel } = deriveStatus(entry, calendarDay, day);
                        const meta = STATUS_META[statusKey];

                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isSelected = isSameDay(day, selectedDate);
                        const isTodaysDate = isToday(day);
                        const isFutureDay = isAfter(startOfDay(day), startOfDay(new Date()));

                        const isOffDay = statusKey === "WEEKEND" || statusKey === "HOLIDAY";

                        return (
                            <button
                                key={dateKey}
                                onClick={() => onSelectDate(day)}
                                disabled={!isCurrentMonth}
                                className={cn(
                                    "relative flex flex-col justify-between p-2 h-32 sm:h-40 rounded-xl transition-all duration-200 border",
                                    !isCurrentMonth && "bg-slate-50 opacity-40 cursor-default",
                                    isCurrentMonth && !isOffDay && "bg-white hover:shadow-lg hover:border-indigo-300",
                                    isCurrentMonth && isOffDay && `${meta.bg} hover:brightness-95`,
                                    isSelected && "ring-2 ring-indigo-500",
                                    isTodaysDate && "border-indigo-400 shadow-md"
                                )}
                            >
                                {/* DATE NUMBER */}
                                <time
                                    className={cn(
                                        "text-sm font-semibold self-start",
                                        isTodaysDate &&
                                        "flex items-center justify-center h-7 w-7 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow",
                                        isOffDay && !isTodaysDate && "text-slate-400"
                                    )}
                                >
                                    {format(day, "d")}
                                </time>

                                {/* DATA CARD — shown for current month only */}
                                {isCurrentMonth && (
                                    <>
                                        {/* Off day (weekend/holiday) — just show label centered */}
                                        {isOffDay && (
                                            <div className="flex-1 flex items-center justify-center">
                                                <span className={cn(
                                                    "text-[10px] px-2 py-0.5 rounded-full border font-semibold",
                                                    meta.badge
                                                )}>
                                                    {statusLabel}
                                                </span>
                                            </div>
                                        )}

                                        {/* Working day — show punch info + status */}
                                        {!isOffDay && (
                                            <div className="rounded-lg border bg-white p-2 text-xs space-y-1 shadow-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">In</span>
                                                    <span className="font-medium">
                                                        {isFutureDay ? "—" : (entry?.checkInTime ?? "--:--")}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Out</span>
                                                    <span className="font-medium">
                                                        {isFutureDay ? "—" : (entry?.checkOutTime ?? "--:--")}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between font-semibold text-muted-foreground">
                                                    <span>Hrs</span>
                                                    <span>
                                                        {isFutureDay ? "—" : (entry?.hoursWorked ?? "0:00")}
                                                    </span>
                                                </div>

                                                {/* STATUS BADGE */}
                                                <div className="flex justify-center pt-1">
                                                    <span className={cn(
                                                        "text-[10px] px-2 py-0.5 rounded-full border font-semibold",
                                                        meta.badge
                                                    )}>
                                                        {statusLabel}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </>
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