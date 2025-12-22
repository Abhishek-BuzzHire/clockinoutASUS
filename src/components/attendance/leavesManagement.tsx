'use client';

import { useState, useMemo } from 'react';
import {
    eachDayOfInterval,
    format,
    addMonths,
    subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Building, MoreHorizontal, Pencil, CalendarDays } from 'lucide-react';
import { getEmployees, getLeaveDataForMonth } from '@/lib/attendanceData';
import type { CompanyHoliday, AdminLeaveRequest } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CompanyHolidays from './CompanyHolidays';

type LeaveStatus = AdminLeaveRequest['status'];

export default function LeaveManagement() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const employees = useMemo(() => getEmployees(), []);
    const employeeMap = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees]);

    const initialLeaveData = useMemo(() => getLeaveDataForMonth(currentDate), [currentDate]);

    const [leaveRequests, setLeaveRequests] = useState<AdminLeaveRequest[]>(initialLeaveData.leaveRequests);
    const { companyHolidays } = initialLeaveData;

    const [activeTab, setActiveTab] = useState<LeaveStatus | 'all'>('all');

    const handleStatusChange = (requestId: string, newStatus: LeaveStatus) => {
        setLeaveRequests(currentRequests =>
            currentRequests.map(req =>
                req.id === requestId ? { ...req, status: newStatus } : req
            )
        );
    };

    const filteredLeaveRequests = useMemo(() => {
        if (activeTab === 'all') return leaveRequests;
        return leaveRequests.filter(req => req.status === activeTab);
    }, [leaveRequests, activeTab]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 shadow-sm">
                <CardHeader>
                    <div className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Leave Requests</CardTitle>
                            <CardDescription>All requests for {format(currentDate, 'MMMM yyyy')}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LeaveStatus | 'all')}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="approved">Approved</TabsTrigger>
                            <TabsTrigger value="rejected">Rejected</TabsTrigger>
                        </TabsList>
                        <ScrollArea className="h-[540px] mt-4">
                            <div className="space-y-4">
                                {filteredLeaveRequests.map((req) => {
                                    const employee = employeeMap.get(req.employeeId);
                                    if (!employee) return null;

                                    const statusColors = {
                                        approved: 'text-green-600 bg-green-100',
                                        pending: 'text-yellow-600 bg-yellow-100',
                                        rejected: 'text-red-600 bg-red-100',
                                    };

                                    return (
                                        <div key={req.id} className="p-4 rounded-md border bg-card">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium text-sm">{employee.name}</p>
                                                        <p className="text-xs text-muted-foreground capitalize">{req.leaveType} Leave</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusColors[req.status])}>
                                                        {req.status}
                                                    </span>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'approved')}>
                                                                Approve
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'rejected')}>
                                                                Reject
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'pending')}>
                                                                Set as Pending
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-sm text-muted-foreground">
                                                {format(new Date(req.startDate), 'MMM d')} - {format(new Date(req.endDate), 'MMM d, yyyy')}
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredLeaveRequests.length === 0 && (
                                    <p className="text-center text-muted-foreground py-8">
                                        No leave requests with status &quot;{activeTab}&quot; for this month.
                                    </p>
                                )}
                            </div>
                        </ScrollArea>
                    </Tabs>
                </CardContent>
            </Card>
            <CompanyHolidays />
        </div>
    );
}
