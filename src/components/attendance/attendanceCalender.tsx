'use client';

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
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import type { AttendanceRecord, CalendarDay } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
// import { TimeTrackLogo } from '@/components/icons';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AttendanceDay } from '@/app/(dashboard)/list/attendance/admin/page';

type AttendanceCalendarProps = {
  currentDate: Date;
  selectedDate: Date;
  attendanceRecords: Record<string, AttendanceDay>;
  onSelectDate: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  totalEmployees: number;
  calendarMap: Record<string, CalendarDay>;
};

const AttendanceStat = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div className="flex items-center gap-1.5 text-sm">
    <span className={cn('h-2 w-2 rounded-full', color)}></span>
    <span>
      {label}: {value}
    </span>
  </div>
);

export default function AttendanceCalendar({
  currentDate,
  selectedDate,
  attendanceRecords,
  onSelectDate,
  onMonthChange,
  totalEmployees,
  calendarMap
}: AttendanceCalendarProps) {
  const firstDayOfMonth = startOfMonth(currentDate);

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(firstDayOfMonth),
      end: endOfWeek(endOfMonth(firstDayOfMonth)),
    });
  }, [firstDayOfMonth]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="border-0 shadow-md xl:border xl:shadow-md">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-end gap-4 p-4 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const prev = subMonths(currentDate, 1);
              if (prev.getFullYear() < 2025 || (prev.getFullYear() === 2025 && prev.getMonth() < 11)) return;
              onMonthChange(prev);
            }}
            disabled={currentDate.getFullYear() < 2025 || (currentDate.getFullYear() === 2025 && currentDate.getMonth() <= 11)}
            className={currentDate.getFullYear() < 2025 || (currentDate.getFullYear() === 2025 && currentDate.getMonth() <= 11) ? "opacity-30 cursor-not-allowed" : ""}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="w-32 text-center font-semibold text-foreground">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onMonthChange(addMonths(currentDate, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-sm text-muted-foreground">
          {daysOfWeek.map((day) => (
            <div key={day} className="font-medium py-2">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayData = attendanceRecords[dateKey];
            const records = dayData?.records || [];
            const summary = dayData?.summary;
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = isSameDay(day, selectedDate);
            const isTodaysDate = isToday(day);

            const calendarDay = calendarMap[dateKey];
            const isWeekend = calendarDay?.calendar_type === "WEEKEND";
            const isHoliday = calendarDay?.calendar_type === "HOLIDAY";
            const isOverride = calendarDay?.calendar_type === "OVERRIDE";
            const isWorkingDay = calendarDay?.is_working_day;
            const isFutureDay = isAfter(startOfDay(day), startOfDay(new Date()));
            const presentCount = summary?.present || 0;

            return (
              <button
                key={dateKey}
                onClick={() => onSelectDate(day)}
                disabled={!isCurrentMonth}
                className={cn(
                  'relative flex flex-col items-start justify-between p-2 h-28 sm:h-40 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  isCurrentMonth ? 'bg-card hover:bg-secondary' : 'bg-muted/50 text-muted-foreground',
                  isSelected && 'ring-2 ring-primary ring-offset-2',
                  !isCurrentMonth && 'opacity-50 cursor-default'
                )}
              >
                <time
                  dateTime={dateKey}
                  className={cn(
                    'text-md font-semibold',
                    isTodaysDate && 'flex items-center justify-center h-5 w-5 rounded-full p-5 bg-indigo-600 text-white'
                  )}
                >
                  {format(day, 'd')}
                </time>
                {isCurrentMonth && isWorkingDay && summary && !isFutureDay && (
                  <div className="flex flex-col items-start gap-1 w-full">
                    <AttendanceStat label="Present" value={summary.present} color="bg-green-500" />
                    <AttendanceStat label="Absent" value={summary.absent} color="bg-red-500" />
                    {summary.leave > 0 && (
                      <AttendanceStat label="Leave" value={summary.leave} color="bg-blue-500" />
                    )}
                  </div>
                )}
                {isCurrentMonth && isWorkingDay && summary?.leave > 0 && isFutureDay && (
                  <AttendanceStat label="Leave" value={summary.leave} color="bg-blue-500" />
                )}

                {isCurrentMonth && !isFutureDay && (isWeekend || isHoliday) && summary?.present! > 0 && (
                  <div className="flex flex-col items-start gap-1 w-full gap-4">
                    <AttendanceStat label="Present" value={presentCount} color="bg-green-500" />
                    {isWeekend ? <div className="text-xs text-muted-foreground self-center">Weekend</div> : <div className="text-md text-red-500 self-center">{calendarDay.holiday_name}</div>}
                  </div>
                )}
                {isWeekend && (!summary || summary.present === 0) && isCurrentMonth && (
                  <div className="text-xs text-muted-foreground self-center">Weekend</div>
                )}
                {isHoliday && (!summary || summary.present === 0) && isCurrentMonth && (
                  <div className="text-md text-red-500 self-center">
                    {calendarDay.holiday_name}
                  </div>
                )}
                {isOverride && (
                  <div className="text-xs text-yellow-600 self-center">
                    Working Day
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
