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

export interface LeaveType {
  id: string;
  name: string;
  icon: string;
  available: number;
  booked: number;
  color: string;
}

export interface LeaveRequest {
  id: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
}

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'weekend'
  | 'late'
  | 'early'
  | 'on-leave';

export type NewEmployee = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type AttendanceRecord = {
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkInTime?: string; // HH:mm
  checkOutTime?: string; // HH:mm
  hoursWorked?: number;
};

export type AdminLeaveRequest = {
  id: string;
  employeeId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: 'approved' | 'pending' | 'rejected';
  leaveType: 'vacation' | 'sick' | 'personal';
};

export type CompanyHoliday = {
  date: string; // YYYY-MM-DD
  name: string;
};