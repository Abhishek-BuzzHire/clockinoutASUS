"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { payrollApi } from "@/lib/payroll-api";
import { PayrollCycle  } from "@/lib/types/payroll";
import { StatusBadge } from "@/components/payroll/status-badge";
import { CreateCycleDialog } from "@/components/payroll/create-cycle-dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronRight, FileText, LayoutDashboard, Users, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PayrollDashboard() {
  const [cycles, setCycles] = useState<PayrollCycle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCycles = async () => {
    setLoading(true);
    const data = await payrollApi.getCycles();
    setCycles(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCycles();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Payroll Overview</h2>
            <p className="text-muted-foreground">Manage and track monthly payroll processing cycles.</p>
          </div>
          <CreateCycleDialog onCreated={fetchCycles} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Cycles</CardTitle>
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cycles.filter(c => c.status !== 'LOCKED').length}</div>
              <p className="text-xs text-muted-foreground mt-1">Requiring HR attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground mt-1">Across 8 departments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Last Payout</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$312,800</div>
              <p className="text-xs text-muted-foreground mt-1">February 2024</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b px-6 py-4">
            <CardTitle className="text-lg font-semibold">Payroll Cycles</CardTitle>
            <CardDescription>Comprehensive list of recent and historical payroll cycles.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-semibold px-6">Month / Year</TableHead>
                    <TableHead className="font-semibold">Attendance Period</TableHead>
                    <TableHead className="font-semibold">Cutoff Date</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right px-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cycles.map((cycle) => (
                    <TableRow key={cycle.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium px-6 py-4">
                        {cycle.month}/{cycle.year}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {cycle.start_date} → {cycle.end_date}
                      </TableCell>
                      <TableCell>{cycle.cutoff_date}</TableCell>
                      <TableCell>
                        <StatusBadge status={cycle.status} />
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <Button variant="ghost" size="sm" asChild className="text-primary hover:bg-primary/10">
                          <Link href={`/list/payroll/payrollcycle/${cycle.id}`} className="flex items-center gap-1">
                            {cycle.status === 'OPEN' ? 'Process' : 'View Details'}
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}