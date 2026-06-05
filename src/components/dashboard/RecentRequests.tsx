"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import Cookies from "js-cookie";
import { apiUrl } from "@/lib/data";

interface RequestData {
  id: string;
  name: string;
  type: string;
  dates: string;
  status: string;
}

export default function RecentRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = Cookies.get("access");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch all three types concurrently
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
              name: l.employee_name || "Unknown",
              type: l.leave_type || "Leave",
              dates: `${l.start_date} to ${l.end_date}`,
              status: l.status || "Pending"
            });
          });
        }

        if (wfhRes.status === "fulfilled" && wfhRes.value.data.results) {
          wfhRes.value.data.results.forEach((w: any) => {
            combined.push({
              id: `wfh-${w.wfh_id}`,
              name: w.employee_name || "Unknown",
              type: "WFH",
              dates: `${w.start_date} to ${w.end_date}`,
              status: w.status || "Pending"
            });
          });
        }

        if (regRes.status === "fulfilled" && regRes.value.data.data) {
          regRes.value.data.data.forEach((r: any) => {
            combined.push({
              id: `reg-${r.token}`,
              name: r.employee_name || "Unknown",
              type: "Regularize",
              dates: r.date || "Unknown Date",
              status: r.status || "Pending"
            });
          });
        }

        setRequests(combined.slice(0, 10)); // take top 10
      } catch (err) {
        console.error("Error fetching recent requests", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleEdit = (id: string) => {
    toast({ title: "Action not available", description: `Please use the main tabs to edit ${id}` });
  };

  const handleDelete = (id: string) => {
    toast({ title: "Action not available", description: `Cannot delete ${id} from here`, variant: "destructive" });
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
              <TableHead className="font-semibold text-gray-600">Employee Name</TableHead>
              <TableHead className="font-semibold text-gray-600">Request Type</TableHead>
              <TableHead className="font-semibold text-gray-600">Dates</TableHead>
              <TableHead className="font-semibold text-gray-600">Status</TableHead>
              <TableHead className="text-right font-semibold text-gray-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Loading live data...</TableCell></TableRow>
            ) : requests.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-gray-500">No pending requests found.</TableCell></TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req.id} className="border-b-gray-50 hover:bg-gray-50/50">
                  <TableCell className="font-medium text-gray-800">{req.name}</TableCell>
                  <TableCell className="text-gray-600">{req.type}</TableCell>
                  <TableCell className="text-gray-600">{req.dates}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                      {req.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-3 text-gray-400">
                      <button onClick={() => handleEdit(req.id)} className="hover:text-blue-600 transition-colors">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(req.id)} className="hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
