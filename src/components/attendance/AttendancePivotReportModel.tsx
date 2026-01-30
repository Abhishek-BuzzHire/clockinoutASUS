"use client";

import { AdminAttendancePivotReport } from "@/app/(dashboard)/list/createNew/companyWork/page";
import { X } from "lucide-react";

interface AdminAttendancePivotReportModalProps {
  onClose: () => void;
}

export default function AdminAttendancePivotReportModal({ onClose }: AdminAttendancePivotReportModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Attendance Report</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <AdminAttendancePivotReport />
        </div>
      </div>
    </div>
  );
}