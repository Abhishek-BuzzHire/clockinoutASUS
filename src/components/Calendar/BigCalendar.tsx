"use client";

import { Calendar, momentLocalizer, View, Views, NavigateAction, DateCellWrapperProps } from "react-big-calendar";
import moment from "moment";
import { useState } from "react";
import { calendarEvents } from "@/lib/types/jobdata";

const localizer = momentLocalizer(moment);
const today = new Date();

const DateHeader: React.FC<{ date: Date }> = ({ date }) => {
    const dayName = moment(date).format("ddd"); // Sun
    const dayNumber = moment(date).format("D"); // 10
    const isToday = moment(date).isSame(moment(), "day");
    const isTodayWeekday = moment(date).format("ddd") === moment().format("ddd");

    return (
        <div className="text-center">
            <div className={`text-md ${isTodayWeekday ? 'text-black font-bold' : 'text-gray-500 font-semibold'}`}>{dayName}</div>
            <div className={`text-sm  mt-1 ${isToday ? 'text-white bg-blue-600 p-2 rounded-full font-bold' : 'text-gray-500 font-semibold'}`} >{dayNumber}</div>
        </div>
    );
};

// const dateCell: React.FC<DateCellWrapperProps> = ({ value, children }) => {
//   const isToday = moment(value).isSame(moment(), "day");

//   return (
//     <div
//       className={`rbc-day-bg ${
//         isToday ? "bg-indigo-100 border border-indigo-500" : ""
//       }`}
//     >
//       {children}
//     </div>
//   );
// };

const BigCalendar = () => {
    const [view, setView] = useState<View>(Views.WEEK);
    const [date, setDate] = useState<Date>(today);

    const handleOnChangeView = (selectedView: View) => {
        setView(selectedView);
    };

    const handleOnNavigate = (newDate: Date, currentView: View, action: NavigateAction) => {
        let updatedDate = date;

        switch (action) {
            case "TODAY":
                updatedDate = new Date();
                break;

            case "DATE":
                updatedDate = newDate;
                break;

            case "NEXT":
                if (currentView === Views.DAY) {
                    updatedDate = moment(date).add(1, "day").toDate();
                } else if (currentView === Views.WEEK || currentView === Views.WORK_WEEK) {
                    updatedDate = moment(date).add(1, "week").toDate();
                } else if (currentView === Views.MONTH) {
                    updatedDate = moment(date).add(1, "month").toDate();
                } else {
                    updatedDate = newDate; // fallback
                }
                break;

            case "PREV":
                if (currentView === Views.DAY) {
                    updatedDate = moment(date).subtract(1, "day").toDate();
                } else if (currentView === Views.WEEK || currentView === Views.WORK_WEEK) {
                    updatedDate = moment(date).subtract(1, "week").toDate();
                } else if (currentView === Views.MONTH) {
                    updatedDate = moment(date).subtract(1, "month").toDate();
                } else {
                    updatedDate = newDate; // fallback
                }
                break;

            default:
                updatedDate = newDate;
                break;
        }

        setDate(updatedDate);
    };

    return (
        <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            views={[Views.WEEK, Views.DAY, Views.MONTH, Views.AGENDA]}
            view={view}
            date={date}
            onView={handleOnChangeView}
            onNavigate={handleOnNavigate}
            min={new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0)}
            max={new Date(today.getFullYear(), today.getMonth(), today.getDate(), 21, 0)}
            components={{
                week: { header: DateHeader },
                day: { header: DateHeader },
                month: { header: DateHeader },
                // dateCellWrapper: dateCell
            }}
        />
    );
};

export default BigCalendar;