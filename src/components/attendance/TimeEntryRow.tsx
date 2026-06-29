import { cn } from "@/lib/utils";
import { TimelineBar } from "./TimeLineBar";
import { Badge } from "@/components/ui/badge";
import { CalendarDay, DayStatus } from "@/lib/types";
import { SHIFT_CONFIG } from "@/app/(dashboard)/list/attendance/admin/page";
import { Clock3, CalendarCheck } from "lucide-react";

interface TimeEntryRowProps {
    day: string;
    date: number;
    dateStr: string;
    calendarDay?: CalendarDay;
    checkInTime?: string;
    checkOutTime?: string;
    lateBy?: string;
    earlyBy?: string;
    hoursWorked: string;
    status: DayStatus;
    isToday?: boolean;
    isFuture?: boolean;
}

export const TimeEntryRow = ({
    day,
    date,
    calendarDay,
    checkInTime,
    checkOutTime,
    hoursWorked,
    status,
    isToday,
    isFuture,
}: TimeEntryRowProps) => {

    const getStatusBadge = () => {
        const badges = [];

        if (isToday) {
            badges.push(
                <Badge
                    key="today"
                    className="bg-blue-100 text-blue-700 border-0 rounded-full px-4 py-1"
                >
                    Today
                </Badge>
            );
        }

        if (calendarDay?.calendar_type === "HOLIDAY") {
            badges.push(
                <Badge
                    key="holiday"
                    className="bg-yellow-100 text-yellow-700 border-0 rounded-full px-4 py-1"
                >
                    {calendarDay.holiday_name}
                </Badge>
            );
        }

        if (status === "absent") {
            badges.push(
                <Badge
                    key="absent"
                    className="bg-red-100 text-red-500 border-0 rounded-full px-4 py-1"
                >
                    Absent
                </Badge>
            );
        }

        if (status === "present") {
            badges.push(
                <Badge
                    key="present"
                    className="bg-green-100 text-green-600 border-0 rounded-full px-4 py-1"
                >
                    Present
                </Badge>
            );
        }

        if (status === "WFH") {
            badges.push(
                <Badge
                    key="wfh"
                    className="bg-blue-600 text-white border-0 rounded-full px-4 py-1"
                >
                    WFH
                </Badge>
            );
        }

        return <div className="flex gap-2">{badges}</div>;
    };

    return (
        <div
            className={cn(
                "bg-white rounded-[30px] p-8 mb-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all",
                isToday && "border-l-[6px] border-l-blue-600",
                isFuture && "opacity-50"
            )}
        >
            <div className="
flex 
flex-col 
gap-4
lg:grid
lg:grid-cols-[90px_90px_1fr_170px_30px]
lg:items-center
lg:gap-6
w-full
">
                {/* Date */}
                <div className="
flex
flex-row
justify-between
items-center
lg:flex-col
lg:items-start
">
                    <span
                        className={cn(
                            "text-gray-500 text-lg",
                            isToday && "text-blue-600 font-semibold"
                        )}
                    >
                        {day}
                    </span>

                    <span
                        className={cn(
                            "mt-3 text-5xl font-bold text-slate-800",
                            isToday &&
                            "w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl"
                        )}
                    >
                        {date}
                    </span>
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <CalendarCheck
                        className={cn(
                            "w-7 h-7",
                            status === "absent"
                                ? "text-red-500"
                                : "text-blue-600"
                        )}
                    />
                </div>

                {/* Timeline */}
                <div className="
flex
flex-col
gap-3
w-full
lg:flex-row
lg:items-center
lg:justify-between
">
                    <div className="flex-1 max-w-[350px]">
                        <TimelineBar
                            startTime={checkInTime}
                            endTime={checkOutTime}
                            status={status}
                            shiftStart={SHIFT_CONFIG.startTime}
                            shiftEnd={SHIFT_CONFIG.endTime}
                        />
                    </div>
                    <div className="
flex
gap-2
flex-wrap
justify-start
lg:justify-center
">
                        {getStatusBadge()}
                    </div>

                    {/* Hours card */}
                    <div
                        className="
bg-slate-50
rounded-2xl
px-3
py-3
flex
items-center
gap-2
w-[140px]
min-w-[140px]
overflow-hidden
"
                    >
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Clock3 className="w-5 h-5 text-blue-600" />
                        </div>

                        <div>
                            <div className="text-2xl font-bold leading-none">
                                {hoursWorked}
                            </div>

                            <div className="text-[12px] text-gray-500 leading-tight">
                                Hrs worked
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menu dots */}
                <div className="hidden lg:block text-3xl text-gray-400 cursor-pointer">
                    ⋮
                </div>
            </div>
        </div>
    );
};
