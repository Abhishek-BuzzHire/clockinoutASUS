import { useState } from "react";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";

export default function OverrideFormModal({
  onClose,
  onSubmit
}: {
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {

  const [date, setDate] = useState("");
  const [type, setType] = useState("CANCELLED");
  const [reason, setReason] = useState("");

  const submit = () => {
    onSubmit({
      date,
      override_type: type,
      reason
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden">

        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="font-bold text-lg">Add Holiday Override</h2>

          <button onClick={onClose} className="text-slate-400 hover:text-red-500">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">

          <div>
            <label className="text-xs font-semibold">Date</label>
            <div className="mt-1">
              <CustomDatePicker
                value={date}
                onChange={val => setDate(val)}
                placeholder="Select override date"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold">Override Type</label>
            <select
              className="w-full border rounded p-2"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option value="CANCELLED">Holiday Cancelled</option>
              <option value="WORKING_DAY">Converted to Working Day</option>
              <option value="COMP_OFF">Complementary Off</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold">Reason</label>
            <textarea
              className="w-full border rounded p-2"
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Enter reason for override"
            />
          </div>

        </div>

        <div className="flex justify-end gap-3 border-t p-4">
          <button onClick={onClose} className="px-5 py-2 bg-gray-200 rounded">
            Cancel
          </button>

          <button
            className="px-5 py-2 bg-blue-600 text-white rounded"
            onClick={submit}
            disabled={!date || !reason}
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}
