export type DayStatus = "weekend" | "absent" | "present" | "today" | "future";

export interface AttendanceEntry {
  date: string; // YYYY-MM-DD format
  checkInTime: string | null; // HH:mm format
  checkOutTime: string | null; // HH:mm format
  notes?: string;
}

export interface ShiftConfig {
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}
