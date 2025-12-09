import { cn } from "@/lib/utils";

import { DayStatus } from "@/lib/types";

interface TimelineBarProps {
  startTime?: string;
  endTime?: string;
  status: DayStatus;
  shiftStart: string;
  shiftEnd: string;
}

export const TimelineBar = ({
  startTime,
  endTime,
  status,
  shiftStart,
  shiftEnd,
}: TimelineBarProps) => {
  const getPosition = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    const shiftStartMinutes = 9 * 60; // 9 AM
    const shiftEndMinutes = 18 * 60; // 6 PM
    const totalShiftMinutes = shiftEndMinutes - shiftStartMinutes;
    return ((totalMinutes - shiftStartMinutes) / totalShiftMinutes) * 100;
  };

  const getBarStyle = () => {
    if (!startTime || !endTime) {
      return { left: "0%", right: "0%" };
    }

    const leftPos = getPosition(startTime);
    const rightPos = 100 - getPosition(endTime);

    return {
      left: `${Math.max(0, leftPos)}%`,
      right: `${Math.max(0, rightPos)}%`,
    };
  };

  const barStyle = getBarStyle();

  return (
    <div className="relative h-1 bg-timeline-bg rounded-full w-full">
      <div
        className={cn(
          "absolute h-full rounded-full transition-all",
          status === "weekend" && "bg-weekend",
          status === "absent" && "bg-absent",
          status === "present" && "bg-muted-foreground",
          status === "today" && "bg-background",
          status === "future" && "bg-timeline-inactive"
        )}
        style={barStyle}
      />
      {startTime && (
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-success"
          style={{ left: barStyle.left }}
        />
      )}
      {endTime && (
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-success"
          style={{ right: barStyle.right }}
        />
      )}
    </div>
  );

  // return (
  //   <div className="relative h-1 bg-timeline-bg rounded-full w-full">
  //     <div
  //       className={cn(
  //         "absolute h-full rounded-full transition-all",
  //         status === "weekend" && "bg-weekend",
  //         status === "absent" && "bg-absent",
  //         status === "present" && "bg-muted-foreground",
  //         status === "today" && "bg-background",
  //         status === "future" && "bg-timeline-inactive"
  //       )}
  //       style={barStyle}
  //     />
  //     {startTime && (
  //       <div
  //         className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-success"
  //         style={{ left: barStyle.left }}
  //       />
  //     )}
  //     {endTime && (
  //       <div
  //         className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-success"
  //         style={{ right: barStyle.right }}
  //       />
  //     )}
  //   </div>
  // );
};