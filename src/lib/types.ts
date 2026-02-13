export type DayStatus = "weekend" | "absent" | "present" | "today" | "future" | "leave" | "holiday" | "WFH";

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
  | 'missing-punch-out'
  | 'leave'
  | null;

export type NewEmployee = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type AttendanceRecord = {
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  lateBy?: string | null;
  workStatus?: "WFO" | "WFH" | "LEAVE" | null;
  checkInTime?: string; // HH:mm
  checkOutTime?: string; // HH:mm
  hoursWorked?: number;
};

export type employeeAttendance={
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  lateBy?: string | null;
  workStatus?: "WFO" | "WFH" | "LEAVE" | null;
  checkInTime?: string; // HH:mm
  checkOutTime?: string; // HH:mm
  hoursWorked?: number;
}

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


export type CalendarDay = {
  date: string;
  weekday: string;
  is_working_day: boolean;
  calendar_type: string;
  holiday_name: string | null;
  override_type: string | null;
  expected_hours: number;
};

export type Employee = {
  id: string,
  name: string,
  phone: string,
  email: string,
  address: string,
  jobTitle: string,
  department: string,
  joiningDate: Date | string,
  isPresentToday: boolean,
  salary: number,
  manager: string,
  photo: string
}


export interface Candidate {
  id: string;
  name: string;
  phone: string;
  email: string;
  salary: number | null;
  expected_ctc: number | null;
  notice: number | null;
  totalExperienceYears: number | null;
  location: string;
  cvUrl: string;
  currentCompanyName: string;
  skills: string[];
  education: string;
  jobTitle: string;
  customFields?: Record<string, string>;
  source?: string;
  createdAt?: string;
}


export interface CandidateRec {
  name: string;
  id: string;
  email: string;
  phone: string;
  location: string;
  age: number;
  salary: number;
  notice: number;
  sex: string;
  skills: string[];
  total_experience_years: number;
  current_company_name: string;
  previous_companies_name: string[];
  education: string;
  cv_url: string;
  job_title: string;
  source: string;
  createdAt: string;
}