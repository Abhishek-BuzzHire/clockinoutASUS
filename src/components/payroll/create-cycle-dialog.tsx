"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import { payrollApi } from "@/lib/payroll-api";
import { useToast } from "@/hooks/use-toast";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";

export function CreateCycleDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1–12
  const [cutoffDate, setCutoffDate] = useState(`${currentYear}-${String(currentMonth).padStart(2, "0")}-25`);

  // Month config: label for UI, value for backend
  const months = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    // const selectedMonth = formData.get("month") as string;
    // const selectedYear = parseInt(formData.get("year") as string);
    // const cutoff = new Date(formData.get("cutoff_date") as string);

    // const cutoffMonthName = cutoff.toLocaleString("default", { month: "long" });
    // const cutoffYear = cutoff.getFullYear();

    // if (cutoffMonthName !== selectedMonth || cutoffYear !== selectedYear) {
    //   toast({
    //     variant: "destructive",
    //     title: "Invalid cutoff date",
    //     description: "Cutoff date must be within the selected payroll month and year.",
    //   });
    //   setLoading(false);
    //   return;
    // }

    try {
      await payrollApi.createCycle({
        month: Number(formData.get("month")), // ✅ numeric month
        year: Number(formData.get("year")),
        cutoff_date: formData.get("cutoff_date") as string,
      });

      toast({
        title: "Success",
        description: "Payroll cycle created successfully.",
      });

      setOpen(false);
      onCreated();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error?.response?.data?.detail ||
          "Failed to create payroll cycle.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Payroll Cycle
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Payroll Cycle</DialogTitle>
            <DialogDescription>
              Payroll will be calculated based on attendance up to the selected cutoff date.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Month */}
            <div className="grid gap-2">
              <Label>Month</Label>
              <Select name="month" defaultValue={String(currentMonth)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div className="grid gap-2">
              <Label>Year</Label>
              <Select
                name="year"
                defaultValue={String(currentYear)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {[currentYear, currentYear - 1].map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cutoff Date */}
            <div className="grid gap-2">
              <Label htmlFor="cutoff_date">Payroll Cutoff Date</Label>
              <input type="hidden" name="cutoff_date" value={cutoffDate} />
              <CustomDatePicker
                value={cutoffDate}
                onChange={val => setCutoffDate(val)}
                placeholder="Select cutoff date"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Cycle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}