import { cn } from "@/lib/utils";
import { TimelineBar } from "./TimeLineBar";
import { Badge } from "@/components/ui/badge";
import { DayStatus } from "@/lib/types";
import { SHIFT_CONFIG } from "@/app/attendance/page";

interface TimeEntryRowProps {
    day: string;
    date: number;
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
    checkInTime,
    checkOutTime,
    lateBy,
    earlyBy,
    hoursWorked,
    status,
    isToday,
    isFuture,
}: TimeEntryRowProps) => {
    const getStatusBadge = () => {

        const badges = [];

        if (isToday) {
            badges.push(
                <Badge key="today" className="bg-today-light text-blue-800 border-0">
                    Today
                </Badge>
            );
        }

        if (status === "weekend") {
            badges.push(
                <Badge key="weekend" className="bg-weekend-light text-weekend border-0">
                    Weekend
                </Badge>
            );
        }
        if (status === "absent") {
            badges.push(
                <Badge key="absent" className="bg-absent-light text-absent border-0">
                    Absent
                </Badge>
            );
        }
        if (status === "present") {
            badges.push(
                <Badge key="present" className="bg-success-light text-success border-0">
                    Present
                </Badge>
            );
        }

        return badges.length > 0 ? <div className="flex gap-2">{badges}</div> : null;
    };

    return (
        <div className={cn(
            // MOBILE: Flex Column, white background, shadow/border for card look
            // DESKTOP (lg): Restore your exact Grid layout, remove mobile card styles
            "flex flex-col p-4 mb-4 bg-white border rounded-lg shadow-sm gap-3 lg:gap-0 lg:shadow-none lg:rounded-none lg:bg-transparent lg:border-0 lg:border-b lg:border-border lg:mb-0 lg:p-0 lg:py-4 lg:grid lg:grid-cols-[120px_180px_1fr_120px_120px] lg:items-center",
            isFuture && "opacity-50"
        )}>

            {/* 1. DATE COLUMN */}
            <div className="flex flex-row justify-between items-center w-full lg:flex-col lg:items-start lg:w-auto">
                <span className="text-sm font-medium">{day}</span>
                <span
                    className={cn(
                        "text-md font-semibold",
                        isToday && "text-white bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center p-2 lg:mt-2"
                    )}
                >
                    {date}
                </span>
                {/* Mobile Only: Show Status Badge next to date on phone */}
                <div className="lg:hidden">
                    {getStatusBadge()}
                </div>
            </div>

            {/* 2. CHECK IN TIME */}
            <div className="flex flex-row justify-between items-center lg:flex-col lg:items-start gap-1">
                <span className="text-xs text-gray-500 font-bold lg:hidden">CHECK IN</span>
                {checkInTime && (
                    <div className="text-sm text-right lg:text-left">
                        <span className="font-medium">{checkInTime}</span>
                        {lateBy && (
                            <div className="text-late text-xs">Late by {lateBy}</div>
                        )}
                    </div>
                )}
            </div>

            {/* 3. TIMELINE & BADGE (Desktop) */}
            {/* On Mobile: We make this full width so the bar is visible */}
            <div className="w-full flex flex-col justify-center px-0 lg:flex-row lg:items-center lg:gap-4">

                {/* The Timeline Bar: Full width on mobile, Flexible on Desktop */}
                <div className="w-full my-2 lg:my-0 lg:flex-1">
                    <TimelineBar
                        startTime={checkInTime}
                        endTime={checkOutTime}
                        status={status}
                        shiftStart={SHIFT_CONFIG.startTime}
                        shiftEnd={SHIFT_CONFIG.endTime}
                    />
                </div>

                {/* Status Badge: Hidden on mobile here (moved to top), Visible on Desktop */}
                <div className="hidden lg:block">
                    {getStatusBadge()}
                </div>
            </div>

            {/* 4. CHECK OUT TIME */}
            <div className="flex flex-row justify-between items-center text-sm lg:block lg:text-right lg:ml-8">
                <span className="text-xs text-gray-500 font-bold lg:hidden">CHECK OUT</span>
                {checkOutTime && (
                    <div className="text-sm text-right lg:text-left">
                        <span className="font-medium">{checkOutTime}</span>
                        {earlyBy && (
                            <div className="text-early text-xs">Early by {earlyBy}</div>
                        )}
                    </div>
                )}
            </div>

            {/* 5. HOURS WORKED */}
            <div className="flex flex-row justify-between items-center border-t pt-2 mt-2 lg:border-0 lg:pt-0 lg:mt-0 lg:block lg:text-right">
                <span className="text-sm font-semibold lg:hidden">Total Hours</span>
                <div>
                    <div className="font-semibold text-right">{hoursWorked}</div>
                    <div className="text-xs text-muted-foreground text-right">Hrs worked</div>
                </div>
            </div>
        </div>
    );

    // return (
    //     <div className={cn(
    //         "grid grid-cols-[120px_180px_1fr_120px_120px] gap-0 items-center py-4 border-b border-border",
    //         isFuture && "opacity-50"
    //     )}>
    //         <div className="flex flex-col">
    //             <span className="text-sm font-medium">{day}</span>
    //             <span
    //                 className={cn(
    //                     "text-md font-semibold",
    //                     isToday && "text-white bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center p-2 mt-2"
    //                 )}
    //             >
    //                 {date}
    //             </span>
    //         </div>

    //         <div className="flex flex-col gap-1">
    //             {checkInTime && (
    //                 <div className="text-sm">
    //                     <span className="font-medium">{checkInTime}</span>
    //                     {lateBy && (
    //                         <div className="text-late text-xs">Late by {lateBy}</div>
    //                     )}
    //                 </div>
    //             )}
    //         </div>

    //         <div className="flex items-center gap-4 px-0">
    //             <TimelineBar
    //                 startTime={checkInTime}
    //                 endTime={checkOutTime}
    //                 status={status}
    //                 shiftStart={SHIFT_CONFIG.startTime}
    //                 shiftEnd={SHIFT_CONFIG.endTime}
    //             />

    //             {getStatusBadge()}

    //             <div className="flex flex-col gap-1">
    //                 {checkOutTime && (
    //                     <div className="text-sm">
    //                         {earlyBy && (
    //                             <div className="text-early text-xs">Early by {earlyBy}</div>
    //                         )}
    //                     </div>
    //                 )}
    //             </div>
    //         </div>

    //         <div className="text-sm text-right">
    //             {checkOutTime && <span className="font-medium">{checkOutTime}</span>}
    //         </div>

    //         <div className="text-right">
    //             <div className="font-semibold">{hoursWorked}</div>
    //             <div className="text-xs text-muted-foreground">Hrs worked</div>
    //         </div>
    //     </div>
    // );
};
