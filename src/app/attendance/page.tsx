"use client";
import Image from "next/image";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { format, isToday, isFuture, isWeekend, endOfWeek } from "date-fns";
import { formatHoursWorked, formatMinutesToHHMM } from "@/utils/timeUtils";

import { useToast } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { TimeEntryRow } from "@/components/attendance/TimeEntryRow";
import { TimesheetHeader } from "@/components/attendance/TimeSheetHeader";
import { ShiftConfig } from "@/lib/types";

export const SHIFT_CONFIG: ShiftConfig = {
    startTime: "09:30",
    endTime: "19:00",
};


type DayStatus = "weekend" | "absent" | "present" | "today" | "future";

const apiUrl = "https://buzzhire.trueledgrr.com/"

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

const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
        .map((v) => (v < 10 ? "0" + v : v))
        .join(" : ");
};

const formattedTime = (isoString: any) => {
    if (!isoString) return undefined;

    return new Date(isoString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC"   // <-- Keeps the exact time sent from backend
    });
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

const EmployeeAttendancePage = () => {
    // Auth + router
    const { user, loading, logout } = useAuth();
    const router = useRouter();

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
            if (data.status === "success" && data.data) {
                setAttendanceStatus(data.data);
                setAttendanceData((prev) => ({ ...prev, [todayStr]: data.data }));

                // Set punch time display & initial elapsed seconds when punched in
                if (data.data.punch_in_time && !data.data.punch_out_time) {
                    const punchIn = new Date(data.data.punch_in_time).getTime();
                    const now = Date.now();
                    const elapsed = Math.max(0, Math.floor((now - punchIn) / 1000));
                    setInitialElapsedSeconds(elapsed);
                    setPunchTime(new Date(data.data.punch_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC" }));
                } else if (data.data.punch_out_time) {
                    setPunchTime(new Date(data.data.punch_out_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC" }));
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
                        setPunchTime(new Date(data.data.punch_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC" }));
                    } else if (type === "out" && data.data.punch_out_time) {
                        setInitialElapsedSeconds(0);
                        setPunchTime(new Date(data.data.punch_out_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC" }));
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

    // Helpers (minimal replacements for original utilities used in UI)
    const calculateHoursWorked = (dateStr: string) => {
        const entry = attendanceData[dateStr];

        if (entry?.punch_in_time && entry?.punch_out_time) {
            const inT = Date.parse(entry.punch_in_time);
            const outT = Date.parse(entry.punch_out_time);

            const diffMs = outT - inT;
            const hours = diffMs / (1000 * 60 * 60); // convert ms → hours

            return Math.max(0, hours);
        }

        return 0;
    };

    const calculateLateness = (dateStr: string) => {
        return 0;
    };
    const calculateEarlyLeave = (dateStr: string) => {
        return 0;
    };

    const getDayStatus = (date: Date): DayStatus => {
        if (isToday(date)) return "today";
        if (isFuture(date)) return "future";
        if (isWeekend(date)) return "weekend";

        const dateStr = format(date, "yyyy-MM-dd");
        const entry = attendanceData[dateStr];
        if (!entry?.punch_in_time) return "absent";
        return "present";
    };

    const weekData = weekDates.map((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const entry = attendanceData[dateStr];
        const status = getDayStatus(date);
        const hoursWorked = calculateHoursWorked(dateStr);
        const lateness = calculateLateness(dateStr);
        const earlyLeave = calculateEarlyLeave(dateStr);

        return {
            day: isToday(date) ? "Today" : format(date, "EEE"),
            date: date.getDate(),
            checkInTime: formattedTime(entry?.punch_in_time),
            checkOutTime: formattedTime(entry?.punch_out_time),
            lateBy: lateness > 0 ? formatMinutesToHHMM(lateness) : undefined,
            earlyBy: earlyLeave > 0 ? formatMinutesToHHMM(earlyLeave) : undefined,
            hoursWorked: formatHoursWorked(hoursWorked),
            status,
            isToday: isToday(date),
            isFuture: isFuture(date),
        };
    });

    // Derived flags
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const isCheckedIn = Boolean(attendanceStatus?.punch_in_time && !attendanceStatus?.punch_out_time);
    const isPunchedInUI = isCheckedIn; // rename to match earlier UI

    // Punch action used by PunchCard
    const handlePunchAction = () => {
        const currentTime = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        setPunchTime(currentTime);
        if (isCheckedIn) {
            handleCheckOut();
        } else {
            handleCheckIn();
        }
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

    // UI rendering
    if (loading || !user) {
        return <div className="p-8 text-center">Loading authentication...</div>;
    }

    const timeLabels = ["09:30AM", "10AM", "11AM", "12PM", "01PM", "02PM", "03PM", "04PM", "05PM", "06PM", "07PM"];

    return (
        <div className="w-full p-4">
            <header className="flex justify-end items-center pb-6 border-b border-gray-300">
                <button
                    onClick={logout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-150"
                >
                    Logout
                </button>
            </header>
            <div className="text-lg w-full bg-cyan-50 p-4">
                {/* MAIN CONTENT WRAPPER: Column on mobile, Row on Large Screens */}
                <div className="flex flex-col-reverse lg:flex-row gap-4 pt-8 lg:pt-0">

                    {/* --- LEFT SIDE: TIMESHEET --- */}
                    <div className="w-full lg:w-[80%] min-h-screen space-y-6 pt-4 lg:pt-12">
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
                    </div>
                </div>
            </div>
        </div>
    );

    // return (
    //     <div className="w-full p-4">
    //         <header className="flex justify-end items-center pb-6 border-b border-gray-300">
    //             <button
    //                 onClick={logout}
    //                 className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-150"
    //             >
    //                 Logout
    //             </button>
    //         </header>
    //         <div className="text-lg w-full bg-cyan-50 p-4">
    //             {/* MAIN CONTENT */}
    //             <div className="flex gap-4">
    //                 <div className="w-[80%] min-h-screen space-y-6 pt-12">
    //                     {/* <BigCalendar /> */}
    //                     <TimesheetHeader
    //                         weekStart={currentWeekStart}
    //                         weekEnd={weekEnd}
    //                         onNavigate={navigateWeek}
    //                         onToday={goToToday}
    //                         shiftStart={SHIFT_CONFIG.startTime}
    //                         shiftEnd={SHIFT_CONFIG.endTime}
    //                     />
    //                     <div className="bg-card rounded-lg border border-border shadow-sm p-6 pt-2">
    //                         <div className="space-y-2">
    //                             {weekData.map((entry, index) => (
    //                                 <TimeEntryRow key={index} {...{
    //                                     ...entry, checkInTime: entry.checkInTime ?? undefined,
    //                                     checkOutTime: entry.checkOutTime ?? undefined,
    //                                 }} />
    //                             ))}
    //                         </div>

    //                         <div className="mt-8 relative">
    //                             <div className="flex justify-between text-sm text-muted-foreground px-[120px]">
    //                                 {timeLabels.map((time) => (
    //                                     <span key={time}>{time}</span>
    //                                 ))}
    //                             </div>
    //                         </div>
    //                     </div>
    //                 </div>
    //                 <div className="w-[20%] mt-12 relative space-y-4">
    //                     <PunchCard
    //                         isPunchedIn={isPunchedInUI}
    //                         handlePunchAction={handlePunchAction}
    //                         punchTime={punchTime}
    //                         elapsedSeconds={initialElapsedSeconds}
    //                         profileName={user?.name ?? user?.email ?? "Employee"}
    //                         imgurl={user?.picture}
    //                     />

    //                     {/* Location display & refresh */}
    //                     <div className={`p-4 rounded-md ${locationError ? "bg-red-100 text-red-700" : "bg-green-50 text-green-700"} mb-4`}>
    //                         <h3 className="font-semibold">Current Location Status:</h3>
    //                         {isProcessing && location === null ? (
    //                             <p>Fetching location...</p>
    //                         ) : locationError ? (
    //                             <p>{locationError}</p>
    //                         ) : (
    //                             <p>Lat: {location?.lat?.toFixed(6)}, Lon: {location?.lon?.toFixed(6)}</p>
    //                         )}

    //                         <div className="mt-3">
    //                             <button
    //                                 onClick={fetchGeolocation}
    //                                 disabled={isProcessing}
    //                                 className="w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition duration-200"
    //                             >
    //                                 {isProcessing ? "Updating..." : "Refresh Location"}
    //                             </button>
    //                         </div>
    //                     </div>

    //                     {/* Message */}
    //                     {message && (
    //                         <div className={`p-4 rounded-md ${message.startsWith("Error") || message.includes("failed") ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}>
    //                             {message}
    //                         </div>
    //                     )}
    //                 </div>
    //             </div>
    //         </div>
    //     </div>
    // );
};

export default EmployeeAttendancePage;
