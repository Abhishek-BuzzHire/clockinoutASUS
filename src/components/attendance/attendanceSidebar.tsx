'use client';

import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { format } from 'date-fns';
import { User, Clock, AlertTriangle, UserX, FileEdit, Lock, Unlock, CalendarX } from 'lucide-react';
import type { AttendanceRecord, NewEmployee } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

type AttendanceSidebarProps = {
  selectedDate: Date;
  dailyRecords: AttendanceRecord[];
  employees: NewEmployee[];
  onRefresh?: () => void;
};


const EmployeeListItem = ({
  record,
  employee,
  onRefresh,
}: {
  record: AttendanceRecord;
  employee?: NewEmployee;
  onRefresh?: () => void;
}) => {
  if (!employee) return null;
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleToggle = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("access");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(
        `${apiUrl}/api/admin/past-date-permission/`,
        {
          user_id: record.employeeId,
          date: record.date,
        },
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to toggle permission");
    } finally {
      setLoading(false);
    }
  };

  const handleForceMarkLeave = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("access");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(
        `${apiUrl}/api/admin/force-mark-leave/`,
        {
          emp_id: record.employeeId,
          date: record.date,
        },
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to mark leave");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group flex items-center justify-between p-2 rounded-md hover:bg-muted/50 relative">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-md">{employee.name}</p>

            {record.workStatus === "WFH" && (
              <span className="p-1 text-xs rounded-sm bg-blue-600 text-white font-medium">
                WFH
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {record.checkInTime ? <span>In: {record.checkInTime}</span> : <span className="text-red-500">No Clock In</span>}
            {record.checkOutTime ? <span>Out: {record.checkOutTime}</span> : <span className="text-red-500">No Clock Out</span>}
            {record.hoursWorked != null && <span>Hrs: {record.hoursWorked}</span>}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {record.workStatus !== "LEAVE" && record.status !== "leave" && (
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={loading}
            className="hidden group-hover:flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-800 transition-colors shadow-sm cursor-pointer"
            title="Force Mark Leave"
          >
            {loading ? "..." : (
              <>
                <CalendarX className="h-3.5 w-3.5" />
                Mark Leave
              </>
            )}
          </button>
        )}

        {record.canGrantPastPermission && (
          <div>
            {record.pastPermissionGranted ? (
              <button
                onClick={handleToggle}
                disabled={loading}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors shadow-sm"
                title="Click to revoke permission"
              >
                {loading ? "..." : <><Unlock className="h-3.5 w-3.5" /> Allowed</>}
              </button>
            ) : (
              <button
                onClick={handleToggle}
                disabled={loading}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"
                title="Allow employee to apply for leave/WFH/regularization on this past date"
              >
                {loading ? "..." : <><Lock className="h-3.5 w-3.5" /> Allow Request</>}
              </button>
            )}
          </div>
        )}

        {record.lateBy && (
          <div className="flex items-center gap-1 text-orange-500 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Late by {record.lateBy}</span>
          </div>
        )}
      </div>

      {/* Beautiful Modal Pop-up for Leave Confirmation */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-slate-100 transform scale-100 transition-transform">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-4 animate-bounce">
                <CalendarX className="h-6 w-6" />
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Confirm Force Leave
              </h3>
              
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Are you sure you want to force mark leave for <span className="font-semibold text-slate-800">{employee.name}</span> on <span className="font-semibold text-slate-800">{record.date}</span>?
                This will overwrite their attendance for this date and deduct 1 leave from their bucket.
              </p>
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setShowConfirmModal(false);
                    await handleForceMarkLeave();
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  {loading ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AttendanceSidebar({
  selectedDate,
  dailyRecords,
  employees,
  onRefresh,
}: AttendanceSidebarProps) {

  const employeeMap = new Map(employees.map(e => [e.id, e]));

  const presentEmployees = dailyRecords.filter(r => r.status === 'present')
  const absentEmployees = dailyRecords.filter(r => r.status === 'absent');
  // const lateEmployees = dailyRecords.filter(r => r.status === 'late');
  const leaveEmployees = dailyRecords.filter(r => r.status === 'leave');

  const getEmployee = (id: string) => employeeMap.get(id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance</CardTitle>
          <CardDescription>{format(selectedDate, 'EEEE, MMMM do, yyyy')}</CardDescription>
        </CardHeader>
        <CardContent>
          {dailyRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No records for this day.
            </div>
          ) : (
            <Tabs defaultValue="present" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="present">
                  <User className="mr-2 h-4 w-4" /> Present ({presentEmployees.length})
                </TabsTrigger>
                <TabsTrigger value="absent">
                  <UserX className="mr-2 h-4 w-4" /> Absent ({absentEmployees.length})
                </TabsTrigger>
                <TabsTrigger value="leave">
                  <FileEdit /> Leave ({leaveEmployees.length})
                </TabsTrigger>
              </TabsList>
              <ScrollArea className="h-96 mt-4">
                <TabsContent value="present">
                  <div className="space-y-1">
                    {presentEmployees.map(record => (
                      <EmployeeListItem key={record.employeeId} record={record} employee={getEmployee(record.employeeId)} onRefresh={onRefresh} />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="absent">
                  <div className="space-y-1">
                    {absentEmployees.map(record => (
                      <EmployeeListItem key={record.employeeId} record={record} employee={getEmployee(record.employeeId)} onRefresh={onRefresh} />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="leave">
                  <div className="space-y-1">
                    {leaveEmployees.map(record => (
                      <EmployeeListItem key={record.employeeId} record={record} employee={getEmployee(record.employeeId)} onRefresh={onRefresh} />
                    ))}
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
