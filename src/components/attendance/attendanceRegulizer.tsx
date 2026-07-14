import { useState } from "react";
import { X, Calendar, Clock, FileEdit } from "lucide-react";

interface Props {
  onClose: () => void;
  onSubmit: (payload: {
    date: string;
    type: string;
    time: string;
    reason: string;
  }) => void;
  loading: boolean;
  message: { type: "success" | "error"; text: string } | null;
}

export default function AttendanceRegularizationPopup({
  onClose,
  onSubmit,
  loading,
  message
}: Props) {

  const [date, setDate] = useState("");
  const [type, setType] = useState<"PUNCH_IN" | "PUNCH_OUT" | "">("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const [reason, setReason] = useState("");

  const convertTo24Hour = (h: string, m: string, p: string) => {
    if (!h || !m || !p) return "";
    let hr = parseInt(h);
    if (p === "PM" && hr < 12) hr += 12;
    if (p === "AM" && hr === 12) hr = 0;
    return `${String(hr).padStart(2, "0")}:${m}`;
  };

  const handleSubmit = () => {
    const formattedTime = convertTo24Hour(hour, minute, period);
    if (!date || !type || !formattedTime || !reason) return;
    onSubmit({ date, type, time: formattedTime, reason });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex gap-2 items-center text-slate-800">
              <FileEdit className="w-5 h-5 text-blue-600" />
              Attendance Regularization
            </h2>
            <p className="text-sm text-slate-500">
              Submit correction request for Punch In / Punch Out
            </p>
          </div>

          <button onClick={onClose} className="p-2 rounded-full hover:bg-red-200 text-slate-400 hover:text-red-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6 bg-slate-50">

          {message && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-slate-600 flex gap-1 items-center">
                <Calendar className="w-4 h-4" /> Date
              </label>
              <input
                type="date"
                value={date}
                max={new Date().toISOString().split("T")[0]}
                onChange={e => setDate(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm bg-white"
              />
            </div>

            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-slate-600">
                Correction Type
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="border rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="">Select Type</option>
                <option value="PUNCH_IN">Punch In</option>
                <option value="PUNCH_OUT">Punch Out</option>
              </select>
            </div>

            {/* Time */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase text-slate-600 flex gap-1 items-center">
                <Clock className="w-4 h-4 text-blue-600" /> Select Correction Time
              </label>
              <div className="flex items-center gap-3 bg-slate-100/60 border border-slate-200 rounded-xl p-3.5">
                {/* Hour Select */}
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Hour</span>
                  <select
                    value={hour}
                    onChange={e => setHour(e.target.value)}
                    className="w-full text-center font-bold text-lg text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">--</option>
                    {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <span className="text-2xl font-bold text-slate-400 mt-4">:</span>

                {/* Minute Select */}
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Minute</span>
                  <select
                    value={minute}
                    onChange={e => setMinute(e.target.value)}
                    className="w-full text-center font-bold text-lg text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">--</option>
                    {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* AM/PM toggle */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">AM/PM</span>
                  <div className="flex bg-white rounded-lg p-0.5 border border-slate-200 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setPeriod("AM")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                        period === "AM" 
                          ? "bg-blue-600 text-white shadow-sm" 
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setPeriod("PM")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                        period === "PM" 
                          ? "bg-blue-600 text-white shadow-sm" 
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Reason */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-slate-600">Reason</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={4}
              className="border rounded-lg px-3 py-2 text-sm bg-white"
              placeholder="Explain why this correction is required..."
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center px-6 py-4 border-t bg-white text-sm">
          <span className="text-slate-400">© 2025 BuzzHire Attendance System</span>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-semibold shadow"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>

      </div>
    </div>
  );
}
