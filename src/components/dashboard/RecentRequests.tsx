"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

type RequestType = "Sick Leave" | "Casual Leave" | "WFH" | "Regularize";

interface RequestData {
  id: string;
  name: string;
  type: RequestType;
  dates: string;
  status: "Pending" | "Approved" | "Rejected";
}

const MOCK_REQUESTS: RequestData[] = [
  { id: "1", name: "John Doe", type: "Sick Leave", dates: "June 6", status: "Pending" },
  { id: "2", name: "Shivam Yadav", type: "Sick Leave", dates: "June 6", status: "Pending" },
  { id: "3", name: "Neha Sharma", type: "WFH", dates: "June 7 - June 8", status: "Pending" },
  { id: "4", name: "Ankur Singh", type: "Regularize", dates: "June 5", status: "Pending" },
];

export default function RecentRequests() {
  const { toast } = useToast();

  const handleEdit = (id: string) => {
    toast({ title: "Edit action triggered", description: `Editing request ${id}` });
  };

  const handleDelete = (id: string) => {
    toast({ title: "Delete action triggered", description: `Deleting request ${id}`, variant: "destructive" });
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
            {MOCK_REQUESTS.map((req) => (
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
