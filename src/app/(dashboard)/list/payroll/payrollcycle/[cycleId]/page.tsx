"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { payrollApi } from "@/lib/payroll-api";
import { PayrollCycle, PayrollRun } from "@/lib/types/payroll";
import { StatusBadge } from "@/components/payroll/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { ChevronLeft, Download, FileCheck, LayoutDashboard, Loader2, Search, SlidersHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function PayrollRunPage() {
  const { cycleId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [cycle, setCycle] = useState<PayrollCycle | null>(null);
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const cycleData = await payrollApi.getCycleById(cycleId as string);
    if (!cycleData) {
      router.push("/");
      return;
    }
    setCycle(cycleData);
    if (cycleData.status !== 'OPEN') {
      const runData = await payrollApi.getPayrollRuns(cycleId as string);
      setRuns(runData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [cycleId]);

  const filteredRuns = useMemo(() => {
    return runs.filter(r =>
      r.employee_name.toLowerCase().includes(search.toLowerCase()) ||
      r.employee_id.toLowerCase().includes(search.toLowerCase())
    );
  }, [runs, search]);

  const handleGenerate = async () => {
    setProcessing(true);
    try {
      await payrollApi.generatePayroll(cycleId as string);
      toast({ title: "Success", description: "Payroll generated successfully." });
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Generation failed." });
    } finally {
      setProcessing(false);
    }
  };

  const handleFinalize = async () => {
    setProcessing(true);
    try {
      await payrollApi.finalizePayroll(cycleId as string);
      toast({ title: "Success", description: "Payroll finalized and locked." });
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Finalization failed." });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="container mx-auto p-10 space-y-6">
      <Skeleton className="h-12 w-1/3" />
      <Skeleton className="h-64 w-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#EFF3F6]">
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("../")} className="text-muted-foreground">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-primary">
              Payroll Processing: {cycle?.month} {cycle?.year}
            </h1>
            <StatusBadge status={cycle!.status} />
          </div>
          <div className="flex gap-2">
            {cycle?.status === 'OPEN' && (
              <Button onClick={handleGenerate} disabled={processing} className="bg-primary">
                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Payroll
              </Button>
            )}
            {cycle?.status === 'DRAFT' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <FileCheck className="mr-2 h-4 w-4" />
                    Finalize Payroll
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Finalize Payroll for {cycle.month} {cycle.year}?</AlertDialogTitle>
                    <AlertDialogDescription className="text-amber-700 bg-amber-50 p-3 rounded border border-amber-200">
                      Warning: Once finalized, payroll data becomes read-only and cannot be modified. Ensure all data is reviewed and accurate.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Review Again</AlertDialogCancel>
                    <AlertDialogAction onClick={handleFinalize} className="bg-emerald-600 hover:bg-emerald-700">
                      Confirm Finalization
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {cycle?.status === 'FINALIZED' && (
              <Button variant="outline" className="border-primary text-primary">
                <Download className="mr-2 h-4 w-4" />
                Export Bank Sheet
              </Button>
            )}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {cycle?.status !== 'OPEN' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Total Gross</p>
                <p className="text-2xl font-bold">{cycle?.total_gross?.toLocaleString() || '368,000'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Total Deductions</p>
                <p className="text-2xl font-bold text-rose-600">{cycle?.total_deductions?.toLocaleString() || '55,200'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Net Payout</p>
                <p className="text-2xl font-bold text-primary">{cycle?.total_net?.toLocaleString() || '312,800'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Employees Processed</p>
                <p className="text-2xl font-bold">{cycle?.employee_count || '5'}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {cycle?.status === 'OPEN' ? (
          <Card className="flex flex-col items-center justify-center p-20 border-dashed bg-slate-50 border-2">
            <LayoutDashboard className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600">Payroll Not Generated</h3>
            <p className="text-slate-500 mb-6">Start processing this cycle to generate employee payroll runs.</p>
            <Button onClick={handleGenerate} disabled={processing} size="lg" className="bg-primary">
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Begin Generation
            </Button>
          </Card>
        ) : (
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-white px-6 py-4 flex flex-row items-center justify-between border-b">
              <CardTitle className="text-lg">Employee Payroll Data</CardTitle>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employee..."
                    className="pl-9 w-[250px]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="px-6 py-3 font-semibold w-[250px]">Employee</TableHead>
                    <TableHead className="font-semibold text-center">Working Days (Exp/Pay/LOP)</TableHead>
                    <TableHead className="font-semibold text-center">Leaves (P/U)</TableHead>
                    <TableHead className="font-semibold text-center">Absent Days</TableHead>
                    <TableHead className="font-semibold text-right">Gross Salary</TableHead>
                    <TableHead className="font-semibold text-right">Deductions</TableHead>
                    <TableHead className="font-semibold text-right pr-6">Net Salary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRuns.map((run) => (
                    <TableRow key={run.id} className="group border-b">
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{run.employee_name}</span>
                          <span className="text-xs text-muted-foreground">{run.employee_id} • {run.department}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        <span className="text-slate-400">{run.expected_hours} / </span>
                        <span className="text-primary">{run.payable_hours} / </span>
                        <span className="text-rose-600">{run.unpaid_hours}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-emerald-600">{run.paid_leave_dates.length}</span>
                        <span className="text-slate-300 mx-1">/</span>
                        <span className="text-rose-600">{run.unpaid_leave_dates.length}</span>
                      </TableCell>
                      <TableCell className="text-center text-rose-600 font-medium">{run.absent_dates.length}</TableCell>
                      <TableCell className="text-right font-mono">{run.gross_salary.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-rose-600">-{run.deductions.toLocaleString()}</TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-primary font-mono">{run.net_salary.toLocaleString()}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="p-6 bg-slate-50/30">
                <h4 className="text-sm font-semibold mb-4 text-slate-500 uppercase tracking-wider">Detailed Salary Breakdown</h4>
                <Accordion type="single" collapsible className="w-full">
                  {filteredRuns.slice(0, 1).map((run) => (
                    <AccordionItem key={`breakdown-${run.id}`} value={run.id} className="border bg-white rounded-lg mb-4">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <span className="text-sm font-medium">View detailed components for {run.employee_name}</span>
                      </AccordionTrigger>
                      {/* <AccordionContent className="px-4 pb-4">
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <h5 className="text-xs font-bold text-emerald-700 mb-2 uppercase">Earnings</h5>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm"><span>Basic Pay</span><span>${run.breakdown.basic.toLocaleString()}</span></div>
                              <div className="flex justify-between text-sm"><span>HRA</span><span>${run.breakdown.hra.toLocaleString()}</span></div>
                              <div className="flex justify-between text-sm"><span>Allowances</span><span>${run.breakdown.allowances.toLocaleString()}</span></div>
                            </div>
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-rose-700 mb-2 uppercase">Deductions</h5>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm"><span>PF Contribution</span><span>${run.breakdown.pf_contribution.toLocaleString()}</span></div>
                              <div className="flex justify-between text-sm"><span>Professional Tax</span><span>${run.breakdown.tax.toLocaleString()}</span></div>
                              <div className="flex justify-between text-sm"><span>Other</span><span>${run.breakdown.other_deductions.toLocaleString()}</span></div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent> */}
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
