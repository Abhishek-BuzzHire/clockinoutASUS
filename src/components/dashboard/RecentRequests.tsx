"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import axios from "axios";
import Cookies from "js-cookie";
import { apiUrl } from "@/lib/data";

interface RequestData {
  id: string;
  name: string;
  type: string;
  dates: string;
  status: string;
  // For redirect
  redirectUrl: string;
}

export default function RecentRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = Cookies.get("access");
        const headers = { Authorization: `Bearer ${token}` };

        const [leavesRes, wfhRes, regRes] = await Promise.allSettled([
          axios.get(`${apiUrl}/api/admin/leaves/`, { headers, params: { status: "PENDING" } }),
          axios.get(`${apiUrl}/wfh/admin/requests/`, { headers, params: { status: "PENDING" } }),
          axios.get(`${apiUrl}/api/admin/attendance-regularization/requests/`, { headers, params: { status: "PENDING" } })
        ]);

        const combined: RequestData[] = [];

        if (leavesRes.status === "fulfilled" && leavesRes.value.data.results) {
          leavesRes.value.data.results.forEach((l: any) => {
            combined.push({
              id: `leave-${l.leave_id}`,
              name: l.user_name || l.user_email || "—",
              type: l.leave_type || "Leave",
              dates: `${l.start_date || ""} → ${l.end_date || ""}`,
              status: l.status || "PENDING",
              redirectUrl: `/list/attendance/admin?tab=leave&leaveId=${l.leave_id}`
            });
          });
        }

        if (wfhRes.status === "fulfilled" && wfhRes.value.data.results) {
          wfhRes.value.data.results.forEach((w: any) => {
            combined.push({
              id: `wfh-${w.wfh_id}`,
              name: w.user_name || w.user_email || "—",
              type: "WFH",
              dates: w.date || "—",
              status: w.status || "PENDING",
              redirectUrl: `/list/attendance/admin?tab=regularization&wfhId=${w.wfh_id}`
            });
          });
        }

        if (regRes.status === "fulfilled" && regRes.value.data.data) {
          regRes.value.data.data.forEach((r: any) => {
            combined.push({
              id: `reg-${r.approval_token || r.id}`,
              name: r.employee || "—",
              type: `Regularize (${r.type || ""})`,
              dates: r.date || "—",
              status: r.status || "PENDING",
              redirectUrl: `/list/attendance/admin?tab=regularization&regularizationToken=${r.approval_token}`
            });
          });
        }

        setRequests(combined.slice(0, 15));
      } catch (err) {
        console.error("Error fetching recent requests", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === "APPROVED") return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (s === "REJECTED") return "bg-red-100 text-red-800 border-red-200";
    return "bg-orange-100 text-orange-800 border-orange-200";
  };

  return (
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
                  onClick={() => router.push(req.redirectUrl)}
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
  );
}
