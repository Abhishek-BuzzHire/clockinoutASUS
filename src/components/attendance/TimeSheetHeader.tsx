import { Button } from "@/components/ui/button";
import { Calendar, CalendarPlus, ChevronLeft, ChevronRight, ClockArrowUp, Grid3x3, Home, List, MoreHorizontal, MoreVertical, Table2 } from "lucide-react";
import { format } from "date-fns";
import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";



interface TimesheetHeaderProps {
    weekStart: Date;
    weekEnd: Date;
    onNavigate: (direction: "prev" | "next") => void;
    onToday: () => void;
    shiftStart: string;
    shiftEnd: string;


    onRegularize: () => void;
    onApplyLeave: () => void;
    onApplyWFH: () => void;
}

export const TimesheetHeader = ({
    weekStart,
    weekEnd,
    onNavigate,
    onToday,
    shiftStart,
    shiftEnd,

    onRegularize,
    onApplyLeave,
    onApplyWFH,

}: TimesheetHeaderProps) => {
    const [menuOpen, setMenuOpen] = React.useState(false);

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

                    <Button variant="ghost" size="icon" className="ml-1" onClick={() => onNavigate("next")}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <span className="text-sm font-semibold whitespace-nowrap">
                    General [ {shiftStart} A.M. - {shiftEnd} P.M. ]
                </span>

                {/* Hide extra view icons on mobile, show on medium+ */}
                <div className="flex items-center gap-2">
                    {/* <Button variant="ghost" size="icon" className="bg-indigo-600 text-card">
                        <Grid3x3 className="h-4 w-4" />
                    </Button> */}
                    <Button variant="ghost" size="icon" className="hidden md:flex bg-indigo-600 text-card">
                        <List className="h-4 w-4" />
                    </Button>
                    {/* <Button variant="ghost" size="icon">
                        <Table2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button> */}
                    <Button variant={"secondary"} className="hidden md:block hover:bg-indigo-600 hover:text-white">
                        Get Data
                    </Button>

                    <DropdownMenu>

                        {/* Trigger Button */}
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>

                        {/* Menu Content */}
                        <DropdownMenuContent
                            align="end"
                            className="
      w-64 rounded-2xl border border-border
      bg-white/95 backdrop-blur-xl
      shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)]
      p-2
    "
                        >

                            {/* Regularize */}
                            <DropdownMenuItem
                                onClick={onRegularize}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer"
                            >
                                <ClockArrowUp className="w-4 h-4 text-slate-500" />
                                Regularize Attendance
                            </DropdownMenuItem>

                            {/* Apply Leave */}
                            <DropdownMenuItem
                                onClick={onApplyLeave}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-blue-50"
                            >
                                <CalendarPlus className="w-4 h-4 text-blue-500" />
                                Apply For Leave
                            </DropdownMenuItem>

                            {/* Apply WFH */}
                            <DropdownMenuItem
                                onClick={onApplyWFH}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-indigo-50"
                            >
                                <Home className="w-4 h-4 text-indigo-500" />
                                Apply For WFH
                            </DropdownMenuItem>

                        </DropdownMenuContent>

                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
};
