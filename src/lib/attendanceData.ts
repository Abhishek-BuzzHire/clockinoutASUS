import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  addMinutes,
  differenceInHours,
  addDays,
} from 'date-fns';
import type { AdminLeaveRequest, AttendanceRecord, AttendanceStatus, CompanyHoliday, NewEmployee } from './types';

const USER_SCHEDULE = {
  defaultCheckInTime: '09:30',
  defaultCheckOutTime: '17:00',
};

const EMPLOYEES: NewEmployee[] = [
  { id: '1', name: 'Alice Johnson', avatarUrl: 'https://i.pravatar.cc/150?u=alice' },
  { id: '2', name: 'Bob Williams', avatarUrl: 'https://i.pravatar.cc/150?u=bob' },
  { id: '3', name: 'Charlie Brown', avatarUrl: 'https://i.pravatar.cc/150?u=charlie' },
  { id: '4', name: 'Diana Miller', avatarUrl: 'https://i.pravatar.cc/150?u=diana' },
  { id: '5', name: 'Ethan Davis', avatarUrl: 'https://i.pravatar.cc/150?u=ethan' },
  { id: '6', name: 'Fiona Garcia', avatarUrl: 'https://i.pravatar.cc/150?u=fiona' },
  { id: '7', name: 'George Rodriguez', avatarUrl: 'https://i.pravatar.cc/150?u=george' },
  { id: '8', name: 'Hannah Martinez', avatarUrl: 'https://i.pravatar.cc/150?u=hannah' },
  { id: '9', name: 'Ian Hernandez', avatarUrl: 'https://i.pravatar.cc/150?u=ian' },
  { id: '10', name: 'Jane Lopez', avatarUrl: 'https://i.pravatar.cc/150?u=jane' },
  { id: '11', name: 'Kevin Gonzalez', avatarUrl: 'https://i.pravatar.cc/150?u=kevin' },
  { id: '12', name: 'Laura Wilson', avatarUrl: 'https://i.pravatar.cc/150?u=laura' },
  { id: '13', name: 'Mason Anderson', avatarUrl: 'https://i.pravatar.cc/150?u=mason' },
  { id: '14', name: 'Nora Thomas', avatarUrl: 'https://i.pravatar.cc/150?u=nora' },
  { id: '15', name: 'Oscar Taylor', avatarUrl: 'https://i.pravatar.cc/150?u=oscar' },
  { id: '16', name: 'Penelope Moore', avatarUrl: 'https://i.pravatar.cc/150?u=penelope' },
  { id: '17', name: 'Quinn Jackson', avatarUrl: 'https://i.pravatar.cc/150?u=quinn' },
  { id: '18', name: 'Riley White', avatarUrl: 'https://i.pravatar.cc/150?u=riley' },
  { id: '19', name: 'Sophia Harris', avatarUrl: 'https://i.pravatar.cc/150?u=sophia' },
  { id: '20', name: 'Thomas Martin', avatarUrl: 'https://i.pravatar.cc/150?u=thomas' },
  { id: '21', name: 'Zoe Lee', avatarUrl: 'https://i.pravatar.cc/150?u=zoe' },
  { id: '22', name: 'Adam Walker', avatarUrl: 'https://i.pravatar.cc/150?u=adam' },
  { id: '23', name: 'Bill Hall', avatarUrl: 'https://i.pravatar.cc/150?u=bill' },
  { id: '24', name: 'Carla Allen', avatarUrl: 'https://i.pravatar.cc/150?u=carla' },
  { id: '25', name: 'Derek Young', avatarUrl: 'https://i.pravatar.cc/150?u=derek' },
];

const randomBetween = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const addRandomMinutes = (time: string, min: number, max: number): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  const modifiedDate = addMinutes(date, randomBetween(min, max));
  return format(modifiedDate, 'HH:mm');
};

export const getEmployees = (): NewEmployee[] => EMPLOYEES;

const generateLeaveRequests = (monthDate: Date): AdminLeaveRequest[] => {
  const requests: AdminLeaveRequest[] = [];
  const start = startOfMonth(monthDate);
  
  EMPLOYEES.forEach(employee => {
    if (Math.random() < 0.3) { // 30% chance of an employee having a leave request in the month
      const leaveStartDay = randomBetween(1, 25);
      const leaveDuration = randomBetween(1, 5);
      const startDate = addDays(start, leaveStartDay -1);
      const endDate = addDays(startDate, leaveDuration - 1);
      
      const statusRoll = Math.random();
      let status: 'approved' | 'pending' | 'rejected' = 'approved';
      if (statusRoll > 0.9) status = 'rejected';
      else if (statusRoll > 0.8) status = 'pending';

      const typeRoll = Math.random();
      let leaveType: 'vacation' | 'sick' | 'personal' = 'vacation';
      if (typeRoll > 0.8) leaveType = 'sick';
      else if (typeRoll > 0.7) leaveType = 'personal';

      requests.push({
        id: `${employee.id}-${leaveStartDay}`,
        employeeId: employee.id,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        status,
        leaveType
      });
    }
  });
  return requests;
};


