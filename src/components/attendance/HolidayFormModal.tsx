import { useState } from "react";

export default function HolidayFormModal({
  holiday,
  onClose,
  onSubmit
}: {
  holiday: any | null;
  onClose: () => void;
  onSubmit: (data: any, id?: number) => void;
}) {

  const [name, setName] = useState(holiday?.name || "");
  const [date, setDate] = useState(holiday?.date || "");
  const [type, setType] = useState(holiday?.holiday_type || "FIXED");
  const [active, setActive] = useState(
    holiday?.is_active ?? true
  );

  const submit = () => {
    onSubmit(
      {
        name,
        date,
        holiday_type: type,
        is_active: active
      },
      holiday?.id
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden">

        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="font-bold text-lg">
            {holiday ? "Edit Holiday" : "Create Holiday"}
          </h2>

          <button onClick={onClose} className="text-slate-400 hover:text-red-500">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">

          <div>
            <label className="text-xs font-semibold">Holiday Name</label>
            <input
              className="w-full border rounded p-2"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold">Date</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold">Holiday Type</label>
            <select
              className="w-full border rounded p-2"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option value="FIXED">Fixed Holiday</option>
              <option value="COMP_OFF">Complementary Off</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={active}
              onChange={e => setActive(e.target.checked)}
            />
            <label className="text-sm">Active</label>
          </div>

        </div>

        <div className="flex justify-end gap-3 border-t p-4">
          <button onClick={onClose} className="px-5 py-2 bg-gray-200 rounded">
            Cancel
          </button>

          <button
            className="px-5 py-2 bg-blue-600 text-white rounded"
            onClick={submit}
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}
