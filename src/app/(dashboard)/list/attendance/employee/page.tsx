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
import { CalendarDay, ShiftConfig, DayStatus } from "@/lib/types";
import { ConfirmClockOutModal } from "@/components/attendance/confirmClockOut";
import AttendanceRegularizationPopup from "@/components/attendance/attendanceRegulizer";
import { startOfMonth, endOfMonth } from "date-fns";
import EmployeeLeaveSummaryCard from "@/components/attendance/EmployeeLeaveSummaryCard";
import EmployeeLeaveHistoryTable from "@/components/attendance/EmployeeLeaveHistoryTable";
import ApplyLeaveModal from "@/components/attendance/ApplyLeaveModal";
import EmployeeWFHHistoryTable from "@/components/attendance/EmployeeWFHHistoryTable";
import ApplyWFHModal from "@/components/attendance/ApplyWFHModal";
import { CalendarDays, CalendarPlus, ClockArrowUp, Home, Laptop, LayoutDashboard, LogOut, LogIn, Plus, MapPin, MapPinOff } from "lucide-react";
import EmployeeRegulizeRequests from "@/components/attendance/EmployeeRegulizeRequests";
import { toMinutes } from "../admin/page";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";
import EmployeeCalendar from "@/components/attendance/EmployeeCalender";
import EmployeeAttendanceSheet from "@/components/attendance/EmployeeAttendanceSheet";
import { EmployeeHierarchyTab } from "../../employees/page";
import LogoutConfirmModal from "@/components/LogoutConfirmModal";

export const SHIFT_CONFIG: ShiftConfig = {
    startTime: "09:30",
    endTime: "19:00",
};


