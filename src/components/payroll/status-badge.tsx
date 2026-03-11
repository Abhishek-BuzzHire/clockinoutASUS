import { Badge } from "@/components/ui/badge";
import { PayrollStatus } from "@/lib/types/payroll";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: PayrollStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants: Record<PayrollStatus, { label: string, variant: "default" | "secondary" | "outline" | "destructive", color: string }> = {
    OPEN: { label: "Open", variant: "outline", color: "text-blue-600 border-blue-200 bg-blue-50" },
    DRAFT: { label: "Draft", variant: "secondary", color: "text-amber-600 border-amber-200 bg-amber-50" },
    FINALIZED: { label: "Finalized", variant: "default", color: "text-emerald-700 border-emerald-200 bg-emerald-50" },
    LOCKED: { label: "Locked", variant: "destructive", color: "text-slate-600 border-slate-200 bg-slate-100" },
  };

  const config = variants[status];

  return (
    <Badge 
      variant={config.variant} 
      className={cn("px-2.5 py-0.5 font-medium rounded-full", config.color, className)}
    >
      {config.label}
    </Badge>
  );
}