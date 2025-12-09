import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Grid3x3, List, MoreHorizontal, Table2 } from "lucide-react";
import { format } from "date-fns";

interface TimesheetHeaderProps {
    weekStart: Date;
    weekEnd: Date;
    onNavigate: (direction: "prev" | "next") => void;
    onToday: () => void;
    shiftStart: string;
    shiftEnd: string;
}

export const TimesheetHeader = ({
    weekStart,
    weekEnd,
    onNavigate,
    onToday,
    shiftStart,
    shiftEnd,
}: TimesheetHeaderProps) => {

    return (
        <div className="space-y-4 bg-card rounded-lg border border-border shadow-sm p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-0">
                    <Button variant="ghost" size="icon" onClick={() => onNavigate("prev")}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onToday}>
                        <Calendar className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onNavigate("next")}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-semibold ml-2">
                        {format(weekStart, "dd-MMM-yyyy")} - {format(weekEnd, "dd-MMM-yyyy")}
                    </span>
                </div>
                <span className="text-sm font-semibold whitespace-nowrap">
                    General [ {shiftStart} A.M. - {shiftEnd} P.M. ]
                </span>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="bg-indigo-600 text-card">
                        <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <List className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Table2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
