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
            {/* Flex Column on mobile, Row on Medium+ */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                <div className="flex items-center gap-0 justify-between w-full md:w-auto">
                    <Button variant="ghost" size="icon" onClick={() => onNavigate("prev")}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* Wrapped date and calendar icon together */}
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" onClick={onToday}>
                            <Calendar className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-semibold ml-2">
                            {format(weekStart, "dd-MMM-yyyy")} - {format(weekEnd, "dd-MMM-yyyy")}
                        </span>
                    </div>

                    <Button variant="ghost" size="icon" onClick={() => onNavigate("next")}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <span className="text-sm font-semibold whitespace-nowrap">
                    General [ {shiftStart} A.M. - {shiftEnd} P.M. ]
                </span>

                {/* Hide extra view icons on mobile, show on medium+ */}
                <div className="hidden md:flex items-center gap-2">
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

    // return (
    //     <div className="space-y-4 bg-card rounded-lg border border-border shadow-sm p-4">
    //         <div className="flex items-center justify-between">
    //             <div className="flex items-center gap-0">
    //                 <Button variant="ghost" size="icon" onClick={() => onNavigate("prev")}>
    //                     <ChevronLeft className="h-4 w-4" />
    //                 </Button>
    //                 <Button variant="ghost" size="icon" onClick={onToday}>
    //                     <Calendar className="h-4 w-4" />
    //                 </Button>
    //                 <Button variant="ghost" size="icon" onClick={() => onNavigate("next")}>
    //                     <ChevronRight className="h-4 w-4" />
    //                 </Button>
    //                 <span className="text-sm font-semibold ml-2">
    //                     {format(weekStart, "dd-MMM-yyyy")} - {format(weekEnd, "dd-MMM-yyyy")}
    //                 </span>
    //             </div>
    //             <span className="text-sm font-semibold whitespace-nowrap">
    //                 General [ {shiftStart} A.M. - {shiftEnd} P.M. ]
    //             </span>
    //             <div className="flex items-center gap-2">
    //                 <Button variant="ghost" size="icon" className="bg-indigo-600 text-card">
    //                     <Grid3x3 className="h-4 w-4" />
    //                 </Button>
    //                 <Button variant="ghost" size="icon">
    //                     <List className="h-4 w-4" />
    //                 </Button>
    //                 <Button variant="ghost" size="icon">
    //                     <Table2 className="h-4 w-4" />
    //                 </Button>
    //                 <Button variant="ghost" size="icon">
    //                     <MoreHorizontal className="h-4 w-4" />
    //                 </Button>
    //             </div>
    //         </div>
    //     </div>
    // );
};
