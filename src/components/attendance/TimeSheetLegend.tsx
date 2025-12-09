import { cn } from "@/lib/utils";

interface LegendItemProps {
  label: string;
  count: string;
  color?: string;
}

const LegendItem = ({ label, count, color }: LegendItemProps) => (
  <div className="flex items-center gap-2">
    {color && (
      <div
        className={cn("w-4 h-8 border-l-4", color)}
      />
    )}
    <div className="flex flex-col">
      <span className="text-xs font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">{count}</span>
    </div>
  </div>
);

export const TimesheetLegend = () => {
  return (
    <div className="flex pl-36 items-center gap-8 py-4 border-t border-border bg-card">
      <LegendItem label="Days" count="7 Days" color="border-today" />
      <LegendItem label="Payable Days" count="2 Days" color="border-warning-400" />
      <LegendItem label="Present" count="0 Days" color="border-success-400" />
      <LegendItem label="On Duty" count="0 Days" color="border-primary" />
      <LegendItem label="Paid leave" count="0 Days" color="border-warning-400" />
      <LegendItem label="Holidays" count="0 Days" color="border-today" />
      <LegendItem label="Weekend" count="2 Days" color="border-yellow-400" />
    </div>
  );
};
