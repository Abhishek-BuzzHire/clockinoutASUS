'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import type { AttendanceRecord, NewEmployee } from '@/lib/types';
import { generateAttendanceData, getEmployees } from '@/lib/attendanceData';
import AttendanceCalendar from '@/components/attendance/attendanceCalender';
import AttendanceSidebar from '@/components/attendance/attendanceSidebar';
import LeaveManagement from '@/components/attendance/leavesManagement';
import CompanyHolidays from '@/components/attendance/CompanyHolidays';

const AdminAttendancePage = () => {
  const tabs = ['Attendance Management', 'Leaves Management']
  const [activeTab, setActiveTab] = useState('Attendance Management')
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const employees = useMemo(() => getEmployees(), []);

  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, AttendanceRecord[]>
  >(() => generateAttendanceData(currentDate));

  const handleMonthChange = (newMonth: Date) => {
    setCurrentDate(newMonth);
    setAttendanceRecords(generateAttendanceData(newMonth));
    setSelectedDate(newMonth);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Attendance Management':
        return (
          <div className="flex flex-col min-h-screen gap-8">
            <div className="text-2xl text-gray-900 space-x-4">
              Attendance Manangement
            </div>
            <div className="flex-1 w-full">
              <div className="grid grid-cols-1 xl:grid-cols-3 xl:gap-4">
                <div className="xl:col-span-2 mb-8">
                  <AttendanceCalendar
                    currentDate={currentDate}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    onMonthChange={handleMonthChange}
                    attendanceRecords={attendanceRecords}
                    totalEmployees={employees.length}
                  />
                </div>
                <div className="pb-4 xl:p-0 xl:pr-4 space-y-4">
                  <AttendanceSidebar
                    selectedDate={selectedDate}
                    dailyRecords={recordsForSelectedDate}
                    employees={employees}
                  />
                  <div className="">
                    <CompanyHolidays />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'Leaves Management':
        return (
          <div className="flex flex-col min-h-screen gap-8">
            <div className="text-2xl text-gray-900 space-x-4">
              Leaves Manangement
            </div>
            <LeaveManagement />
          </div>
        )
      default:
        return (
          <>
          </>
        )
    }
  }

  const recordsForSelectedDate = attendanceRecords[format(selectedDate, 'yyyy-MM-dd')] || [];
  return (
    <div className="w-full bg-blueLight-50 p-4 relative">
      <div className="text-lg">
        <div className="flex space-x-8 text-xs font-bold border-b border-gray-300 mb-12">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`p-2 ${activeTab === tab ? "border-b-2 border-blue-600" : "text-gray-500"}`}>
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
        {renderContent()}
      </div>
    </div>
  )
}

export default AdminAttendancePage