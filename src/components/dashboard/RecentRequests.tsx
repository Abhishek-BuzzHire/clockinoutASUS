"use client";

import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { apiUrl } from "@/lib/data";
import useSWR from "swr";

import AdminLeaveDetailModal from "@/components/attendance/AdminLeaveDetailModal";
import AdminWFHDetailModal from "@/components/attendance/AdminWFHDetailModal";
import CorrectionDetailModal from "@/components/attendance/CorrectionDetailModal";

interface RequestData {
  id: string;
  name: string;
  type: string;
  typeKey: "leave" | "wfh" | "regularize";
  dates: string;
  status: string;
  createdAt: number;
  rawData: any;
}

type FilterType = "all" | "pending" | "approved";

const fetcher = async () => {
  const token = Cookies.get("access");
  const headers = { Authorization: `Bearer ${token}` };

  const [leavesRes, wfhRes, regRes] = await Promise.allSettled([
    axios.get(`${apiUrl}/api/admin/leaves/`, { headers }),
    axios.get(`${apiUrl}/wfh/admin/requests/`, { headers }),
    axios.get(`${apiUrl}/api/admin/attendance-regularization/requests/`, { headers })
  ]);

  const combined: RequestData[] = [];

  if (leavesRes.status === "fulfilled" && leavesRes.value.data.results) {
    leavesRes.value.data.results.forEach((l: any) => {
      combined.push({
        id: `leave-${l.leave_id}`,
        name: l.user_name || l.user_email || "—",
        type: l.leave_type || "Leave",
        typeKey: "leave",
        dates: `${l.start_date || ""} → ${l.end_date || ""}`,
        status: l.status || "PENDING",
        createdAt: new Date(l.applied_at).getTime() || 0,
        rawData: l
      });
    });
  }

  if (wfhRes.status === "fulfilled" && wfhRes.value.data.results) {
    wfhRes.value.data.results.forEach((w: any) => {
      combined.push({
        id: `wfh-${w.wfh_id}`,
        name: w.user_name || w.user_email || "—",
        type: "WFH",
        typeKey: "wfh",
        dates: w.date || "—",
        status: w.status || "PENDING",
        createdAt: new Date(w.applied_at).getTime() || 0,
        rawData: w
      });
    });
  }

  if (regRes.status === "fulfilled" && regRes.value.data.data) {
    regRes.value.data.data.forEach((r: any) => {
      combined.push({
        id: `reg-${r.approval_token || r.id}`,
        name: r.employee || "—",
        type: "Regularize",
        typeKey: "regularize",
        dates: r.date || "—",
        status: r.status || "PENDING",
        createdAt: new Date(r.created_at).getTime() || 0,
        rawData: r
      });
    });
  }

  combined.sort((a, b) => {
    if (a.status === "PENDING" && b.status !== "PENDING") return -1;
    if (a.status !== "PENDING" && b.status === "PENDING") return 1;
    return b.createdAt - a.createdAt;
  });

  return combined.slice(0, 10);
};

