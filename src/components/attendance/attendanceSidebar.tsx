'use client';

import { format } from 'date-fns';
import { User, Clock, AlertTriangle, UserX } from 'lucide-react';
import type { AttendanceRecord, NewEmployee } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

type AttendanceSidebarProps = {
  selectedDate: Date;
  dailyRecords: AttendanceRecord[];
  employees: NewEmployee[];
};

const EmployeeListItem = ({ record, employee }: { record: AttendanceRecord; employee?: NewEmployee }) => {
  if (!employee) return null;
  return (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-md">{employee.name}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {record.checkInTime && <span>In: {record.checkInTime}</span>}
            {record.checkOutTime ? <span>Out: {record.checkOutTime}</span> : <span className="text-red-500">No Clock Out</span>}
            {record.hoursWorked != null && <span>Hrs: {record.hoursWorked}</span>}
          </div>
        </div>
      </div>
      {record.status === 'late' && (
        <div className="flex items-center gap-1 text-orange-500 text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>Late</span>
        </div>
      )}
    </div>
  );
};

export default function AttendanceSidebar({
  selectedDate,
  dailyRecords,
  employees,
}: AttendanceSidebarProps) {
  
  const employeeMap = new Map(employees.map(e => [e.id, e]));

  const presentEmployees = dailyRecords.filter(r => r.status === 'present' || r.status === 'early' || r.status === 'late');
  const absentEmployees = dailyRecords.filter(r => r.status === 'absent');
  const lateEmployees = dailyRecords.filter(r => r.status === 'late');
  
  const getEmployee = (id: string) => employeeMap.get(id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance</CardTitle>
          <CardDescription>{format(selectedDate, 'EEEE, MMMM do, yyyy')}</CardDescription>
        </CardHeader>
        <CardContent>
          {dailyRecords.length === 0 || dailyRecords.every(r => r.status === 'weekend') ? (
            <div className="text-center py-8 text-muted-foreground">
              {dailyRecords.length > 0 ? 'Weekend' : 'No records for this day.'}
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
                <TabsTrigger value="late">
                  <Clock className="mr-2 h-4 w-4" /> Late ({lateEmployees.length})
                </TabsTrigger>
              </TabsList>
              <ScrollArea className="h-96 mt-4">
                <TabsContent value="present">
                  <div className="space-y-1">
                    {presentEmployees.map(record => (
                      <EmployeeListItem key={record.employeeId} record={record} employee={getEmployee(record.employeeId)} />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="absent">
                  <div className="space-y-1">
                    {absentEmployees.map(record => (
                      <EmployeeListItem key={record.employeeId} record={record} employee={getEmployee(record.employeeId)} />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="late">
                  <div className="space-y-1">
                    {lateEmployees.map(record => (
                      <EmployeeListItem key={record.employeeId} record={record} employee={getEmployee(record.employeeId)} />
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
