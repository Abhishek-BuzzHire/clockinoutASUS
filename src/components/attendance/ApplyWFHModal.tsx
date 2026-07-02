import { useState, useEffect } from "react";
import { X, Calendar, Send, Home, Info, Laptop, AlertCircle } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";

export default function ApplyWFHModal({
  onClose,
  onSubmit
}: {
  onClose: () => void;
  onSubmit: (date: string) => void;
}) {
  const [date, setDate] = useState("");
  const [allowedPastDates, setAllowedPastDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateType, setDateType] = useState<"future" | "past">("future");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchAllowedPastDates = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("access");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${apiUrl}/api/employee/allowed-past-dates/`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" }
        });
        if (res.data && res.data.dates) {
          setAllowedPastDates(res.data.dates);
        }
      } catch (err) {
        console.error("Failed to fetch allowed past dates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllowedPastDates();
  }, []);

  const handleDateTypeChange = (type: "future" | "past") => {
    setDateType(type);
    setDate(""); // reset date selection on toggle
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 tracking-tight">Request WFH</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Remote Work Log</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">

          {/* DATE TYPE SELECTION TABS */}
          {allowedPastDates.length > 0 && (
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => handleDateTypeChange("future")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  dateType === "future"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Today or Future WFH
              </button>
              <button
                type="button"
                onClick={() => handleDateTypeChange("past")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  dateType === "past"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Allowed Past WFH
              </button>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <Calendar className="w-3.5 h-3.5" /> Proposed Date
            </label>
            <div className="mt-1">
              {dateType === "future" ? (
                <CustomDatePicker
                  value={date}
                  minDate={today}
                  onChange={val => setDate(val)}
                  placeholder="Select future WFH date"
                />
              ) : (
                <select
                  className="w-full border border-slate-200 bg-slate-50/30 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none cursor-pointer"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                >
                  <option value="">Select an allowed past date...</option>
                  {allowedPastDates.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* HELPER INFO */}
          <div className="flex gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-indigo-800 uppercase tracking-tight">Policy Notice</p>
              <p className="text-xs text-indigo-600 leading-relaxed font-medium">
                Remote work requests are subject to team capacity and manager approval. Please ensure your tasks are documented.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center gap-3 border-t border-slate-100 p-6 bg-slate-50/30">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-2.5 border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition-all active:scale-[0.98]"
          >
            Cancel
          </button>

          <button
            className="flex-[2] flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
            onClick={() => onSubmit(date)}
            disabled={!date || loading}
          >
            <Send className="w-4 h-4" />
            {loading ? "Loading..." : "Submit Request"}
          </button>
        </div>

      </div>
    </div>
  );
}