export default function RecentRequests() {
  const [filter, setFilter] = useState<FilterType>("all");

  const [selectedLeave, setSelectedLeave] = useState<any | null>(null);
  const [selectedWFH, setSelectedWFH] = useState<any | null>(null);
  const [correctionDetail, setCorrectionDetail] = useState<any | null>(null);
  const [correctionToken, setCorrectionToken] = useState<string | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [localRequests, setLocalRequests] = useState<RequestData[] | undefined>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("dashboard_recent_requests_cache");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse cached requests", e);
        }
      }
    }
    return undefined;
  });

  const { data: requests, isLoading, mutate } = useSWR<RequestData[]>(
    'dashboard_recent_requests',
    fetcher,
    { keepPreviousData: true, revalidateOnFocus: false }
  );

  useEffect(() => {
    if (requests && typeof window !== "undefined") {
      localStorage.setItem("dashboard_recent_requests_cache", JSON.stringify(requests));
    }
  }, [requests]);

  const effectiveRequests = isMounted ? (requests || localRequests || []) : [];

  const filteredRequests = useMemo(() => {
    if (filter === "pending") return effectiveRequests.filter(r => r.status === "PENDING");
    if (filter === "approved") return effectiveRequests.filter(r => r.status === "APPROVED");
    return effectiveRequests;
  }, [effectiveRequests, filter]);

  const handleRowClick = async (req: RequestData) => {
    if (req.typeKey === "leave") {
      setSelectedLeave(req.rawData);
    } else if (req.typeKey === "wfh") {
      setSelectedWFH(req.rawData);
    } else if (req.typeKey === "regularize") {
      setCorrectionToken(req.rawData.approval_token);
      setCorrectionDetail(req.rawData);
    }
  };

  const handleLeaveAction = async (leaveId: number, action: "APPROVE" | "REJECT") => {
    try {
      const token = Cookies.get("access");
      const res = await axios.post(`${apiUrl}/api/admin/leaves/${leaveId}/action/`, { action }, { headers: { Authorization: `Bearer ${token}` } });
      alert(res.data.message);
      setSelectedLeave(null);
      mutate();
    } catch (err: any) { alert(err?.response?.data?.error || "Action failed"); }
  };

  const handleWFHAction = async (wfhId: number, action: "APPROVE" | "REJECT") => {
    try {
      const token = Cookies.get("access");
      const res = await axios.post(`${apiUrl}/wfh/admin/action/${wfhId}/`, { action }, { headers: { Authorization: `Bearer ${token}` } });
      alert(res.data.message);
      setSelectedWFH(null);
      mutate();
    } catch (err: any) { alert(err?.response?.data?.error || "Action failed"); }
  };

  const handleCorrectionAction = async (action: "APPROVE" | "REJECT", comment: string) => {
    try {
      const token = Cookies.get("access");
      const res = await axios.post(`${apiUrl}/api/admin/attendance-approval/${correctionToken}/action/`, { action, admin_comment: comment }, { headers: { Authorization: `Bearer ${token}` } });
      alert(res.data.message);
      setCorrectionDetail(null);
      setCorrectionToken(null);
      mutate();
    } catch (err: any) { alert(err?.response?.data?.message || "Action failed"); }
  };

  const getStatusDot = (status: string) => {
    const s = status.toUpperCase();
    if (s === "APPROVED") return "bg-green-500";
    if (s === "REJECTED") return "bg-red-500";
    return "bg-amber-500";
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === "APPROVED") return "bg-emerald-50 text-emerald-800";
    if (s === "REJECTED") return "bg-red-50 text-red-800";
    return "bg-amber-50 text-amber-800";
  };

  const getTypeBadge = (type: string) => {
    const t = type.toUpperCase();
    if (t === "LEAVE") return "bg-rose-100 border border-rose-200 text-rose-700";
    if (t === "WFH") return "bg-cyan-100 border border-cyan-200 text-cyan-700";
    if (t === "REGULARIZE") return "bg-blue-100 border border-blue-200 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };

  const filterPills: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
  ];

  return (
    <>
      <div className="bg-white border border-[#E9EBF0] rounded-xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-2xl font-medium text-gray-900 tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>Recent Requests</p>
            <p className="text-sm text-gray-500 mt-1.5">Pending actions need your attention</p>
          </div>
          <div className="flex gap-1.5">
            {filterPills.map((pill) => (
              <button
                key={pill.key}
                onClick={() => setFilter(pill.key)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${filter === pill.key
                    ? "bg-blue-50 border-blue-200 text-blue-600 font-semibold"
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left text-xs uppercase tracking-wider text-gray-400 font-semibold pb-3 px-3 border-b border-gray-100">Employee</th>
              <th className="text-left text-xs uppercase tracking-wider text-gray-400 font-semibold pb-3 px-3 border-b border-gray-100">Type</th>
              <th className="text-left text-xs uppercase tracking-wider text-gray-400 font-semibold pb-3 px-3 border-b border-gray-100">Date Range</th>
              <th className="text-left text-xs uppercase tracking-wider text-gray-400 font-semibold pb-3 px-3 border-b border-gray-100">Status</th>
            </tr>
          </thead>
          <tbody>
            {!isMounted || (isLoading && !requests && !localRequests) ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">Loading live data...</td></tr>
            ) : filteredRequests.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-500">No requests found.</td></tr>
            ) : (
              filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-[#FAFBFD] cursor-pointer transition-colors" onClick={() => handleRowClick(req)}>
                  <td className="py-3.5 px-3 border-b border-gray-50">
                    <span className="font-semibold text-gray-900 hover:underline">{req.name}</span>
                  </td>
                  <td className="py-3.5 px-3 border-b border-gray-50">
                    <span className={`${getTypeBadge(req.type)} text-xs px-2.5 py-1 rounded font-medium`}>{req.type}</span>
                  </td>
                  <td className="py-3.5 px-3 border-b border-gray-50 text-gray-500">{req.dates}</td>
                  <td className="py-3.5 px-3 border-b border-gray-50">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadge(req.status)}`}>
                      <span className={`w-[6px] h-[6px] rounded-full inline-block ${getStatusDot(req.status)}`}></span>
                      {req.status.charAt(0) + req.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedLeave && (
        <AdminLeaveDetailModal leave={selectedLeave} onClose={() => setSelectedLeave(null)}
          onApprove={() => handleLeaveAction(selectedLeave.leave_id, "APPROVE")}
          onReject={() => handleLeaveAction(selectedLeave.leave_id, "REJECT")} />
      )}
      {selectedWFH && (
        <AdminWFHDetailModal wfh={selectedWFH} onClose={() => setSelectedWFH(null)}
          onApprove={() => handleWFHAction(selectedWFH.wfh_id, "APPROVE")}
          onReject={() => handleWFHAction(selectedWFH.wfh_id, "REJECT")} />
      )}
      {correctionDetail && (
        <CorrectionDetailModal data={correctionDetail}
          onClose={() => { setCorrectionDetail(null); setCorrectionToken(null); }}
          onAction={handleCorrectionAction} />
      )}
    </>
  );
}
