"use client";

import { useState, useEffect } from "react";
import { payrollApi } from "@/lib/payroll-api";
import { PayrollCycle, PayrollRun } from "@/lib/types/payroll";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Download, FileText, Search, Wallet } from "lucide-react";

export default function PayslipsPage() {
    const [cycles, setCycles] = useState<PayrollCycle[]>([]);
    const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
    const [runs, setRuns] = useState<PayrollRun[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const data = await payrollApi.getCycles();
            // Only cycles that are FINALIZED or LOCKED have payslips
            setCycles(
                data.filter(
                    (c: PayrollCycle) =>
                        c.status === "FINALIZED" || c.status === "LOCKED"
                )
            );
        };
        fetchData();
    }, []);

    const loadRuns = async (cycleId: number) => {
        setSelectedCycleId(cycleId);
        const data = await payrollApi.getPayrollRuns(cycleId);
        setRuns(data);
    };

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-6 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-foreground">Payslip Management</h2>
                    <p className="text-muted-foreground">Access and download payroll records.</p>
                </div>

                <Tabs defaultValue="my-payslips" className="space-y-6">
                    <TabsList className="bg-slate-200/50 p-1">
                        <TabsTrigger value="my-payslips" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">My Payslips</TabsTrigger>
                        <TabsTrigger value="admin-view" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Organization Wide</TabsTrigger>
                    </TabsList>

                    <TabsContent value="my-payslips">
                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="px-6 font-semibold">Month / Year</TableHead>
                                            <TableHead className="font-semibold">Release Date</TableHead>
                                            <TableHead className="font-semibold text-right px-6">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {cycles.map((cycle) => (
                                            <TableRow key={cycle.id} className="hover:bg-slate-50/50">
                                                <TableCell className="px-6 py-4 font-medium">{cycle.month} {cycle.year}</TableCell>
                                                <TableCell className="text-muted-foreground">{cycle.cutoff_date}</TableCell>
                                                <TableCell className="text-right px-6">
                                                    <Button variant="outline" size="sm" className="text-primary border-primary/20 hover:bg-primary/5">
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download PDF
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {cycles.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-10 text-muted-foreground italic">No payslips available yet.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="admin-view">
                        <Card>
                            <CardHeader>
                                <CardTitle>Payroll Runs</CardTitle>
                                <CardDescription>
                                    Select a payroll cycle to view employee payslips.
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                <select
                                    className="mb-4"
                                    onChange={(e) => loadRuns(Number(e.target.value))}
                                >
                                    <option value="">Select Cycle</option>
                                    {cycles.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.month} {c.year}
                                        </option>
                                    ))}
                                </select>

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Department</TableHead>
                                            <TableHead>Designation</TableHead>
                                            <TableHead className="text-right">Net Salary</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {runs
                                            .filter((r) =>
                                                r.employee_name.toLowerCase().includes(search.toLowerCase())
                                            )
                                            .map((run) => (
                                                <TableRow key={run.id}>
                                                    <TableCell>{run.employee_name}</TableCell>
                                                    <TableCell>{run.department}</TableCell>
                                                    <TableCell>{run.designation}</TableCell>
                                                    <TableCell className="text-right">
                                                        ₹{run.net_salary}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}