"use client";

import { AdminAttendancePivotReport } from "@/app/(dashboard)/list/createNew/companyWork/page";
import { X } from "lucide-react";

interface AdminAttendancePivotReportModalProps {
  onClose: () => void;
}

export default function AdminAttendancePivotReportModal({ onClose }: AdminAttendancePivotReportModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-[98vw] max-w-[98vw] h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">Attendance Report (All Employees)</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors bg-gray-100 hover:bg-gray-200 p-2 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 flex-1 overflow-hidden flex flex-col">
          <AdminAttendancePivotReport />
        </div>
      </div>
    </div>
  );
}