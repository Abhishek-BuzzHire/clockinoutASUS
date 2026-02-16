import { Button } from "@/components/ui/button";
import { CalendarDays, Calendar1, CalendarPlus, ChevronLeft, ChevronRight, ClockArrowUp, Home, MoreVertical, List } from "lucide-react";
import { format } from "date-fns";
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
    viewMode: "weekly" | "monthly";
    onViewChange: (mode: "weekly" | "monthly") => void;
    monthStart: Date;
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
    viewMode,
    onViewChange,
    monthStart,
    onToday,
    shiftStart,
    shiftEnd,

    onRegularize,
    onApplyLeave,
    onApplyWFH,

}: TimesheetHeaderProps) => {

    const toggleViewMode = () => {
        onViewChange(viewMode === "weekly" ? "monthly" : "weekly");

    };

    return (
        <div className="space-y-4 bg-card rounded-lg border border-border shadow-sm p-4">
            {/* Flex Column on mobile, Row on Medium+ */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">

                <div className="flex items-center gap-0 justify-between w-full md:w-auto">

                    {/* PREV */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onNavigate("prev")}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* DATE + ICON */}
                    <div className="flex items-center">

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToday}
                            className="h-8 w-8 rounded-full hover:bg-indigo-600 hover:text-white transition"
                        >
                            {viewMode === "weekly" ? (

                                /* Weekly → Static Icon */
                                <CalendarDays className="h-4 w-4" />

                            ) : (

                                /* Monthly → Calendar + Month Day Overlay */
                                <>
                                    <Calendar1 className="h-5 w-5" />
                                </>
                            )}
                        </Button>

                        {/* DATE TEXT */}
                        <span className="text-sm font-semibold ml-2">
                            {viewMode === "weekly"
                                ? `${format(weekStart, "dd-MMM-yyyy")} - ${format(weekEnd, "dd-MMM-yyyy")}`
                                : format(monthStart, "MMMM yyyy")}
                        </span>

                    </div>

                    {/* NEXT */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-1"
                        onClick={() => onNavigate("next")}
                    >
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
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleViewMode}
                        title={
                            viewMode === "weekly"
                                ? "Switch to Monthly View"
                                : "Switch to Weekly View"
                        }
                        className={viewMode === "weekly" ? "bg-indigo-600 text-white" : "text-indigo-600 border border-indigo-600"}
                    >
                        {viewMode === "weekly" ? (
                            <List className="h-4 w-4" />
                        ) : (
                            <Calendar1 className="h-4 w-4 " />
                        )}
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
                            className="w-64 rounded-2xl border border-borderbg-white/95 backdrop-blur-xlshadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)]p-2"
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
