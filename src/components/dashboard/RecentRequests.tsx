"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { apiUrl } from "@/lib/data";

// Import the SAME modals used on the attendance admin page
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
  rawData: any;
}

type FilterType = "all" | "pending" | "approved";

export default function RecentRequests() {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  // Modal states
  const [selectedLeave, setSelectedLeave] = useState<any | null>(null);
  const [selectedWFH, setSelectedWFH] = useState<any | null>(null);
  const [correctionDetail, setCorrectionDetail] = useState<any | null>(null);
  const [correctionToken, setCorrectionToken] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
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
            rawData: w
          });
        });
      }

      if (regRes.status === "fulfilled" && regRes.value.data.data) {
        regRes.value.data.data.forEach((r: any) => {
          combined.push({
            id: `reg-${r.approval_token || r.id}`,
            name: r.employee || "—",
            type: `Regularize`,
            typeKey: "regularize",
            dates: r.date || "—",
            status: r.status || "PENDING",
            rawData: r
          });
        });
      }

      // Sort: PENDING first, then others
      combined.sort((a, b) => {
        if (a.status === "PENDING" && b.status !== "PENDING") return -1;
        if (a.status !== "PENDING" && b.status === "PENDING") return 1;
        return 0;
      });

      setRequests(combined.slice(0, 10));
    } catch (err) {
      console.error("Error fetching recent requests", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filteredRequests = useMemo(() => {
    if (filter === "pending") return requests.filter(r => r.status === "PENDING");
    if (filter === "approved") return requests.filter(r => r.status === "APPROVED");
    return requests;
  }, [requests, filter]);

  // --- Click handler: open the right modal ---
  const handleRowClick = async (req: RequestData) => {
    if (req.typeKey === "leave") {
      setSelectedLeave(req.rawData);
    } else if (req.typeKey === "wfh") {
      setSelectedWFH(req.rawData);
    } else if (req.typeKey === "regularize") {
      try {
        const tkn = Cookies.get("access");
        const res = await axios.get(`${apiUrl}/api/admin/attendance-approval/${req.rawData.approval_token}`, {
          headers: { Authorization: `Bearer ${tkn}` }
        });
        setCorrectionToken(req.rawData.approval_token);
        setCorrectionDetail(res.data.data);
      } catch (err) {
        alert("Failed to fetch correction detail");
      }
    }
  };

  // --- Action handlers ---
  const handleLeaveAction = async (leaveId: number, action: "APPROVE" | "REJECT") => {
    try {
      const token = Cookies.get("access");
      const res = await axios.post(
        `${apiUrl}/api/admin/leaves/${leaveId}/action/`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      setSelectedLeave(null);
      fetchRequests();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Action failed");
    }
  };

  const handleWFHAction = async (wfhId: number, action: "APPROVE" | "REJECT") => {
    try {
      const token = Cookies.get("access");
      const res = await axios.post(
        `${apiUrl}/wfh/admin/action/${wfhId}/`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      setSelectedWFH(null);
      fetchRequests();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Action failed");
    }
  };

  const handleCorrectionAction = async (action: "APPROVE" | "REJECT", comment: string) => {
    try {
      const token = Cookies.get("access");
      const res = await axios.post(
        `${apiUrl}/api/admin/attendance-approval/${correctionToken}/action/`,
        { action, admin_comment: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      setCorrectionDetail(null);
      setCorrectionToken(null);
      fetchRequests();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Action failed");
    }
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

  const filterPills: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
  ];

  return (
    <>
      <div className="bg-white border border-[#E9EBF0] rounded-xl p-5">
        {/* Header with filter pills */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[13px] font-semibold text-gray-900 tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>Recent Requests</p>
            <p className="text-xs text-gray-400">Pending actions need your attention</p>
          </div>
          <div className="flex gap-1.5">
            {filterPills.map((pill) => (
              <button
                key={pill.key}
                onClick={() => setFilter(pill.key)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  filter === pill.key
                    ? "bg-blue-50 border-blue-200 text-blue-600 font-semibold"
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-[13px]">
          <thead>
            <tr>
              <th className="text-left text-[11px] uppercase tracking-wider text-gray-400 font-semibold pb-2.5 px-3 border-b border-gray-100">Employee</th>
              <th className="text-left text-[11px] uppercase tracking-wider text-gray-400 font-semibold pb-2.5 px-3 border-b border-gray-100">Type</th>
              <th className="text-left text-[11px] uppercase tracking-wider text-gray-400 font-semibold pb-2.5 px-3 border-b border-gray-100">Date Range</th>
              <th className="text-left text-[11px] uppercase tracking-wider text-gray-400 font-semibold pb-2.5 px-3 border-b border-gray-100">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">Loading live data...</td></tr>
            ) : filteredRequests.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-500">No requests found.</td></tr>
            ) : (
              filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-[#FAFBFD] cursor-pointer transition-colors"
                  onClick={() => handleRowClick(req)}
                >
                  <td className="py-2.5 px-3 border-b border-gray-50">
                    <span className="font-medium text-blue-600 hover:underline cursor-pointer">{req.name}</span>
                  </td>
                  <td className="py-2.5 px-3 border-b border-gray-50">
                    <span className="bg-gray-100 text-gray-700 text-[11px] px-2 py-0.5 rounded font-medium">{req.type}</span>
                  </td>
                  <td className="py-2.5 px-3 border-b border-gray-50 text-gray-500">{req.dates}</td>
                  <td className="py-2.5 px-3 border-b border-gray-50">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${getStatusBadge(req.status)}`}>
                      <span className={`w-[5px] h-[5px] rounded-full inline-block ${getStatusDot(req.status)}`}></span>
                      {req.status.charAt(0) + req.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* === MODALS rendered right here on the dashboard === */}

      {selectedLeave && (
        <AdminLeaveDetailModal
          leave={selectedLeave}
          onClose={() => setSelectedLeave(null)}
          onApprove={() => handleLeaveAction(selectedLeave.leave_id, "APPROVE")}
          onReject={() => handleLeaveAction(selectedLeave.leave_id, "REJECT")}
        />
      )}

      {selectedWFH && (
        <AdminWFHDetailModal
          wfh={selectedWFH}
          onClose={() => setSelectedWFH(null)}
          onApprove={() => handleWFHAction(selectedWFH.wfh_id, "APPROVE")}
          onReject={() => handleWFHAction(selectedWFH.wfh_id, "REJECT")}
        />
      )}

      {correctionDetail && (
        <CorrectionDetailModal
          data={correctionDetail}
          onClose={() => { setCorrectionDetail(null); setCorrectionToken(null); }}
          onAction={handleCorrectionAction}
        />
      )}
    </>
  );
}
