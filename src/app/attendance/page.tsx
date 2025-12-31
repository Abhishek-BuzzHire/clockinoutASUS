"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { format, isToday, isFuture, isWeekend, endOfWeek } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { TimeEntryRow } from "@/components/attendance/TimeEntryRow";
import { TimesheetHeader } from "@/components/attendance/TimeSheetHeader";
import { ShiftConfig } from "@/lib/types";
import { ConfirmClockOutModal } from "@/components/attendance/confirmClockOut";
import AttendanceRegularizationPopup from "@/components/attendance/attendanceRegulizer";
import { Button } from "@/components/ui/button";
import EmployeeLeaveSummaryCard from "@/components/attendance/EmployeeLeaveSummaryCard";
import EmployeeLeaveHistoryTable from "@/components/attendance/EmployeeLeaveHistoryTable";
import ApplyLeaveModal from "@/components/attendance/ApplyLeaveModal";
import EmployeeWFHHistoryTable from "@/components/attendance/EmployeeWFHHistoryTable";
import ApplyWFHModal from "@/components/attendance/ApplyWFHModal";
import { CalendarDays, CalendarPlus, ClockArrowUp, Home, Laptop, LayoutDashboard, LogOut, Plus } from "lucide-react";

export const SHIFT_CONFIG: ShiftConfig = {
    startTime: "09:30",
    endTime: "19:00",
};

type WeeklyAttendance = {
    date: string;
    punch_in_time: string | null;
    punch_out_time: string | null;
    working_time: string | null;
};


type DayStatus = "weekend" | "absent" | "present" | "today" | "future";

const apiUrl = "https://buzzhire.trueledgrr.com"

type AttendanceRecord = {
    id?: number;
    user?: number;
    date?: string;
    punch_in_time?: string | null;
    punch_out_time?: string | null;
    punch_in_lat?: number | null;
    punch_in_lon?: number | null;
    // add other fields as needed
};

type PunchResponse = {
    status: "success" | "failed";
    message: string;
    data?: AttendanceRecord;
};

