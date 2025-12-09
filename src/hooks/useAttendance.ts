import { useState, useEffect, useCallback } from "react";
import { AttendanceEntry, ShiftConfig } from "@/lib/types";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay, parseISO, addWeeks, differenceInMinutes } from "date-fns";

const SHIFT_CONFIG: ShiftConfig = {
  startTime: "09:00",
  endTime: "18:00",
};

export const useAttendance = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceEntry>>({});
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("attendanceData");
    if (saved) {
      setAttendanceData(JSON.parse(saved));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("attendanceData", JSON.stringify(attendanceData));
  }, [attendanceData]);

  // Timer for active check-in
  useEffect(() => {
    if (!activeTimer) {
      setElapsedTime(0);
      return;
    }

    const entry = attendanceData[activeTimer];
    if (!entry?.checkInTime) return;

    const updateTimer = () => {
      const checkInDate = parseISO(`${activeTimer}T${entry.checkInTime}`);
      const now = new Date();
      const minutes = differenceInMinutes(now, checkInDate);
      setElapsedTime(minutes);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activeTimer, attendanceData]);

  const checkIn = useCallback((date: string, notes?: string) => {
    const now = new Date();
    const time = format(now, "HH:mm");

    setAttendanceData((prev) => ({
      ...prev,
      [date]: {
        date,
        checkInTime: time,
        checkOutTime: null,
        notes,
      },
    }));
    setActiveTimer(date);
  }, []);

  const checkOut = useCallback((date: string) => {
    const now = new Date();
    const time = format(now, "HH:mm");

    setAttendanceData((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        checkOutTime: time,
      },
    }));
    setActiveTimer(null);
    setElapsedTime(0);
  }, []);

  const getWeekDates = useCallback(() => {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: currentWeekStart, end: weekEnd });
  }, [currentWeekStart]);

  const navigateWeek = useCallback((direction: "prev" | "next") => {
    setCurrentWeekStart((prev) => addWeeks(prev, direction === "next" ? 1 : -1));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
  }, []);

  const calculateHoursWorked = useCallback((date: string): number => {
    const entry = attendanceData[date];
    if (!entry?.checkInTime) return 0;

    const checkInDate = parseISO(`${date}T${entry.checkInTime}`);
    let checkOutDate: Date;

    if (entry.checkOutTime) {
      checkOutDate = parseISO(`${date}T${entry.checkOutTime}`);
    } else if (activeTimer === date) {
      checkOutDate = new Date();
    } else {
      return 0;
    }

    return differenceInMinutes(checkOutDate, checkInDate) / 60;
  }, [attendanceData, activeTimer]);

  const calculateLateness = useCallback((date: string): number => {
    const entry = attendanceData[date];
    if (!entry?.checkInTime) return 0;

    const checkInDate = parseISO(`${date}T${entry.checkInTime}`);
    const shiftStartDate = parseISO(`${date}T${SHIFT_CONFIG.startTime}`);
    const minutes = differenceInMinutes(checkInDate, shiftStartDate);

    return minutes > 0 ? minutes : 0;
  }, [attendanceData]);

  const calculateEarlyLeave = useCallback((date: string): number => {
    const entry = attendanceData[date];
    if (!entry?.checkOutTime) return 0;

    const checkOutDate = parseISO(`${date}T${entry.checkOutTime}`);
    const shiftEndDate = parseISO(`${date}T${SHIFT_CONFIG.endTime}`);
    const minutes = differenceInMinutes(shiftEndDate, checkOutDate);

    return minutes > 0 ? minutes : 0;
  }, [attendanceData]);

  return {
    attendanceData,
    currentWeekStart,
    activeTimer,
    elapsedTime,
    shiftConfig: SHIFT_CONFIG,
    checkIn,
    checkOut,
    getWeekDates,
    navigateWeek,
    goToToday,
    calculateHoursWorked,
    calculateLateness,
    calculateEarlyLeave,
  };
};
