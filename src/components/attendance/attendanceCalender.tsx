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
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import type { AttendanceRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
// import { TimeTrackLogo } from '@/components/icons';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type AttendanceCalendarProps = {
  currentDate: Date;
  selectedDate: Date;
  attendanceRecords: Record<string, AttendanceRecord[]>;
  onSelectDate: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  totalEmployees: number;
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
  totalEmployees
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
            onClick={() => onMonthChange(subMonths(currentDate, 1))}
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
            const records = attendanceRecords[dateKey] || [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = isSameDay(day, selectedDate);
            const isTodaysDate = isToday(day);
            
            const summary = {
              present: records.filter(r => r.status === 'present' || r.status === 'early').length,
              absent: records.filter(r => r.status === 'absent').length,
              late: records.filter(r => r.status === 'late').length,
            };
            
            const isWeekend = records.some(r => r.status === 'weekend');

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
                    isTodaysDate && 'flex items-center justify-center h-6 w-6 rounded-full p-4 bg-brand-600 text-blue-600'
                  )}
                >
                  {format(day, 'd')}
                </time>
                {isCurrentMonth && !isWeekend && records.length > 0 && (
                  <div className="flex flex-col items-start gap-1 w-full">
                    <AttendanceStat label="Present" value={summary.present + summary.late} color="bg-green-500" />
                    <AttendanceStat label="Absent" value={summary.absent} color="bg-red-500" />
                    <AttendanceStat label="Late" value={summary.late} color="bg-yellow-500" />
                  </div>
                )}
                 {isWeekend && isCurrentMonth && (
                    <div className="text-xs text-muted-foreground self-center">Weekend</div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