const PunchCard: React.FC<{
    isPunchedIn: boolean;
    handlePunchAction: () => void;
    punchTime: string;
    elapsedSeconds: number;
    profileName?: string;
    imgurl?: string;
}> = ({ isPunchedIn, handlePunchAction, punchTime, elapsedSeconds, profileName, imgurl }) => {
    const [elapsedTime, setElapsedTime] = useState<number>(elapsedSeconds ?? 0);
    const intervalRef = useRef<number | null>(null);

    // Sync elapsedSeconds when it is provided/changes (e.g., on load)
    useEffect(() => {
        setElapsedTime(elapsedSeconds ?? 0);
    }, [elapsedSeconds]);

    // Start/stop timer based on isPunchedIn
    useEffect(() => {
        if (isPunchedIn) {
            // use window.setInterval return type for browsers
            intervalRef.current = window.setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000) as unknown as number;
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPunchedIn]);

    // Reset briefly when punched out (visual)
    useEffect(() => {
        if (!isPunchedIn && elapsedTime > 0) {
            const timeout = window.setTimeout(() => {
                setElapsedTime(0);
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [isPunchedIn, elapsedTime]);

    return (
        <div className="relative w-full max-w-sm mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="flex justify-center -mt-12 mb-4">
                <Image
                    src={imgurl || '/image.jpg'}
                    alt={profileName || "employee"}
                    className="rounded-full object-cover border-2 border-white shadow-md relative"
                    width={112}
                    height={112}
                />
            </div>

            <div className="text-center px-4 pb-8">
                <h3 className="text-xl font-semibold text-gray-800">{profileName ?? "Employee"}</h3>
                <p className="text-sm text-gray-500 mb-2">BuzzHire Employee</p>

                <p className={`font-bold text-lg mb-2 ${isPunchedIn ? "text-green-600" : "text-red-600"}`}>
                    {isPunchedIn ? "IN" : "OUT"}
                </p>
                <button
                    onClick={handlePunchAction}
                    className={`w-2/3 py-3 rounded-lg font-normal text-white text-md shadow-lg transform transition-all duration-300
            ${isPunchedIn ? "bg-red-500 shadow-red-300/50" : "bg-green-500 shadow-green-300/50"}
            hover:scale-[1.02] active:scale-[0.98]`}
                >
                    {isPunchedIn ? "Clock Out" : "Clock In"}
                </button>
                <p className="mt-4 text-xs text-gray-500">
                    {isPunchedIn ? `Punched In at: ${punchTime}` : punchTime ? `Punched Out at: ${punchTime}` : "Ready to start your shift."}
                </p>
            </div>
        </div>
    );
};

const sumWorkingTime = (data: WeeklyAttendance[]) => {
    let totalMinutes = 0;

    data.forEach(item => {
        if (!item.working_time) return;

        const [hours, minutes] = item.working_time.split(":").map(Number);
        totalMinutes += hours * 60 + minutes;
    });

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    return `${totalHours}:${remainingMinutes.toString().padStart(2, "0")}`;
};


const EmployeeAttendancePage = () => {
    // Auth + router
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    const tabs = ["Attendance", "Leaves & WFH"];
    const [activeTab, setActiveTab] = useState("Attendance");

    // Geolocation
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Attendance state (backend-driven)
    const [attendanceStatus, setAttendanceStatus] = useState<AttendanceRecord | null>(null);
    const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceRecord | undefined>>({});
    const [message, setMessage] = useState<string | null>(null);

    // Timer / UI state
    const [punchTime, setPunchTime] = useState<string>("");
    const [initialElapsedSeconds, setInitialElapsedSeconds] = useState<number>(0);

    const [showClockOutModal, setShowClockOutModal] = useState(false);
    const [workingHours, setWorkingHours] = useState<string | undefined>(undefined);

    const [weeklyAttendance, setWeeklyAttendance] = useState<WeeklyAttendance[]>([]);
    const [totalWeeklyHours, setTotalWeeklyHours] = useState<string>("0:00");

    const [openRegulize, setOpenRegulize] = useState(false);
    const [loadingRegulize, setLoadingRegulize] = useState(false);
    const [messageRegulize, setMessageRegulize] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [loadingLeaves, setLoadingLeaves] = useState(false);
    const [summaryLeaves, setSummaryLeaves] = useState<any>(null);
    const [requestsLeaves, setRequestsLeaves] = useState<any[]>([]);

    const [openApplyLeaves, setOpenApplyLeaves] = useState(false);

    const [loadingWfh, setLoadingWfh] = useState(false);
    const [requestsWfh, setRequestsWfh] = useState<any[]>([]);
    const [openApplyWfh, setOpenApplyWfh] = useState(false);

    const loadWFHRequests = async () => {
        try {
            setLoadingWfh(true);
            const token = Cookies.get("access");

            const res = await axios.get(
                `${apiUrl}/wfh/my-requests/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setRequestsWfh(res.data.results || []);
        } catch (err) {
            console.error(err);
            alert("Failed to load WFH requests");
        } finally {
            setLoadingWfh(false);
        }
    };

    useEffect(() => {
        loadWFHRequests();
    }, []);

    const applyWFH = async (date: string) => {
        try {
            const token = Cookies.get("access");

            const res = await axios.post(
                `${apiUrl}/wfh/apply/`,
                { date },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("WFH Request Submitted");
            setOpenApplyWfh(false);
            loadWFHRequests();
        } catch (err: any) {
            alert(err?.response?.data?.message || "Failed to apply WFH");
        }
    };


    const loadSummary = async () => {
        try {
            setLoadingLeaves(true);
            const token = Cookies.get("access");

            const res = await axios.get(
                `${apiUrl}/api/employee/leave/summary/`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setSummaryLeaves(res.data.leave_summary);
            setRequestsLeaves(res.data.leave_requests);
        } catch (err) {
            console.error(err);
            alert("Failed to load leave summary");
        } finally {
            setLoadingLeaves(false);
        }
    };

    useEffect(() => {
        loadSummary();
    }, []);

    const applyLeave = async (payload: {
        start_date: string;
        end_date: string;
        reason: string;
    }) => {
        try {
            const token = Cookies.get("access");

            const res = await axios.post(
                `${apiUrl}/api/employee/leave/apply/`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            alert(res.data.message);
            setOpenApplyLeaves(false);
            loadSummary();
        } catch (err: any) {
            alert(err?.response?.data?.message || "Failed to apply leave");
        }
    };

    const handleSubmitRegulize = async (payload: {
        date: string;
        type: string;
        time: string;
        reason: string;
    }) => {
        setMessage(null);

        try {
            setLoadingRegulize(true);
            const token = Cookies.get("access");

            console.log(payload)

            const res = await axios.post(
                `${apiUrl}/api/attendance-correction/request/`,
                payload,
                { headers: { Authorization: token ? `Bearer ${token}` : "" } }
            );

            setMessageRegulize({ type: "success", text: res.data.message });



            setTimeout(() => setOpenRegulize(false), 1200);
        } catch (err: any) {
            setMessageRegulize({
                type: "error",
                text: err?.response?.data?.message || "Submission failed",
            });
        } finally {
            setLoadingRegulize(false);
        }
    };


    const { toast } = useToast();

    // --- Geolocation logic (same behavior as your first file) ---
    const fetchGeolocation = useCallback(() => {
        if (!("geolocation" in navigator)) {
            setLocationError("Geolocation is not supported by your browser.");
            return;
        }

        setIsProcessing(true);
        setLocationError(null);

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
                setMessage("Location successfully updated. Ready to punch.");
                setIsProcessing(false);
            },
            (error) => {
                let errorMessage = "Geolocation failed: ";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += "User denied the request for Geolocation. Please allow location access.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        errorMessage += "The request to get user location timed out.";
                        break;
                    default:
                        errorMessage += "An unknown error occurred.";
                        break;
                }
                setLocationError(errorMessage);
                setIsProcessing(false);
            },
            options
        );
    }, []);

    // --- Fetch today's attendance from backend ---
    const fetchTodayAttendance = useCallback(async () => {
        const todayStr = format(new Date(), "yyyy-MM-dd");
        try {
            setIsProcessing(true);
            setMessage(null);

            const token = Cookies.get("access");
            const response = await axios.get<PunchResponse>(`${apiUrl}/today/`, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                },
            });

            const data = response.data;
            console.log("today Data: ", data)
            if (data.status === "success" && data.data) {
                setAttendanceStatus(data.data);
                setAttendanceData((prev) => ({ ...prev, [todayStr]: data.data }));

                // Set punch time display & initial elapsed seconds when punched in
                if (data.data.punch_in_time && !data.data.punch_out_time) {
                    const punchIn = new Date(data.data.punch_in_time).getTime();
                    const now = Date.now();
                    const elapsed = Math.max(0, Math.floor((now - punchIn) / 1000));
                    setInitialElapsedSeconds(elapsed);
                    setPunchTime(new Date(data.data.punch_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }));
                    console.log("FetchToday Api Punch In", "Raw:", data.data.punch_in_time, "&", "Processed:", punchTime)
                } else if (data.data.punch_out_time) {
                    setPunchTime(new Date(data.data.punch_out_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }));
                    console.log("FetchToday Api Punch Out", "Raw:", data.data.punch_out_time, "&", "Processed:", punchTime)
                    setInitialElapsedSeconds(0);
                } else {
                    setPunchTime("");
                    setInitialElapsedSeconds(0);
                }
            } else {
                setAttendanceStatus(null);
                setPunchTime("");
                setInitialElapsedSeconds(0);
            }
        } catch (err) {
            const axiosErr = err as AxiosError<PunchResponse>;
            const errMsg = axiosErr.response?.data?.message ?? axiosErr.message;
            setMessage(`Error fetching today's attendance: ${errMsg}`);
            console.error("fetchTodayAttendance error:", axiosErr.response?.data ?? axiosErr.message);
        } finally {
            setIsProcessing(false);
        }
    }, []);

    // fetch week data from TotalHoursView

    const fetchWeeklyAttendance = useCallback(
        async (start: Date, end: Date) => {
            try {
                const token = Cookies.get("access");

                const response = await axios.get(
                    `${apiUrl}/total-hours/`,
                    {
                        headers: {
                            Authorization: token ? `Bearer ${token}` : "",
                        },
                        params: {
                            start_date: format(start, "yyyy-MM-dd"),
                            end_date: format(end, "yyyy-MM-dd"),
                        },
                    }
                );

                if (response.data.status === "success") {
                    setWeeklyAttendance(response.data.data);
                    console.log("Weekly Attendance Data:", response.data.data);
                }

                const total = sumWorkingTime(response.data.data);
                setTotalWeeklyHours(total);
            } catch (err) {
                console.error("Failed to fetch weekly attendance", err);
            }
        },
        []
    );

    // --- Punch API calls (in/out) ---
    const handlePunch = async (type: "in" | "out") => {
        if (!location || !user) {
            setMessage("Please wait for location and user data to load.");
            return;
        }

        const endpoint = type === "in" ? `${apiUrl}/punch-in/` : `${apiUrl}/punch-out/`;
        setIsProcessing(true);
        setMessage(null);

        try {
            const accessToken = Cookies.get("access");

            const response = await axios.post<PunchResponse>(
                endpoint,
                {
                    latitude: location.lat,
                    longitude: location.lon,
                },
                {
                    headers: {
                        Authorization: accessToken ? `Bearer ${accessToken}` : "",
                    },
                }
            );

            const data = response.data;
            if (data.status === "success") {
                setMessage(data.message);
                // update attendance state from returned data if provided
                if (data.data) {
                    setAttendanceStatus(data.data);
                    const dateStr = format(new Date(), "yyyy-MM-dd");
                    setAttendanceData((prev) => ({ ...prev, [dateStr]: data.data }));

                    // update punchTime / timer basis
                    if (type === "in" && data.data.punch_in_time) {
                        const pIn = new Date(data.data.punch_in_time).getTime();
                        const elapsed = Math.max(0, Math.floor((Date.now() - pIn) / 1000));
                        setInitialElapsedSeconds(elapsed);
                        setPunchTime(new Date(data.data.punch_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }));
                        console.log("handlePunch Api Punch In", "Raw:", data.data.punch_in_time, "&", "Processed:", punchTime)
                    } else if (type === "out" && data.data.punch_out_time) {
                        setInitialElapsedSeconds(0);
                        setPunchTime(new Date(data.data.punch_out_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }));
                        console.log("handlePunch Api Punch Out", "Raw:", data.data.punch_out_time, "&", "Processed:", punchTime)
                    }
                } else {
                    // fallback: refresh today's attendance
                    await fetchTodayAttendance();
                }
            } else {
                setMessage(`Punch failed: ${data.message}`);
            }
        } catch (error) {
            const axiosError = error as AxiosError<PunchResponse>;
            const errorDetail = axiosError.response?.data?.message ?? axiosError.message;
            setMessage(`Error: ${errorDetail}`);
            console.error(`${type} API call failed:`, axiosError.response?.data || axiosError.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // wrapper used by PunchCard and header buttons
    const handleCheckIn = (notes?: string) => {
        handlePunch("in");
        toast({
            title: "Checked In",
            description: `You checked in at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        });
    };

    const handleCheckOut = () => {
        handlePunch("out");
        toast({
            title: "Checked Out",
            description: `You checked out at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        });
    };

    // --- Simple week/navigation stubs to keep UI (these are lightweight because we removed useAttendance) ---
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
        const now = new Date();
        // start of week (Sunday)
        const s = new Date(now);
        s.setDate(now.getDate() - now.getDay());
        s.setHours(0, 0, 0, 0);
        return s;
    });

    const navigateWeek = (direction: "prev" | "next") => {
        const newStart = new Date(currentWeekStart);
        newStart.setDate(currentWeekStart.getDate() + (direction === "next" ? 7 : -7));
        setCurrentWeekStart(newStart);
    };

    const goToToday = () => {
        const now = new Date();
        const s = new Date(now);
        s.setDate(now.getDate() - now.getDay());
        s.setHours(0, 0, 0, 0);
        setCurrentWeekStart(s);
    };

    const weekDates = (() => {
        const arr: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(currentWeekStart);
            d.setDate(currentWeekStart.getDate() + i);
            arr.push(d);
        }
        return arr;
    })();

    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 });

    const weekData = weekDates.map((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const apiEntry = weeklyAttendance.find(d => d.date === dateStr);
        const status: DayStatus = isToday(date)
            ? "today"
            : isFuture(date)
                ? "future"
                : isWeekend(date)
                    ? "weekend"
                    : apiEntry?.punch_in_time
                        ? "present"
                        : "absent";

        return {
            day: isToday(date) ? "Today" : format(date, "EEE"),
            date: date.getDate(),
            checkInTime: apiEntry?.punch_in_time || undefined,
            checkOutTime: apiEntry?.punch_out_time || undefined,
            lateBy: undefined,
            earlyBy: undefined,
            hoursWorked: apiEntry?.working_time ?? "0:00",
            status,
            isToday: isToday(date),
            isFuture: isFuture(date),
        };
    });

    // Derived flags
    const isCheckedIn = Boolean(attendanceStatus?.punch_in_time && !attendanceStatus?.punch_out_time);
    const isPunchedInUI = isCheckedIn; // rename to match earlier UI

    // Punch action used by PunchCard
    const handlePunchAction = async () => {
        const currentTime = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
        setPunchTime(currentTime);
        console.log("CurrentTIme Component", currentTime)
        if (isCheckedIn) {
            // --- USER IS TRYING TO CLOCK OUT ---
            try {
                const token = Cookies.get("access");
                const res = await axios.get(
                    `${apiUrl}/total-working-time/`,
                    {
                        headers: { Authorization: token ? `Bearer ${token}` : "" }
                    }
                );

                setWorkingHours(res.data.total_working_time);
                setShowClockOutModal(true); // 🌟 Show popup
            } catch (err) {
                console.error("Error fetching working time:", err);
                toast({
                    title: "Error",
                    description: "Unable to fetch today's working hours.",
                    variant: "destructive"
                });
            }
        } else {
            handleCheckIn();
        }
    };

    const confirmClockOut = () => {
        setShowClockOutModal(false);
        handleCheckOut(); // ⬅️ calls your actual punch out API
    };

    const cancelClockOut = () => {
        setShowClockOutModal(false);
    };

    // Redirect if not logged in
    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
            return;
        }
        if (user) {
            fetchGeolocation();
            fetchTodayAttendance();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, loading, router]);

    // set initial elapsed seconds when attendanceStatus changes
    useEffect(() => {
        if (attendanceStatus?.punch_in_time && !attendanceStatus?.punch_out_time) {
            const punchInTime = new Date(attendanceStatus.punch_in_time).getTime();
            const elapsed = Math.max(0, Math.floor((Date.now() - punchInTime) / 1000));
            setInitialElapsedSeconds(elapsed);
        } else {
            setInitialElapsedSeconds(0);
        }
    }, [attendanceStatus]);

    useEffect(() => {
        const end = endOfWeek(currentWeekStart, { weekStartsOn: 0 });
        fetchWeeklyAttendance(currentWeekStart, end);
    }, [currentWeekStart, fetchWeeklyAttendance]);

    // UI rendering
    if (loading || !user) {
        return <div className="p-8 text-center">Loading authentication...</div>;
    }

    const timeLabels = ["09:30AM", "10AM", "11AM", "12PM", "01PM", "02PM", "03PM", "04PM", "05PM", "06PM", "07PM"];

    const renderContent = () => {
        switch (activeTab) {
            case "Attendance":
                return (
                    <>
                        <ConfirmClockOutModal
                            isOpen={showClockOutModal}
                            workingHours={workingHours}
                            onConfirm={confirmClockOut}
                            onCancel={cancelClockOut}
                        />

                        <div className="text-lg w-full p-4">
                            {/* MAIN CONTENT WRAPPER: Column on mobile, Row on Large Screens */}
                            <div className="flex flex-col-reverse lg:flex-row gap-4 pt-8 lg:pt-0">

                                {/* --- LEFT SIDE: TIMESHEET --- */}
                                <div className="w-full lg:w-[80%] min-h-screen space-y-6 pt-4 lg:pt-0">
                                    {/* <BigCalendar /> */}
                                    <TimesheetHeader
                                        weekStart={currentWeekStart}
                                        weekEnd={weekEnd}
                                        onNavigate={navigateWeek}
                                        onToday={goToToday}
                                        shiftStart={SHIFT_CONFIG.startTime}
                                        shiftEnd={SHIFT_CONFIG.endTime}
                                    />
                                    <div className="bg-card rounded-lg border border-border shadow-sm p-4 lg:p-6 pt-2">
                                        <div className="space-y-4 lg:space-y-2">
                                            {weekData.map((entry, index) => (
                                                <TimeEntryRow key={index} {...{
                                                    ...entry, checkInTime: entry.checkInTime ?? undefined,
                                                    checkOutTime: entry.checkOutTime ?? undefined,
                                                }} />
                                            ))}
                                        </div>

                                        <div className="w-full bg-white p-4 text-sm flex justify-between">
                                            <p>
                                                Weekly Working Time: 47:30
                                            </p>

                                            <p>
                                                Your Weekly Working Time: {totalWeeklyHours}
                                            </p>
                                        </div>

                                        {/* Timeline Labels: Hidden on mobile (too crowded), visible on Desktop */}
                                        <div className="mt-8 relative hidden lg:block">
                                            <div className="flex justify-between text-sm text-muted-foreground px-[120px]">
                                                {timeLabels.map((time) => (
                                                    <span key={time}>{time}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* --- RIGHT SIDE: PUNCH & LOCATION --- */}
                                <div className="w-full lg:w-[20%] mt-6 lg:mt-12 relative space-y-4">
                                    <PunchCard
                                        isPunchedIn={isPunchedInUI}
                                        handlePunchAction={handlePunchAction}
                                        punchTime={punchTime}
                                        elapsedSeconds={initialElapsedSeconds}
                                        profileName={user?.name ?? user?.email ?? "Employee"}
                                        imgurl={user?.picture}
                                    />

                                    {/* Location display & refresh */}
                                    <div className={`p-4 rounded-md ${locationError ? "bg-red-100 text-red-700" : "bg-green-50 text-green-700"} mb-4`}>
                                        <h3 className="font-semibold">Current Location Status:</h3>
                                        {isProcessing && location === null ? (
                                            <p>Fetching location...</p>
                                        ) : locationError ? (
                                            <p>{locationError}</p>
                                        ) : (
                                            <p>Lat: {location?.lat?.toFixed(6)}, Lon: {location?.lon?.toFixed(6)}</p>
                                        )}

                                        <div className="mt-3">
                                            <button
                                                onClick={fetchGeolocation}
                                                disabled={isProcessing}
                                                className="w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition duration-200"
                                            >
                                                {isProcessing ? "Updating..." : "Refresh Location"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Message */}
                                    {message && (
                                        <div className={`p-4 rounded-md ${message.startsWith("Error") || message.includes("failed") ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}>
                                            {message}
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-4 justify-between h-[32%]">
                                        <div className="space-y-2">
                                            {/* Regularize Attendance */}
                                            <button
                                                onClick={() => setOpenRegulize(true)}
                                                className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-blue-600 text-white font-semibold text-xs uppercase tracking-widest py-3.5 px-4 rounded-2xl shadow-lg shadow-blue-500/10 transition-all duration-300 active:scale-[0.98]"
                                            >
                                                <ClockArrowUp className="w-4 h-4" />
                                                Regularize Attendance
                                            </button>

                                            {openRegulize && (
                                                <AttendanceRegularizationPopup
                                                    onClose={() => setOpenRegulize(false)}
                                                    onSubmit={handleSubmitRegulize}
                                                    loading={loadingRegulize}
                                                    message={messageRegulize}
                                                />
                                            )}

                                            {/* Apply For Leave */}
                                            <button
                                                onClick={() => setOpenApplyLeaves(true)}
                                                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs uppercase tracking-widest py-3.5 px-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all duration-300 active:scale-[0.98]"
                                            >
                                                <CalendarPlus className="w-4 h-4" />
                                                Apply For Leave
                                            </button>

                                            {/* MODAL OVERLAY */}
                                            {openApplyLeaves && (
                                                <ApplyLeaveModal
                                                    onClose={() => setOpenApplyLeaves(false)}
                                                    onSubmit={applyLeave}
                                                />
                                            )}

                                            {/* Apply For WFH */}
                                            <button
                                                onClick={() => setOpenApplyWfh(true)}
                                                className="flex items-center justify-center gap-2 w-full bg-white border-2 border-slate-200 hover:border-blue-600 text-slate-700 hover:text-blue-600 font-semibold text-xs uppercase tracking-widest py-3.5 px-4 rounded-2xl transition-all duration-300 active:scale-[0.98]"
                                            >
                                                <Home className="w-4 h-4" />
                                                Apply For WFH
                                            </button>

                                            {/* MODAL OVERLAY */}
                                            {openApplyWfh && (
                                                <ApplyWFHModal
                                                    onClose={() => setOpenApplyWfh(false)}
                                                    onSubmit={applyWFH}
                                                />
                                            )}

                                        </div>

                                        <button
                                            onClick={logout}
                                            className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-100 hover:border-red-600 font-semibold text-xs uppercase tracking-widest rounded-2xl transition-all duration-300 active:scale-[0.98]"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout System
                                        </button>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )

            case "Leaves & WFH":
                return (
                    <>
                        {/* Leaves Component */}
                        <div className="p-6 space-y-8 bg-slate-50/30">

                            {/* HEADER SECTION */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">

                                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                                        My Leaves
                                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                    </h1>
                                    <p className="text-sm text-slate-500 font-medium">
                                        Manage your time off, track balances, and view request status.
                                    </p>
                                </div>

                                <button
                                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    onClick={() => setOpenApplyLeaves(true)}
                                >
                                    <Plus className="w-5 h-5" />
                                    Apply Leave
                                </button>
                            </div>

                            {/* METRICS SECTION */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                    <CalendarDays className="w-3.5 h-3.5" />
                                    Leave Entitlement Overview
                                </div>
                                <EmployeeLeaveSummaryCard
                                    loading={loadingLeaves}
                                    summary={summaryLeaves}
                                />
                            </div>

                            {/* HISTORY SECTION */}
                            <div className="space-y-4">
                                <EmployeeLeaveHistoryTable
                                    loading={loadingLeaves}
                                    requests={requestsLeaves}
                                />
                            </div>

                            {/* MODAL OVERLAY */}
                            {openApplyLeaves && (
                                <ApplyLeaveModal
                                    onClose={() => setOpenApplyLeaves(false)}
                                    onSubmit={applyLeave}
                                />
                            )}

                        </div>

                        {/* WFH Component */}
                        <div className="p-6 space-y-8 bg-slate-50/30">

                            {/* HEADER SECTION */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                                        WFH Requests
                                        <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                                    </h1>
                                    <p className="text-sm text-slate-500 font-medium">
                                        Submit and track your work-from-home applications and history.
                                    </p>
                                </div>

                                <button
                                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    onClick={() => setOpenApplyWfh(true)}
                                >
                                    <Plus className="w-5 h-5" />
                                    Apply WFH
                                </button>
                            </div>

                            {/* DATA TABLE SECTION */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                    <Laptop className="w-3.5 h-3.5" />
                                    Recent Requests & Status
                                </div>

                                {/* Assumes EmployeeWFHHistoryTable follows the same professional style we built for leaves */}
                                <EmployeeWFHHistoryTable
                                    loading={loading}
                                    requests={requestsWfh}
                                />
                            </div>

                            {/* MODAL OVERLAY */}
                            {openApplyWfh && (
                                <ApplyWFHModal
                                    onClose={() => setOpenApplyWfh(false)}
                                    onSubmit={applyWFH}
                                />
                            )}

                        </div>

                        <button
                            onClick={logout}
                            className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-100 hover:border-red-600 font-semibold text-xs uppercase tracking-widest rounded-2xl transition-all duration-300 active:scale-[0.98]"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout System
                        </button>
                    </>
                )

            default:
                return <></>;
        }
    }

    return (
        <div className="w-full bg-sky-50 p-4 relative">
            <div className="text-lg">
                <div className="flex space-x-8 text-xs font-bold border-b border-gray-300 mb-12">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`p-2 ${activeTab === tab
                                ? "border-b-2 border-blue-600"
                                : "text-gray-500"
                                }`}
                        >
                            {tab.toUpperCase()}
                        </button>
                    ))}
                </div>

                {renderContent()}
            </div>
        </div>
    );

};

export default EmployeeAttendancePage;













// <ConfirmClockOutModal
//                 isOpen={showClockOutModal}
//                 workingHours={workingHours}
//                 onConfirm={confirmClockOut}
//                 onCancel={cancelClockOut}
//             />

//             <div className="text-lg w-full bg-cyan-50 p-4">
//                 {/* MAIN CONTENT WRAPPER: Column on mobile, Row on Large Screens */}
//                 <div className="flex flex-col-reverse lg:flex-row gap-4 pt-8 lg:pt-0">

//                     {/* --- LEFT SIDE: TIMESHEET --- */}
//                     <div className="w-full lg:w-[80%] min-h-screen space-y-6 pt-4 lg:pt-12">
//                         {/* <BigCalendar /> */}
//                         <TimesheetHeader
//                             weekStart={currentWeekStart}
//                             weekEnd={weekEnd}
//                             onNavigate={navigateWeek}
//                             onToday={goToToday}
//                             shiftStart={SHIFT_CONFIG.startTime}
//                             shiftEnd={SHIFT_CONFIG.endTime}
//                         />
//                         <div className="bg-card rounded-lg border border-border shadow-sm p-4 lg:p-6 pt-2">
//                             <div className="space-y-4 lg:space-y-2">
//                                 {weekData.map((entry, index) => (
//                                     <TimeEntryRow key={index} {...{
//                                         ...entry, checkInTime: entry.checkInTime ?? undefined,
//                                         checkOutTime: entry.checkOutTime ?? undefined,
//                                     }} />
//                                 ))}
//                             </div>

//                             <div className="w-full bg-white p-4 text-sm flex justify-between">
//                                 <p>
//                                     Weekly Working Time: 47:30
//                                 </p>

//                                 <p>
//                                     Your Weekly Working Time: {totalWeeklyHours}
//                                 </p>
//                             </div>

//                             {/* Timeline Labels: Hidden on mobile (too crowded), visible on Desktop */}
//                             <div className="mt-8 relative hidden lg:block">
//                                 <div className="flex justify-between text-sm text-muted-foreground px-[120px]">
//                                     {timeLabels.map((time) => (
//                                         <span key={time}>{time}</span>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>


//                         {/* Leaves Component */}

//                         {/* Leaves Component */}
//                         <div className="p-6 space-y-8 bg-slate-50/30 min-h-screen">

//                             {/* HEADER SECTION */}
//                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                                 <div>
//                                     {/* Breadcrumb Style Label */}
//                                     <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">
//                                         <LayoutDashboard className="w-3 h-3" />
//                                         <span>Employee Portal</span>
//                                         <span className="text-slate-300">/</span>
//                                         <span className="text-slate-500">Attendance</span>
//                                     </div>

//                                     <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
//                                         My Leaves
//                                         <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
//                                     </h1>
//                                     <p className="text-sm text-slate-500 font-medium">
//                                         Manage your time off, track balances, and view request status.
//                                     </p>
//                                 </div>

//                                 <button
//                                     className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
//                                     onClick={() => setOpenApplyLeaves(true)}
//                                 >
//                                     <Plus className="w-5 h-5" />
//                                     Apply Leave
//                                 </button>
//                             </div>

//                             {/* METRICS SECTION */}
//                             <div className="space-y-3">
//                                 <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
//                                     <CalendarDays className="w-3.5 h-3.5" />
//                                     Leave Entitlement Overview
//                                 </div>
//                                 <EmployeeLeaveSummaryCard
//                                     loading={loadingLeaves}
//                                     summary={summaryLeaves}
//                                 />
//                             </div>

//                             {/* HISTORY SECTION */}
//                             <div className="space-y-4">
//                                 <EmployeeLeaveHistoryTable
//                                     loading={loadingLeaves}
//                                     requests={requestsLeaves}
//                                 />
//                             </div>

//                             {/* MODAL OVERLAY */}
//                             {openApplyLeaves && (
//                                 <ApplyLeaveModal
//                                     onClose={() => setOpenApplyLeaves(false)}
//                                     onSubmit={applyLeave}
//                                 />
//                             )}

//                         </div>

//                         {/* WFH Component */}
//                         <div className="p-6 space-y-8 bg-slate-50/30 min-h-screen">

//                             {/* HEADER SECTION */}
//                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                                 <div>
//                                     {/* Breadcrumb Style Label */}
//                                     <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">
//                                         <Home className="w-3 h-3" />
//                                         <span>Employee Portal</span>
//                                         <span className="text-slate-300">/</span>
//                                         <span className="text-slate-500">Remote Work</span>
//                                     </div>

//                                     <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
//                                         WFH Requests
//                                         <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
//                                     </h1>
//                                     <p className="text-sm text-slate-500 font-medium">
//                                         Submit and track your work-from-home applications and history.
//                                     </p>
//                                 </div>

//                                 <button
//                                     className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
//                                     onClick={() => setOpenApplyWfh(true)}
//                                 >
//                                     <Plus className="w-5 h-5" />
//                                     Apply WFH
//                                 </button>
//                             </div>

//                             {/* DATA TABLE SECTION */}
//                             <div className="space-y-4">
//                                 <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
//                                     <Laptop className="w-3.5 h-3.5" />
//                                     Recent Requests & Status
//                                 </div>

//                                 {/* Assumes EmployeeWFHHistoryTable follows the same professional style we built for leaves */}
//                                 <EmployeeWFHHistoryTable
//                                     loading={loading}
//                                     requests={requestsWfh}
//                                 />
//                             </div>

//                             {/* MODAL OVERLAY */}
//                             {openApplyWfh && (
//                                 <ApplyWFHModal
//                                     onClose={() => setOpenApplyWfh(false)}
//                                     onSubmit={applyWFH}
//                                 />
//                             )}

//                         </div>
//                     </div>

//                     {/* --- RIGHT SIDE: PUNCH & LOCATION --- */}
//                     <div className="w-full lg:w-[20%] mt-6 lg:mt-12 relative space-y-4">
//                         <PunchCard
//                             isPunchedIn={isPunchedInUI}
//                             handlePunchAction={handlePunchAction}
//                             punchTime={punchTime}
//                             elapsedSeconds={initialElapsedSeconds}
//                             profileName={user?.name ?? user?.email ?? "Employee"}
//                             imgurl={user?.picture}
//                         />

//                         {/* Location display & refresh */}
//                         <div className={`p-4 rounded-md ${locationError ? "bg-red-100 text-red-700" : "bg-green-50 text-green-700"} mb-4`}>
//                             <h3 className="font-semibold">Current Location Status:</h3>
//                             {isProcessing && location === null ? (
//                                 <p>Fetching location...</p>
//                             ) : locationError ? (
//                                 <p>{locationError}</p>
//                             ) : (
//                                 <p>Lat: {location?.lat?.toFixed(6)}, Lon: {location?.lon?.toFixed(6)}</p>
//                             )}

//                             <div className="mt-3">
//                                 <button
//                                     onClick={fetchGeolocation}
//                                     disabled={isProcessing}
//                                     className="w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition duration-200"
//                                 >
//                                     {isProcessing ? "Updating..." : "Refresh Location"}
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Message */}
//                         {message && (
//                             <div className={`p-4 rounded-md ${message.startsWith("Error") || message.includes("failed") ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}>
//                                 {message}
//                             </div>
//                         )}

//                         <Button onClick={() => setOpenRegulize(true)} className="bg-blue-600 w-full text-white px-4 py-2 rounded">
//                             Regulize Attendance
//                         </Button>

//                         {openRegulize && (
//                             <AttendanceRegularizationPopup
//                                 onClose={() => setOpenRegulize(false)}
//                                 onSubmit={handleSubmitRegulize}
//                                 loading={loadingRegulize}
//                                 message={messageRegulize}
//                             />
//                         )}

//                         <Button onClick={() => setOpenApplyLeaves(true)} className="bg-blue-600 w-full text-white px-4 py-2 rounded">
//                             Apply For Leave
//                         </Button>

//                         <Button onClick={() => setOpenApplyWfh(true)} className="bg-blue-600 w-full text-white px-4 py-2 rounded">
//                             Apply For Work From Home
//                         </Button>
//                     </div>
//                 </div>
//             </div>