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
                <Badge key="weekend" className="bg-weekend-light text-weekend border-0 hover:bg-weekend-light">
                    Weekend
                </Badge>
            );
        }
        if (status === "absent") {
            badges.push(
                <Badge key="absent" className="bg-absent-light text-absent border-0 hover:bg-absent-light">
                    Absent
                </Badge>
            );
        }
        if (status === "present") {
            badges.push(
                <Badge key="present" className="bg-success-light text-success border-0 hover:bg-success-light">
                    Present
                </Badge>
            );
        }

        return badges.length > 0 ? <div className="flex gap-2">{badges}</div> : null;

        // old code commented out
        // if (status === "weekend") {
        //     return (
        //         <Badge className="bg-weekend-light text-weekend border-0 hover:bg-weekend-light">
        //             Weekend
        //         </Badge>
        //     );
        // }
        // if (status === "absent") {
        //     return (
        //         <Badge className="bg-absent-light text-absent border-0 hover:bg-absent-light">
        //             Absent
        //         </Badge>
        //     );
        // }
        // if (status === "present") {
        //     return (
        //         <Badge className="bg-green-500 text-absent border-0 hover:bg-absent-light">
        //             Present
        //         </Badge>
        //     );
        // }
        // return null;
    };

    return (
        <div className={cn(
            "grid grid-cols-[120px_180px_1fr_120px_120px] gap-0 items-center py-4 border-b border-border",
            isFuture && "opacity-50"
        )}>
            <div className="flex flex-col">
                <span className="text-sm font-medium">{day}</span>
                <span
                    className={cn(
                        "text-md font-semibold",
                        isToday && "text-white bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center p-2 mt-2"
                    )}
                >
                    {date}
                </span>
            </div>

            <div className="flex flex-col gap-1">
                {checkInTime && (
                    <div className="text-sm">
                        <span className="font-medium">{checkInTime}</span>
                        {lateBy && (
                            <div className="text-late text-xs">Late by {lateBy}</div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4 px-0">
                <TimelineBar
                    startTime={checkInTime}
                    endTime={checkOutTime}
                    status={status}
                    shiftStart={SHIFT_CONFIG.startTime}
                    shiftEnd={SHIFT_CONFIG.endTime}
                />

                {getStatusBadge()}

                <div className="flex flex-col gap-1">
                    {checkOutTime && (
                        <div className="text-sm">
                            {earlyBy && (
                                <div className="text-early text-xs">Early by {earlyBy}</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="text-sm text-right">
                {checkOutTime && <span className="font-medium">{checkOutTime}</span>}
            </div>

            <div className="text-right">
                <div className="font-semibold">{hoursWorked}</div>
                <div className="text-xs text-muted-foreground">Hrs worked</div>
            </div>
        </div>
    );
};