const getCompanyHolidays = (year: number): CompanyHoliday[] => {
    // This is a static list, but could be dynamic in a real app
    return [
        { date: `${year}-12-25`, name: "Christmas Day" },
        { date: "2026-01-26", name: "Republic Day" },
        { date: "2026-03-04", name: "Holi"},
    ];
};

let monthlyLeaveRequestsCache: Record<string, AdminLeaveRequest[]> = {};
let companyHolidaysCache: Record<number, CompanyHoliday[]> = {};


export const getLeaveDataForMonth = (monthDate: Date) => {
    const monthKey = format(monthDate, 'yyyy-MM');
    const year = monthDate.getFullYear();

    if (!monthlyLeaveRequestsCache[monthKey]) {
        monthlyLeaveRequestsCache[monthKey] = generateLeaveRequests(monthDate);
    }
    if (!companyHolidaysCache[year]) {
        companyHolidaysCache[year] = getCompanyHolidays(year);
    }
    
    return {
        leaveRequests: monthlyLeaveRequestsCache[monthKey],
        companyHolidays: companyHolidaysCache[year],
    }
}


export const generateAttendanceData = (
  monthDate: Date
): Record<string, AttendanceRecord[]> => {
  const recordsByDate: Record<string, AttendanceRecord[]> = {};
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(monthDate),
    end: endOfMonth(monthDate),
  });

  const { leaveRequests, companyHolidays } = getLeaveDataForMonth(monthDate);

  const holidaysMap = new Map(companyHolidays.map(h => [h.date, h]));
  const approvedLeavesByDate: Record<string, string[]> = {};
  
  leaveRequests.forEach(req => {
    if (req.status === 'approved') {
        const leaveDays = eachDayOfInterval({ start: new Date(req.startDate), end: new Date(req.endDate) });
        leaveDays.forEach(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            if (!approvedLeavesByDate[dateStr]) {
                approvedLeavesByDate[dateStr] = [];
            }
            approvedLeavesByDate[dateStr].push(req.employeeId);
        });
    }
  });


  daysInMonth.forEach((day) => {
    const date = format(day, 'yyyy-MM-dd');
    recordsByDate[date] = [];

    // Don't generate data for future dates
    if (day > new Date()) {
      return;
    }
    
    if (holidaysMap.has(date)) {
        // It's a company holiday, everyone is on leave
        EMPLOYEES.forEach(employee => {
            recordsByDate[date].push({ employeeId: employee.id, date, status: 'on-leave' });
        });
        return;
    }

    const dayOfWeek = getDay(day);
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
      EMPLOYEES.forEach(employee => {
        recordsByDate[date].push({
          employeeId: employee.id,
          date,
          status: 'weekend',
        });
      });
      return;
    }
    
    const employeesOnLeaveToday = approvedLeavesByDate[date] || [];

    EMPLOYEES.forEach(employee => {
      if (employeesOnLeaveToday.includes(employee.id)) {
        recordsByDate[date].push({ employeeId: employee.id, date, status: 'on-leave' });
        return;
      }

      let status: AttendanceStatus = 'present';
      let checkInTime: string | undefined = undefined;
      let checkOutTime: string | undefined = undefined;
      let hoursWorked: number | undefined = undefined;

      const randomValue = Math.random();
      if (randomValue < 0.05) { // 5% chance of being absent
        status = 'absent';
      } else {
        const isLate = Math.random() < 0.2; // 20% chance of being late
        const isEarly = !isLate && Math.random() < 0.15; // 15% chance of leaving early

        if (isLate) {
          status = 'late';
          checkInTime = addRandomMinutes(USER_SCHEDULE.defaultCheckInTime, 5, 45);
        } else {
          checkInTime = addRandomMinutes(USER_SCHEDULE.defaultCheckInTime, -10, 0);
        }

        if (isEarly) {
          status = isLate ? 'late' : 'early'; // if late, status remains late
          checkOutTime = addRandomMinutes(USER_SCHEDULE.defaultCheckOutTime, -60, -5);
        } else {
          checkOutTime = addRandomMinutes(USER_SCHEDULE.defaultCheckOutTime, 0, 30);
        }

        if (checkInTime && checkOutTime) {
          const checkInDate = new Date(`${date}T${checkInTime}`);
          const checkOutDate = new Date(`${date}T${checkOutTime}`);
          const hours = parseFloat((differenceInHours(checkOutDate, checkInDate)).toFixed(2));
          hoursWorked = hours < 0 ? 0 : hours;
        }
      }
      recordsByDate[date].push({ employeeId: employee.id, date, status, checkInTime, checkOutTime, hoursWorked });
    });
  });

  return recordsByDate;
};