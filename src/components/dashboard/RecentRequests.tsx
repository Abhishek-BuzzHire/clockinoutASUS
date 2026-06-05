"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  // Raw data for modals
  rawData: any;
}

export default function RecentRequests() {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);

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
            type: `Regularize (${r.type || ""})`,
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

  // --- Click handler: open the right modal ---
  const handleRowClick = async (req: RequestData) => {
    if (req.typeKey === "leave") {
      setSelectedLeave(req.rawData);
    } else if (req.typeKey === "wfh") {
      setSelectedWFH(req.rawData);
    } else if (req.typeKey === "regularize") {
      // Need to fetch detail via approval_token
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
      fetchRequests(); // refresh list
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

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === "APPROVED") return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (s === "REJECTED") return "bg-red-100 text-red-800 border-red-200";
    return "bg-orange-100 text-orange-800 border-orange-200";
  };

  return (
    <>
      <Card className="h-full border-none shadow-sm rounded-xl overflow-hidden flex flex-col w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-gray-800">Recent Requests</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 px-4 pb-4">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b-gray-100">
                <TableHead className="font-semibold text-gray-600">Employee</TableHead>
                <TableHead className="font-semibold text-gray-600">Type</TableHead>
                <TableHead className="font-semibold text-gray-600">Date</TableHead>
                <TableHead className="font-semibold text-gray-600">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-400">Loading live data...</TableCell></TableRow>
              ) : requests.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">No pending requests found.</TableCell></TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow
                    key={req.id}
                    className="border-b-gray-50 hover:bg-blue-50/40 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(req)}
                  >
                    <TableCell className="font-medium text-blue-700 hover:underline">{req.name}</TableCell>
                    <TableCell className="text-gray-600">{req.type}</TableCell>
                    <TableCell className="text-gray-600 text-sm">{req.dates}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
