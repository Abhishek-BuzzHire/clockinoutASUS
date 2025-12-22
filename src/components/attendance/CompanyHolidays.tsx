import { CalendarDays } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { ScrollArea } from "../ui/scroll-area"
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { getLeaveDataForMonth } from "@/lib/attendanceData";

const CompanyHolidays = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const initialLeaveData = useMemo(() => getLeaveDataForMonth(currentDate), [currentDate]);
    const { companyHolidays } = initialLeaveData;
    return (
        <Card className="lg:col-span-1 shadow-sm">
            <CardHeader>
                <CardTitle>Company Holidays</CardTitle>
                <CardDescription>Upcoming holidays for {format(currentDate, 'yyyy')}</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[270px]">
                    <div className="space-y-4">
                        {companyHolidays.map((holiday) => (
                            <div key={holiday.date} className="flex items-center p-3 rounded-md bg-muted/50">
                                <div className="p-2 bg-muted rounded-md mr-4">
                                    <CalendarDays className="h-6 w-6 text-foreground" />
                                </div>
                                <div>
                                    <p className="font-semibold">{holiday.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(holiday.date), 'EEEE, MMMM do')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

export default CompanyHolidays