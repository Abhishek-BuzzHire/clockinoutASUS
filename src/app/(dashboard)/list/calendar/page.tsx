import BigCalendar from "@/components/Calendar/BigCalendar"

const CalendarPage = () => {
    return (
        <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
            {/* LEFT */}
            <div className="w-full xl:w-full">
                <div className="h-screen bg-white p-4 rounded-md bg-white shadow-lg">
                    <h1 className="text-xl font-semibold">Schedule</h1>
                    <BigCalendar />
                </div>
            </div>
        </div>
    )
}

export default CalendarPage