type WeeklyAttendance = {
    date: string;
    punch_in_time: string | null;
    punch_out_time: string | null;
    working_time: string | null;
    work_status: string | null;
};
type MonthlyAttendance = {
    date: string;
    punch_in_time: string | null;
    punch_out_time: string | null;
    working_time: string | null;
    work_status: string | null;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

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
    hasPunchedOut?: boolean;
    workedSeconds?: number;
    handlePunchAction: () => void;
    punchTime: string;
    elapsedSeconds: number;
    profileName?: string;
    imgurl?: string;
    onRefreshLocation?: () => void;
    isProcessingLocation?: boolean;
}> = ({ isPunchedIn, hasPunchedOut, workedSeconds, handlePunchAction, punchTime, elapsedSeconds, profileName, imgurl, onRefreshLocation, isProcessingLocation }) => {
    const [elapsedTime, setElapsedTime] = useState<number>(elapsedSeconds ?? 0);
    const intervalRef = useRef<number | null>(null);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${h}:${m}:${s}`;
    };

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

    // Progress circle calculations
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const maxTime = 9 * 3600; // 9 hours for a full circle
    const strokeDashoffset = circumference - (Math.min(elapsedTime / maxTime, 1) * circumference);

    return (
        <div className="relative w-full max-w-xs mx-auto bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mt-0 mb-6">
            
            <div className="flex justify-center pt-5 relative z-10">
                <div className="relative">
                    <img
                        src={imgurl || '/avatar.png'}
                        alt={profileName || "employee"}
                        className="rounded-full object-cover border-[5px] border-white shadow-sm w-24 h-24 bg-slate-50"
                        onError={(e) => {
                            e.currentTarget.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(profileName || "Employee") + "&background=0D8ABC&color=fff";
                        }}
                    />
                    <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-white bg-green-500 shadow-sm"></div>
                </div>
            </div>

            <div className="text-center px-4 pb-3 pt-2 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">{profileName ?? "Employee"}</h3>
            </div>

            {/* Bottom Half: Details & Controls */}
            <div className="px-5 pb-5 pt-4">
                {/* Time Elapsed Box */}
                <div className="bg-[#F5F5F0] rounded-2xl p-3 sm:p-3.5 mb-4 border border-[#E8E8E3] relative flex flex-wrap justify-between items-center gap-3 shadow-xs overflow-hidden">
                    <div className="flex-1 min-w-[130px]">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                            {!isPunchedIn && hasPunchedOut ? "Today Work Hour" : "Time Elapsed"}
                        </p>
                        <p className="text-xl xl:text-2xl font-extrabold tracking-wider text-slate-800 font-sans whitespace-nowrap">
                            {!isPunchedIn && hasPunchedOut ? formatTime(workedSeconds ?? 0) : formatTime(elapsedTime)}
                        </p>
                    </div>
                    
                    <div className="text-left bg-white border border-slate-200/70 px-2.5 py-1.5 rounded-xl shadow-sm shrink-0">
                        <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {isPunchedIn ? "Punched In At" : hasPunchedOut ? "Punched Out At" : "Punched At"}
                        </p>
                        <p className="text-xs font-bold text-slate-700 mt-0.5">
                            {punchTime || "--:--"}
                        </p>
                    </div>
                </div>

                {/* Clock Action Button */}
                {!isPunchedIn && hasPunchedOut ? (
                    <button
                        disabled
                        className="w-full py-3.5 rounded-full flex items-center justify-center gap-2 font-bold text-white text-base shadow-lg shadow-sky-200 bg-gradient-to-r from-sky-600 to-blue-600 cursor-not-allowed opacity-90 transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                        Successfully Punched Out
                    </button>
                ) : (
                    <button
                        onClick={handlePunchAction}
                        className={`w-full py-3.5 rounded-full flex items-center justify-center gap-2 font-bold text-white text-base shadow-md transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                ${isPunchedIn ? "bg-[#EF4444] shadow-red-200" : "bg-[#22C55E] shadow-green-200"}`}
                    >
                        {isPunchedIn ? "Clock Out" : "Clock In"}
                    </button>
                )}
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
    const adminUsername = "satyajeet@buzzhire.in"

    const { employee } = useCurrentEmployee();

    const [photoTimestamp, setPhotoTimestamp] = useState(Date.now());

    useEffect(() => {
        if (employee?.profile_photo) {
            setPhotoTimestamp(Date.now());
        }
    }, [employee?.profile_photo]);

    const getProfilePhoto = (profilePhoto?: string) => {
        if (!profilePhoto) return "/avatar.png";
        if (typeof profilePhoto === 'string') {
            if (profilePhoto.startsWith('/api/')) {
                return profilePhoto.includes('?') 
                    ? `${apiUrl}${profilePhoto}` 
                    : `${apiUrl}${profilePhoto}?t=${photoTimestamp}`;
            }
            if (profilePhoto.startsWith("data:")) return profilePhoto;
            return `data:image/jpeg;base64,${profilePhoto}`;
        }
        return `data:image/jpeg;base64,${btoa(String.fromCharCode(...new Uint8Array(profilePhoto)))}`;
    };

    const avatarSrc = getProfilePhoto(employee?.profile_photo);
    // Auth + router
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    const tabs = ["Attendance", "Leaves & WFH", "Employee Hierarchy"];
    const [activeTab, setActiveTab] = useState("Attendance");
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const [calendarMap, setCalendarMap] = useState<Record<string, CalendarDay>>({});

    // Geolocation
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
    const locationRef = useRef<{ lat: number; lon: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [showLocationPopup, setShowLocationPopup] = useState(false);
    const [showOutOfRangePopup, setShowOutOfRangePopup] = useState(false);
    const [outOfRangeMessage, setOutOfRangeMessage] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [showRefreshSuccess, setShowRefreshSuccess] = useState(false);
    const [locationReady, setLocationReady] = useState(false);
    const retryCountRef = useRef(0);

    // Attendance state (backend-driven)
    const [attendanceStatus, setAttendanceStatus] = useState<AttendanceRecord | null>(null);
    const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceRecord | undefined>>({});
    const [message, setMessage] = useState<string | null>(null);

    // Timer / UI state
    const [punchTime, setPunchTime] = useState<string>("");
    const [initialElapsedSeconds, setInitialElapsedSeconds] = useState<number>(0);

    const [showClockOutModal, setShowClockOutModal] = useState(false);
    const [showPunchOutToast, setShowPunchOutToast] = useState(false);

    const workedSecondsToday = React.useMemo(() => {
        if (attendanceStatus?.punch_in_time && attendanceStatus?.punch_out_time) {
            const pIn = new Date(attendanceStatus.punch_in_time).getTime();
            const pOut = new Date(attendanceStatus.punch_out_time).getTime();
            return Math.max(0, Math.floor((pOut - pIn) / 1000));
        }
        return 0;
    }, [attendanceStatus]);
    const [workingHours, setWorkingHours] = useState<string | undefined>(undefined);

    const [weeklyAttendance, setWeeklyAttendance] = useState<WeeklyAttendance[]>([]);
    const [totalWeeklyHours, setTotalWeeklyHours] = useState<string>("0:00");
    const [expectedWeeklyHours, setExpectedWeeklyHours] = useState<string>("0:00");

    const [monthlyAttendance, setMonthlyAttendance] = useState<MonthlyAttendance[]>([]);
    const [totalMonthlyHours, setTotalMonthlyHours] = useState<string>("0:00");
    const [expectedMonthlyHours, setExpectedMonthlyHours] = useState<string>("0:00");

    // Attendance Sheet State
    const [isEmployeeSheetOpen, setIsEmployeeSheetOpen] = useState(false);

    const [employeeSheetData, setEmployeeSheetData] = useState<AttendanceDay[]>([]);
    const [employeeSheetLoading, setEmployeeSheetLoading] = useState(false);
    const [employeeSheetError, setEmployeeSheetError] = useState("");




    const [requestsRegulize, setRequestsRegulize] = useState<any[]>([]);
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



    const applyWFH = async (date: string) => {
        try {
            const token = Cookies.get("access");
            await axios.post(
                `${apiUrl}/wfh/apply/`,
                { date, admin_username: adminUsername },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOpenApplyWfh(false);
            toast({ title: "WFH Request Submitted", description: "Your request has been sent for review." });
            loadWFHRequests();
        } catch (err: any) {
            toast({ title: "WFH Failed", description: err?.response?.data?.message || "Failed to apply WFH", variant: "destructive" });
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



    const applyLeave = async (payload: {
        start_date: string;
        end_date: string;
        reason: string;
    }) => {
        try {
            const token = Cookies.get("access");
            const fianlPayload = {
                ...payload,
                admin_username: adminUsername,
            }
            await axios.post(
                `${apiUrl}/api/employee/leave/apply/`,
                fianlPayload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOpenApplyLeaves(false);
            toast({ title: "Leave Applied Successfully", description: "Your leave request has been submitted." });
            loadSummary();
        } catch (err: any) {
            toast({ title: "Leave Request Failed", description: err?.response?.data?.message || "Failed to apply leave", variant: "destructive" });
        }
    };

    const loadRegulizeRequests = async () => {
        try {
            setLoadingRegulize(true);
            const token = Cookies.get("access");

            const res = await axios.get(
                `${apiUrl}/api/attendance-regularization/my-requests/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setRequestsRegulize(res.data.data || []);
            // console.log("Regulize Data", res.data)
        } catch (err) {
            console.error(err);
            alert("Failed to load regularizer requests");
        } finally {
            setLoadingRegulize(false);
        }
    };

    useEffect(() => {
        if (activeTab === "Leaves & WFH") {
            loadWFHRequests();
            loadSummary();
            loadRegulizeRequests();
        }
    }, [activeTab]);

    const handleSubmitRegulize = async (payload: {
        date: string;
        type: string;
        time: string;
        reason: string;
    }) => {
        setMessage(null);

        try {
            const token = Cookies.get("access");
            const fianlPayload = {
                ...payload,
                admin_username: adminUsername,
            }
            await axios.post(
                `${apiUrl}/api/attendance-correction/request/`,
                fianlPayload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOpenRegulize(false);
            toast({ title: "Regularization Submitted", description: "Your correction request has been sent." });
            loadRegulizeRequests();
        } catch (err: any) {
            toast({ title: "Regularization Failed", description: err?.response?.data?.message || "Submission failed", variant: "destructive" });
        }
    };

    const handleEmployeeSheetSubmit = async (start: string, end: string) => {
        await fetchAttendanceAndCalendar(start, end);
    };
    const handleOpenEmployeeAttendanceSheet = () => {
        setIsEmployeeSheetOpen(true);
    };




    const { toast } = useToast();

    // --- Geolocation logic with smart retry ---
    const fetchGeolocation = useCallback((showPopup = false, retryOnFail = true) => {
        if (!("geolocation" in navigator)) {
            setLocationError("Geolocation is not supported by your browser.");
            if (showPopup) setShowLocationPopup(true);
            return;
        }

        setIsProcessing(true);
        setLocationError(null);
        setShowLocationPopup(false);

        const options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 30000, // Accept cached position up to 30s old
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const loc = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                };
                setLocation(loc);
                locationRef.current = loc;
                setLocationReady(true);
                setLocationError(null);
                retryCountRef.current = 0;
                setIsProcessing(false);
                if (showPopup) {
                    setShowRefreshSuccess(true);
                    setTimeout(() => setShowRefreshSuccess(false), 2000);
                }
            },
            (error) => {
                // If this is a silent fetch (not user-triggered) and we can retry, try again
                if (retryOnFail && !showPopup && retryCountRef.current < 3) {
                    retryCountRef.current += 1;
                    const delay = retryCountRef.current * 2000; // 2s, 4s, 6s
                    setTimeout(() => {
                        fetchGeolocation(false, retryCountRef.current < 3);
                    }, delay);
                    return; // Don't show error yet, still retrying
                }

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
                if (showPopup) setShowLocationPopup(true);
                setIsProcessing(false);
            },
            options
        );
    }, []);

    // --- Fetch today's attendance from backend with retry ---
    const attendanceRetryRef = useRef(0);
    const fetchTodayAttendance = useCallback(async (retryOnError = true) => {
        const todayStr = format(new Date(), "yyyy-MM-dd");
        try {
            setIsProcessing(true);
            setMessage(null);

            const token = Cookies.get("access");
            const response = await axios.get<PunchResponse>(`${apiUrl}/today/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                timeout: 15000,
            });

            const data = response.data;
            attendanceRetryRef.current = 0; // Reset retry count on success

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
                } else if (data.data.punch_out_time) {
                    setPunchTime(new Date(data.data.punch_out_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }));
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
            console.error("fetchTodayAttendance error:", axiosErr.response?.data ?? axiosErr.message);

            // Auto-retry up to 3 times with backoff on network errors
            if (retryOnError && attendanceRetryRef.current < 3) {
                attendanceRetryRef.current += 1;
                const delay = attendanceRetryRef.current * 2000; // 2s, 4s, 6s
                console.log(`Retrying fetchTodayAttendance in ${delay}ms (attempt ${attendanceRetryRef.current})`);
                setTimeout(() => {
                    fetchTodayAttendance(attendanceRetryRef.current < 3);
                }, delay);
                return; // Don't clear processing state yet
            }

            setMessage(`Error fetching today's attendance: ${errMsg}`);
        } finally {
            setIsProcessing(false);
        }
    }, []);

    // fetch week data from TotalHoursView

    const fetchCompanyCalendar = async (start: Date, end: Date) => {
        const token = Cookies.get("access");

        const res = await axios.get(`${apiUrl}/api/company-calendar`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { start_date: format(start, "yyyy-MM-dd"), end_date: format(end, "yyyy-MM-dd") }
        });

        const map: Record<string, CalendarDay> = {};
        res.data.calendar.forEach((d: CalendarDay) => {
            map[d.date] = d;
        });

        setCalendarMap(map);
    };

    type AttendanceDay = {
        date: string;
        punch_in_time: string | null;
        punch_out_time: string | null;
        working_time: string | null;
        work_status: string | null;
    };

    //Employee Attendance Sheet data fetcher (attendance + calendar)
    const fetchAttendanceAndCalendar = async (
        start: string,
        end: string
    ) => {
        try {
            setEmployeeSheetLoading(true);
            setEmployeeSheetError("");

            const token = Cookies.get("access");

            const [attendanceRes, calendarRes] = await Promise.all([
                axios.get(`${apiUrl}/total-hours/`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { start_date: start, end_date: end }
                }),

                axios.get(`${apiUrl}/api/company-calendar`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { start_date: start, end_date: end }
                })
            ]);

            /* ========================
               Attendance
            ======================== */

            if (attendanceRes.data.status === "success") {
                setEmployeeSheetData(attendanceRes.data.data || []);
            } else {
                setEmployeeSheetData([]);
            }

            /* ========================
               Calendar → Map
            ======================== */

            const calendarMap: Record<string, CalendarDay> = {};

            calendarRes.data.calendar.forEach((d: CalendarDay) => {
                calendarMap[d.date.slice(0, 10)] = d;
            });

            setCalendarMap(calendarMap);

        } catch (err) {
            setEmployeeSheetError("Failed to fetch attendance or calendar");
        } finally {
            setEmployeeSheetLoading(false);
        }
    };




    const fetchWeeklyAttendance = useCallback(
        async (start: Date, end: Date) => {
            try {
                const token = Cookies.get("access");

                const response = await axios.get(
                    `${apiUrl}/total-hours/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        params: {
                            start_date: format(start, "yyyy-MM-dd"),
                            end_date: format(end, "yyyy-MM-dd"),
                        },
                    }
                );

                if (response.data.status === "success") {
                    setWeeklyAttendance(response.data.data);
                }
                // console.log("Weekly Attendance Response:", response.data);

                await fetchCompanyCalendar(start, end);

                const total = sumWorkingTime(response.data.data);
                setTotalWeeklyHours(total);
                const expected = (response.data.expected_hours);
                setExpectedWeeklyHours(expected);

            } catch (err) {
                console.error("Failed to fetch weekly attendance", err);
            }
        },
        []
    );

    const fetchMonthlyAttendance = useCallback(
        async (start: Date, end: Date) => {
            try {
                const token = Cookies.get("access");

                const response = await axios.get(
                    `${apiUrl}/total-hours/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        params: {
                            start_date: format(start, "yyyy-MM-dd"),
                            end_date: format(end, "yyyy-MM-dd"),
                        },
                    }
                );

                if (response.data.status === "success") {
                    setMonthlyAttendance(response.data.data);
                }

                await fetchCompanyCalendar(start, end);

                const total = sumWorkingTime(response.data.data);
                setTotalMonthlyHours(total);
                const expected = (response.data.expected_hours);
                setExpectedMonthlyHours(expected);

            } catch (err) {
                console.error("Failed to fetch monthly attendance", err);
            }
        },
        []
    );


    // --- Punch API calls (in/out) ---
    const handlePunch = async (type: "in" | "out") => {
        if (!user) {
            toast({ title: "Error", description: "Please wait for user data to load.", variant: "destructive" });
            return;
        }

        // Smart location check: use ref for latest value, try fetching if missing
        let currentLocation = locationRef.current;
        if (!currentLocation) {
            // Try one quick geolocation fetch before showing popup
            setIsProcessing(true);
            try {
                currentLocation = await new Promise<{ lat: number; lon: number } | null>((resolve) => {
                    if (!("geolocation" in navigator)) {
                        resolve(null);
                        return;
                    }
                    navigator.geolocation.getCurrentPosition(
                        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                        () => resolve(null),
                        { enableHighAccuracy: true, timeout: 3000, maximumAge: 30000 }
                    );
                });
            } catch {
                currentLocation = null;
            }

            if (currentLocation) {
                setLocation(currentLocation);
                locationRef.current = currentLocation;
                setLocationReady(true);
                setLocationError(null);
            } else {
                setIsProcessing(false);
                setLocationError("Location is required to punch in or out. Please turn on GPS and try again.");
                setShowLocationPopup(true);
                return;
            }
        }


        const endpoint = type === "in" ? `${apiUrl}/punch-in/` : `${apiUrl}/punch-out/`;
        setIsProcessing(true);
        setMessage(null);

        try {
            const accessToken = Cookies.get("access");

            const response = await axios.post<PunchResponse>(
                endpoint,
                {
                    latitude: currentLocation.lat,
                    longitude: currentLocation.lon,
                },
                {
                    headers: {
                        Authorization: accessToken ? `Bearer ${accessToken}` : "",
                    },
                }
            );

            const data = response.data;
            if (data.status === "success") {
                // ✅ Show success toast ONLY after API confirms success
                toast({
                    title: type === "in" ? "Checked In" : "Checked Out",
                    description: `You checked ${type === "in" ? "in" : "out"} at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
                });

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
                    } else if (type === "out" && data.data.punch_out_time) {
                        setInitialElapsedSeconds(0);
                        setPunchTime(new Date(data.data.punch_out_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }));
                    }
                } else {
                    // fallback: refresh today's attendance (non-blocking)
                    fetchTodayAttendance();
                }

                // Refresh the timesheet table in background (non-blocking)
                if (viewMode === "weekly") {
                    fetchWeeklyAttendance(currentWeekStart, endOfWeek(currentWeekStart, { weekStartsOn: 0 }));
                } else {
                    fetchMonthlyAttendance(currentMonthStart, endOfMonth(currentMonthStart));
                }
            } else {
                const lowerMsg = data.message?.toLowerCase() || "";
                if (lowerMsg.includes("range") || lowerMsg.includes("distance") || lowerMsg.includes("radius") || lowerMsg.includes("location") || lowerMsg.includes("office")) {
                    // Backend detected mock location → show "Location Not Supported"
                    if (lowerMsg.includes("static") || lowerMsg.includes("mocked") || lowerMsg.includes("mock")) {
                        setOutOfRangeMessage("LOCATION_NOT_SUPPORTED");
                    } else {
                        setOutOfRangeMessage(data.message);
                    }
                    setShowOutOfRangePopup(true);
                } else {
                    toast({ title: "Punch Failed", description: data.message, variant: "destructive" });
                }
            }
        } catch (error) {
            const axiosError = error as AxiosError<PunchResponse>;
            const errorDetail = axiosError.response?.data?.message ?? axiosError.message;
            const lowerError = typeof errorDetail === "string" ? errorDetail.toLowerCase() : "";
            
            if (lowerError.includes("range") || lowerError.includes("distance") || lowerError.includes("radius") || lowerError.includes("location") || lowerError.includes("office")) {
                // Backend detected mock location → show "Location Not Supported"
                if (lowerError.includes("static") || lowerError.includes("mocked") || lowerError.includes("mock")) {
                    setOutOfRangeMessage("LOCATION_NOT_SUPPORTED");
                } else {
                    setOutOfRangeMessage(typeof errorDetail === "string" ? errorDetail : "You are out of range.");
                }
                setShowOutOfRangePopup(true);
            } else {
                toast({ title: "Error", description: typeof errorDetail === "string" ? errorDetail : "An error occurred", variant: "destructive" });
            }
            console.error(`${type} API call failed:`, axiosError.response?.data || axiosError.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // wrapper used by PunchCard and header buttons
    // ✅ Toasts removed — success toast now fires inside handlePunch ONLY after API confirms
    const handleCheckIn = (notes?: string) => {
        handlePunch("in");
    };

    const handleCheckOut = () => {
        handlePunch("out");
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

    const [currentMonthStart, setCurrentMonthStart] = useState<Date>(() => {
        const now = new Date();
        const m = new Date(now);
        m.setDate(1);
        m.setHours(0, 0, 0, 0);
        return m;
    });

    const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());


    const changeViewMode = (mode: "weekly" | "monthly") => {
        setViewMode(mode);
    };


    const handleNavigate = (direction: "prev" | "next") => {
        if (viewMode === "weekly") {
            navigateWeek(direction);
        } else {
            navigateMonth(direction);
        }
    };


    const getNormalizedDate = (d: Date) => {
        const copy = new Date(d);
        copy.setHours(0, 0, 0, 0);
        return copy;
    };

    const joiningDate = employee?.joining_date ? getNormalizedDate(new Date(employee.joining_date as string)) : null;

    const navigateWeek = (direction: "prev" | "next") => {
        const newStart = new Date(currentWeekStart);
        newStart.setDate(currentWeekStart.getDate() + (direction === "next" ? 7 : -7));
        
        if (direction === "prev" && joiningDate) {
            const newEnd = new Date(newStart);
            newEnd.setDate(newStart.getDate() + 6);
            if (getNormalizedDate(newEnd) < joiningDate) {
                return; // Block going before joining week
            }
        }
        setCurrentWeekStart(newStart);
    };

    const navigateMonth = (direction: "prev" | "next") => {
        setCurrentMonthStart(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
            
            if (direction === "prev" && joiningDate) {
                const lastDayOfNewMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);
                if (getNormalizedDate(lastDayOfNewMonth) < joiningDate) {
                    return prev; // Block going before joining month
                }
            }
            return newDate;
        });
    };



    const goToToday = () => {
        const now = new Date();

        if (viewMode === "weekly") {
            const s = new Date(now);
            s.setDate(now.getDate() - now.getDay());
            s.setHours(0, 0, 0, 0);
            setCurrentWeekStart(s);
        } else {
            const m = new Date(now);
            m.setDate(1);
            m.setHours(0, 0, 0, 0);
            setCurrentMonthStart(m);
        }
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
        const calendarDay = calendarMap[dateStr];

        let lateBy: string | undefined;
        let earlyBy: string | undefined;

        if (apiEntry?.punch_in_time) {
            const punchMinutes = toMinutes(apiEntry.punch_in_time);
            const shiftStart = toMinutes(SHIFT_CONFIG.startTime) + 30;

            if (punchMinutes > shiftStart) {
                const diff = punchMinutes - shiftStart;
                lateBy = `${Math.floor(diff / 60)}h ${diff % 60}m`;
            }
        }

        if (apiEntry?.punch_out_time) {
            const punchOutMinutes = toMinutes(apiEntry.punch_out_time);
            const shiftEnd = toMinutes(SHIFT_CONFIG.endTime);

            if (punchOutMinutes < shiftEnd) {
                const diff = shiftEnd - punchOutMinutes;
                earlyBy = `${Math.floor(diff / 60)}h ${diff % 60}m`;
            }
        }

        const isBeforeJoining = joiningDate && getNormalizedDate(date) < joiningDate;
        let status: DayStatus = "absent";

        if (isBeforeJoining) {
            status = "future";
        }
        else if (isFuture(date)) {
            status = "future";
        }
        else if (calendarDay?.calendar_type === "HOLIDAY") {
            status = "holiday";   // reuse weekend styling for holiday
        }
        else if (calendarDay?.calendar_type === "WEEKEND") {
            status = "weekend";
        }
        else if (apiEntry?.work_status === "LEAVE") {
            status = "leave";    // treated as absent visually
        }
        else if (apiEntry?.work_status === "WFH") {
            status = "WFH";
        }
        else if (apiEntry?.punch_in_time) {
            status = "present";
        }
        else {
            status = "absent";
        }

        return {
            day: isToday(date) ? "Today" : format(date, "EEE"),
            date: date.getDate(),
            dateStr,
            checkInTime: apiEntry?.punch_in_time || undefined,
            checkOutTime: apiEntry?.punch_out_time || undefined,
            lateBy,
            earlyBy,
            hoursWorked: apiEntry?.working_time ?? "0:00",
            status,
            isToday: isToday(date),
            isFuture: isFuture(date),
        };
    });

    const monthDates = (() => {
        const arr: Date[] = [];
        for (let i = 0; i < 30; i++) {
            const d = new Date(currentMonthStart);
            d.setDate(currentMonthStart.getDate() + i);
            arr.push(d);
        }
        return arr;
    })();

    const monthEnd = endOfMonth(currentMonthStart);

    const monthData = monthDates.map((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const apiEntry = monthlyAttendance.find(d => d.date === dateStr);
        const calendarDay = calendarMap[dateStr];

        let lateBy: string | undefined;
        let earlyBy: string | undefined;

        if (apiEntry?.punch_in_time) {
            const punchMinutes = toMinutes(apiEntry.punch_in_time);
            const shiftStart = toMinutes(SHIFT_CONFIG.startTime) + 30;

            if (punchMinutes > shiftStart) {
                const diff = punchMinutes - shiftStart;
                lateBy = `${Math.floor(diff / 60)}h ${diff % 60}m`;
            }
        }

        if (apiEntry?.punch_out_time) {
            const punchOutMinutes = toMinutes(apiEntry.punch_out_time);
            const shiftEnd = toMinutes(SHIFT_CONFIG.endTime);

            if (punchOutMinutes < shiftEnd) {
                const diff = shiftEnd - punchOutMinutes;
                earlyBy = `${Math.floor(diff / 60)}h ${diff % 60}m`;
            }
        }
        const isBeforeJoining = joiningDate && getNormalizedDate(date) < joiningDate;
        let status: DayStatus = "absent";

        if (isBeforeJoining) {
            status = "future";
        }
        else if (isFuture(date)) {
            status = "future";
        }
        else if (calendarDay?.calendar_type === "HOLIDAY") {
            status = "holiday";   // reuse weekend styling for holiday
        }
        else if (calendarDay?.calendar_type === "WEEKEND") {
            status = "weekend";
        }
        else if (apiEntry?.work_status === "LEAVE") {
            status = "leave";    // treated as absent visually
        }
        else if (apiEntry?.work_status === "WFH") {
            status = "WFH";
        }
        else if (apiEntry?.punch_in_time) {
            status = "present";
        }
        else {
            status = "absent";
        }

        return {
            day: isToday(date) ? "Today" : format(date, "EEE"),
            date: date.getDate(),
            dateStr,
            checkInTime: apiEntry?.punch_in_time || undefined,
            checkOutTime: apiEntry?.punch_out_time || undefined,
            lateBy,
            earlyBy,
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
        if (isCheckedIn) {
            // --- USER IS TRYING TO CLOCK OUT ---
            try {
                const token = Cookies.get("access");
                const res = await axios.get(
                    `${apiUrl}/total-working-time/`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
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
        setShowPunchOutToast(true);
        setTimeout(() => setShowPunchOutToast(false), 3000);
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
            retryCountRef.current = 0;
            attendanceRetryRef.current = 0;
            fetchGeolocation(false);
            fetchTodayAttendance();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, loading, router]);

    // Re-fetch attendance when page becomes visible (e.g., user returns to tab)
    // This fixes the issue where returning in the evening shows stale "Clock In" state
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible" && user) {
                attendanceRetryRef.current = 0;
                fetchTodayAttendance();
                // Also refresh location silently
                retryCountRef.current = 0;
                fetchGeolocation(false);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Auto-dismiss location popup after 3 seconds
    useEffect(() => {
        if (showLocationPopup) {
            const timer = setTimeout(() => setShowLocationPopup(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showLocationPopup]);

    // Auto-dismiss out of range popup after 3 seconds
    useEffect(() => {
        if (showOutOfRangePopup) {
            const timer = setTimeout(() => setShowOutOfRangePopup(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showOutOfRangePopup]);

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
        if (viewMode === "weekly") {

            const end = endOfWeek(currentWeekStart, { weekStartsOn: 0 });
            fetchWeeklyAttendance(currentWeekStart, end);
        }
    }, [currentWeekStart, fetchWeeklyAttendance]);



    useEffect(() => {
        if (viewMode === "monthly") {
            const end = endOfMonth(currentMonthStart);
            fetchMonthlyAttendance(currentMonthStart, end);
        }
    }, [currentMonthStart, viewMode, fetchMonthlyAttendance]);



    const monthlyAttendanceMap = React.useMemo(() => {
        const map: any = {};

        monthData.forEach((day) => {
            if (!day?.dateStr) return;

            map[day.dateStr] = {
                date: day.dateStr,
                checkInTime: day.checkInTime,
                checkOutTime: day.checkOutTime,
                hoursWorked: day.hoursWorked ?? "00:00",
                status: day.status,
            };
        });

        return map;
    }, [monthData]);


    // UI rendering
    if (loading || !user) {
        return <div className="p-8 text-center">Loading authentication...</div>;
    }

    const getIsPrevDisabled = () => {
        if (!joiningDate) return false;
        if (viewMode === "weekly") {
            const prevWeekEnd = new Date(currentWeekStart);
            prevWeekEnd.setDate(currentWeekStart.getDate() - 1);
            return getNormalizedDate(prevWeekEnd) < joiningDate;
        } else {
            const prevMonthEnd = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth(), 0);
            return getNormalizedDate(prevMonthEnd) < joiningDate;
        }
    };
    const disablePrev = getIsPrevDisabled();

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

                        <div className="text-lg w-full px-4 pb-4 pt-1">
                            {/* MAIN CONTENT WRAPPER: Column on mobile, Row on Large Screens */}
                            <div className="flex flex-col-reverse lg:flex-row gap-4 pt-0">

                                {/* --- LEFT SIDE: TIMESHEET --- */}
                                <div className="w-full lg:w-[80%] min-h-screen space-y-6 pt-0">
                                    {/* <BigCalendar /> */}
                                    <TimesheetHeader
                                        weekStart={currentWeekStart}
                                        weekEnd={weekEnd}

                                        onNavigate={handleNavigate}
                                        onViewChange={changeViewMode}
                                        viewMode={viewMode}

                                        onToday={goToToday}
                                        shiftStart={SHIFT_CONFIG.startTime}
                                        shiftEnd={SHIFT_CONFIG.endTime}

                                        onRegularize={() => setOpenRegulize(true)}
                                        onApplyLeave={() => setOpenApplyLeaves(true)}
                                        onApplyWFH={() => setOpenApplyWfh(true)}
                                        monthStart={currentMonthStart}
                                        onEmployeeAttendanceSheet={handleOpenEmployeeAttendanceSheet}
                                        disablePrev={disablePrev}
                                    />


                                    {/* 🔥 CALENDAR SWITCH GOES HERE */}
                                    {viewMode === "monthly" && (
                                        <EmployeeCalendar

                                            currentDate={currentMonthStart}
                                            selectedDate={selectedDate}
                                            attendanceData={monthlyAttendanceMap}

                                            activeTimer={null}

                                            expectedHours={expectedMonthlyHours}
                                            totalHours={totalMonthlyHours}
                                            onSelectDate={setSelectedDate}
                                            onMonthChange={setCurrentMonthStart}
                                            calendarMap={calendarMap}
                                        />
                                    )}

                                    {viewMode === "weekly" && (
                                        <div className="bg-card rounded-lg border border-border shadow-sm p-4 lg:p-6 pt-2">
                                            <div className="space-y-4 lg:space-y-2">
                                                {weekData.map((entry, index) => (
                                                    <TimeEntryRow
                                                        key={index}
                                                        {...entry}
                                                        checkInTime={entry.checkInTime ?? undefined}
                                                        checkOutTime={entry.checkOutTime ?? undefined}
                                                        calendarDay={calendarMap[entry.dateStr]}
                                                    />
                                                ))}
                                            </div>

                                            <div className="w-full bg-white p-4 text-sm flex justify-between">
                                                <p>
                                                    Weekly Working Time: {expectedWeeklyHours}
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
                                    )}
                                </div>

                                {/* --- RIGHT SIDE: PUNCH & LOCATION --- */}
                                <div className="w-full lg:w-[20%] mt-0 relative space-y-4">
                                    <PunchCard
                                        isPunchedIn={isPunchedInUI}
                                        hasPunchedOut={Boolean(attendanceStatus?.punch_out_time)}
                                        workedSeconds={workedSecondsToday}
                                        handlePunchAction={handlePunchAction}
                                        punchTime={punchTime}
                                        elapsedSeconds={initialElapsedSeconds}
                                        profileName={employee?.name ?? "Employee"}
                                        imgurl={avatarSrc}
                                    />

                                    {/* Location display & refresh */}
                                    <div className="mb-4">
                                        <button
                                            onClick={() => fetchGeolocation(true)}
                                            disabled={isProcessing || showRefreshSuccess}
                                            className={`w-full py-3.5 px-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition duration-200 shadow-sm cursor-pointer ${
                                                showRefreshSuccess
                                                    ? "bg-green-50 text-green-600 border border-green-200"
                                                    : locationError
                                                    ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                                                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100"
                                            }`}
                                        >
                                            {showRefreshSuccess ? (
                                                <>
                                                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 animate-pulse"></span>
                                                    <span>Successfully Updated</span>
                                                </>
                                            ) : isProcessing ? (
                                                <span>Updating Location...</span>
                                            ) : (
                                                <span>Refresh Location</span>
                                            )}
                                        </button>
                                    </div>

                                    {/* QUICK ACTIONS FOR ATTENDANCE TAB */}
                                    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-0 lg:mb-4">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-4">Quick Actions</h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            <button onClick={() => setOpenApplyLeaves(true)} className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                                <CalendarPlus className="w-5 h-5" />
                                                <span className="text-[10px] font-bold">Leave</span>
                                            </button>
                                            <button onClick={() => setOpenApplyWfh(true)} className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
                                                <Laptop className="w-5 h-5" />
                                                <span className="text-[10px] font-bold">WFH</span>
                                            </button>
                                            <button onClick={() => setOpenRegulize(true)} className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors">
                                                <ClockArrowUp className="w-5 h-5" />
                                                <span className="text-[10px] font-bold">Regularize</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Message removed per user request */}

                                    <div>
                                        <div>
                                            {/* Regularize Attendance */}
                                            {openRegulize && (
                                                <AttendanceRegularizationPopup
                                                    onClose={() => setOpenRegulize(false)}
                                                    onSubmit={handleSubmitRegulize}
                                                    loading={loadingRegulize}
                                                    message={messageRegulize}
                                                />
                                            )}

                                            {/* Apply For Leave */}
                                            {/* MODAL OVERLAY */}
                                            {openApplyLeaves && (
                                                <ApplyLeaveModal
                                                    onClose={() => setOpenApplyLeaves(false)}
                                                    onSubmit={applyLeave}
                                                />
                                            )}

                                            {/* Apply For WFH */}
                                            {/* MODAL OVERLAY */}
                                            {openApplyWfh && (
                                                <ApplyWFHModal
                                                    onClose={() => setOpenApplyWfh(false)}
                                                    onSubmit={applyWFH}
                                                />
                                            )}
                                            {/* Employee Attendance Sheet */}
                                            {isEmployeeSheetOpen && (
                                                <EmployeeAttendanceSheet
                                                    onClose={() => setIsEmployeeSheetOpen(false)}
                                                    onSubmit={handleEmployeeSheetSubmit}
                                                    calendarMap={calendarMap}
                                                    data={employeeSheetData}
                                                    loading={employeeSheetLoading}
                                                    error={employeeSheetError}
                                                />
                                            )}



                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )

            case "Employee Hierarchy":
                return (
                    <div className="p-4 md:p-6 w-full">
                        <EmployeeHierarchyTab />
                    </div>
                );
            case "Leaves & WFH":
                return (
                    <>
                        {/* Leaves Component */}
                        <div className="p-0 sm:p-6 space-y-6 sm:space-y-8 bg-slate-50/30 py-4 sm:py-6">

                            {/* HEADER SECTION */}
                            <div className="px-4 sm:px-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest px-4 sm:px-1">
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
                        <div className="p-0 sm:p-6 space-y-6 sm:space-y-8 bg-slate-50/30 py-4 sm:py-6">

                            {/* HEADER SECTION */}
                            <div className="px-4 sm:px-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest px-4 sm:px-1">
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

                        {/* Regulize Component */}
                        <div className="p-0 sm:p-6 space-y-6 sm:space-y-8 bg-slate-50/30 py-4 sm:py-6">

                            {/* HEADER SECTION */}
                            <div className="px-4 sm:px-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                                        Attendance Correction Requests
                                        <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                                    </h1>
                                    <p className="text-sm text-slate-500 font-medium">
                                        Submit and track your attendance correction applications and history.
                                    </p>
                                </div>

                                <button
                                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    onClick={() => setOpenRegulize(true)}
                                >
                                    <Plus className="w-5 h-5" />
                                    Apply Regularize Attendance
                                </button>
                            </div>

                            {/* DATA TABLE SECTION */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest px-4 sm:px-1">
                                    <Laptop className="w-3.5 h-3.5" />
                                    Recent Requests & Status
                                </div>

                                {/* Assumes EmployeeWFHHistoryTable follows the same professional style we built for leaves */}
                                <EmployeeRegulizeRequests
                                    loading={loading}
                                    list={requestsRegulize}
                                />
                            </div>

                            {/* MODAL OVERLAY */}
                            {openRegulize && (
                                <AttendanceRegularizationPopup
                                    onClose={() => setOpenRegulize(false)}
                                    onSubmit={handleSubmitRegulize}
                                    loading={loadingRegulize}
                                    message={messageRegulize}
                                />
                            )}

                        </div>

                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-100 hover:border-red-600 font-semibold text-xs uppercase tracking-widest rounded-2xl transition-all duration-300 active:scale-[0.98]"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout System
                        </button>
                        <LogoutConfirmModal
                            isOpen={showLogoutModal}
                            onConfirm={() => {
                                setShowLogoutModal(false);
                                logout();
                            }}
                            onCancel={() => setShowLogoutModal(false)}
                        />
                    </>
                )

            default:
                return <></>;
        }
    }

    return (
        <div className="w-full bg-sky-50 p-4 relative">
            <div className="text-lg">
                <div className="flex space-x-8 text-xs font-bold border-b border-gray-300 mb-4">
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

            {/* FULLSCREEN LOCATION POPUP - tap anywhere to dismiss, auto-dismiss in 3 sec */}
            {showLocationPopup && (
                <div
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50"
                    onClick={() => setShowLocationPopup(false)}
                >
                    <div className="bg-white rounded-3xl p-8 mx-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center relative">
                        {/* Cross button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowLocationPopup(false); }}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Turn On Location</h2>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Please turn on location on your device to continue. Enable GPS from your notification bar or device settings.
                        </p>
                    </div>
                </div>
            )}

            {/* OUT OF RANGE / LOCATION NOT SUPPORTED POPUP */}
            {showOutOfRangePopup && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowOutOfRangePopup(false)}>
                    <div 
                        className="bg-white text-slate-800 border border-slate-200 px-8 py-6 rounded-2xl shadow-2xl text-center max-w-xs mx-4 animate-in zoom-in-95 fade-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {outOfRangeMessage === "LOCATION_NOT_SUPPORTED" ? (
                            <>
                                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><line x1="8" y1="8" x2="16" y2="16"/><line x1="16" y1="8" x2="8" y2="16"/></svg>
                                </div>
                                <p className="text-lg font-semibold text-slate-800 mb-1">Location Not Supported</p>
                                <p className="text-sm text-slate-500 mb-4">Your current location could not be verified. Please ensure your device GPS is functioning correctly and try again.</p>
                            </>
                        ) : (
                            <>
                                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                </div>
                                <p className="text-lg font-semibold text-slate-800 mb-1">You are out of range</p>
                                <p className="text-sm text-slate-500 mb-4">Please move closer to the office to punch in/out.</p>
                            </>
                        )}
                        <button 
                            onClick={() => setShowOutOfRangePopup(false)}
                            className="px-6 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

};

export default EmployeeAttendancePage;