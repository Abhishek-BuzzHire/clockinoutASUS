'use client';

import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { format } from 'date-fns';
import { User, Clock, AlertTriangle, UserX, FileEdit, Lock, Unlock } from 'lucide-react';
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

  return (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
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
