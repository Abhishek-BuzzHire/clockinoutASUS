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
import { CalendarDays, CalendarPlus, ClockArrowUp, Home, Laptop, LayoutDashboard, LogOut, LogIn, Plus } from "lucide-react";
import EmployeeRegulizeRequests from "@/components/attendance/EmployeeRegulizeRequests";
import { toMinutes } from "../admin/page";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";
import EmployeeCalendar from "@/components/attendance/EmployeeCalender";
import EmployeeAttendanceSheet from "@/components/attendance/EmployeeAttendanceSheet";

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
        <div className="relative w-full max-w-sm mx-auto bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mt-6 mb-6">
            
            <div className="flex justify-center -mt-10 relative z-10">
                <div className="relative">
                    <img
                        src={imgurl || '/avatar.png'}
                        alt={profileName || "employee"}
                        className="rounded-full object-cover border-[5px] border-white shadow-sm w-20 h-20 bg-slate-50"
                        onError={(e) => {
                            e.currentTarget.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(profileName || "Employee") + "&background=0D8ABC&color=fff";
                        }}
                    />
                    <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white bg-green-500"></div>
                </div>
            </div>

            <div className="text-center px-6 pb-6 pt-2">
                <h3 className="text-lg font-bold text-slate-800">{profileName ?? "Employee"}</h3>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-5">BuzzHire User</p>

                <p className={`font-bold text-sm tracking-wide mb-3 ${isPunchedIn ? "text-green-500" : "text-slate-400"}`}>
                    {isPunchedIn ? "IN" : "OUT"}
                </p>
                
                <button
                    onClick={handlePunchAction}
                    className={`w-3/4 mx-auto py-3.5 rounded-full flex items-center justify-center gap-2 font-bold text-white text-base shadow-lg transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
            ${isPunchedIn ? "bg-[#EF4444] shadow-red-200" : "bg-[#22C55E] shadow-green-200"}`}
                >
                    {isPunchedIn ? "Clock Out" : "Clock In"}
                </button>
                
                <p className="mt-4 text-xs font-medium text-slate-500">
                    {isPunchedIn ? `Punched In at: ${punchTime}` : punchTime ? `Last punched out: ${punchTime}` : "Ready to start shift"}
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

    const tabs = ["Attendance", "Leaves & WFH"];
    const [activeTab, setActiveTab] = useState("Attendance");

    const [calendarMap, setCalendarMap] = useState<Record<string, CalendarDay>>({});

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

            const res = await axios.post(
                `${apiUrl}/wfh/apply/`,
                { date, admin_username: adminUsername },
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

            const res = await axios.post(
                `${apiUrl}/api/employee/leave/apply/`,
                fianlPayload,
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
            setLoadingRegulize(true);
            const token = Cookies.get("access");

            const fianlPayload = {
                ...payload,
                admin_username: adminUsername,
            }

            const res = await axios.post(
                `${apiUrl}/api/attendance-correction/request/`,
                fianlPayload,
                { headers: { Authorization: `Bearer ${token}` } }
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

    const handleEmployeeSheetSubmit = async (start: string, end: string) => {
        await fetchAttendanceAndCalendar(start, end);
    };
    const handleOpenEmployeeAttendanceSheet = () => {
        setIsEmployeeSheetOpen(true);
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
                    Authorization: `Bearer ${token}`,
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
                    setPunchTime(new Date(data.data.punch_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }));
                    // console.log("FetchToday Api Punch In", "Raw:", data.data.punch_in_time, "&", "Processed:", punchTime)
                } else if (data.data.punch_out_time) {
                    setPunchTime(new Date(data.data.punch_out_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }));
                    // console.log("FetchToday Api Punch Out", "Raw:", data.data.punch_out_time, "&", "Processed:", punchTime)
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
                        // console.log("handlePunch Api Punch In", "Raw:", data.data.punch_in_time, "&", "Processed:", punchTime)
                    } else if (type === "out" && data.data.punch_out_time) {
                        setInitialElapsedSeconds(0);
                        setPunchTime(new Date(data.data.punch_out_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }));
                        // console.log("handlePunch Api Punch Out", "Raw:", data.data.punch_out_time, "&", "Processed:", punchTime)
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
        const currentTime = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
        setPunchTime(currentTime);
        // console.log("CurrentTIme Component", currentTime)
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

                        <div className="text-lg w-full p-4">
                            {/* MAIN CONTENT WRAPPER: Column on mobile, Row on Large Screens */}
                            <div className="flex flex-col-reverse lg:flex-row gap-4 pt-8 lg:pt-0">

                                {/* --- LEFT SIDE: TIMESHEET --- */}
                                <div className="w-full lg:w-[80%] min-h-screen space-y-6 pt-4 lg:pt-0">
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
                                <div className="w-full lg:w-[20%] mt-0 lg:mt-4 relative space-y-4">
                                    <PunchCard
                                        isPunchedIn={isPunchedInUI}
                                        handlePunchAction={handlePunchAction}
                                        punchTime={punchTime}
                                        elapsedSeconds={initialElapsedSeconds}
                                        profileName={employee?.name ?? "Employee"}
                                        imgurl={avatarSrc}
                                    />

                                    {/* Location display & refresh (Moved Above Quick Actions) */}
                                    <div className="mb-4">
                                        {locationError && (
                                            <div className="mb-3 p-3 rounded-2xl text-xs bg-red-50 text-red-600 border border-red-100 flex flex-col gap-1 text-center">
                                                <span className="font-bold">Location Error</span>
                                                <p>{locationError}</p>
                                            </div>
                                        )}
                                        <button
                                            onClick={fetchGeolocation}
                                            disabled={isProcessing}
                                            className={`w-full py-3 px-4 rounded-2xl text-sm font-semibold flex items-center justify-center transition duration-200 shadow-sm ${locationError ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100"}`}
                                        >
                                            {isProcessing ? "Updating Location..." : "Refresh Location"}
                                        </button>
                                    </div>

                                    {/* QUICK ACTIONS FOR ATTENDANCE TAB */}
                                    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-4">
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

                                    {/* Message */}
                                    {message && (
                                        <div className={`p-4 rounded-md ${message.startsWith("Error") || message.includes("failed") ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}>
                                            {message}
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-4 justify-between h-[32%]">
                                        <div className="space-y-2">
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

                        {/* Regulize Component */}
                        <div className="p-6 space-y-8 bg-slate-50/30">

                            {/* HEADER SECTION */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
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