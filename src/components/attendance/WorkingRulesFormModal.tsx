import { useState } from "react";
import WeekdayMultiSelect from "./WeekdayMultiSelect";

export default function WorkingRulesFormModal({
  rule,
  onClose,
  onSubmit
}: {
  rule: any | null;
  onClose: () => void;
  onSubmit: (data: any, id?: number) => void;
}) {

  const [company, setCompany] = useState(rule?.company_name || "");
  const [days, setDays] = useState<string[]>(rule?.working_days || []);
  const [daily, setDaily] = useState(rule?.daily_work_hours || "");
  const [weekly, setWeekly] = useState(rule?.weekly_work_hours || "");
  const [monthly, setMonthly] = useState(rule?.monthly_work_hours || "");

  const submit = () => {
    onSubmit(
      {
        company_name: company,
        working_days: days,
        daily_work_hours: daily,
        weekly_work_hours: weekly,
        monthly_work_hours: monthly
      },
      rule?.id
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">

        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="font-bold text-lg">
            {rule ? "Edit Working Rule" : "Create Working Rule"}
          </h2>

          <button onClick={onClose} className="text-slate-400 hover:text-red-500">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">

          <div>
            <label className="text-xs font-semibold">Company Name</label>
            <input
              className="w-full border rounded p-2"
              value={company}
              onChange={e => setCompany(e.target.value)}
            />
          </div>

          <WeekdayMultiSelect value={days} onChange={setDays} />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold">Daily Hours</label>
              <input
                type="number"
                step="0.01"
                className="w-full border rounded p-2"
                value={daily}
                onChange={e => setDaily(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold">Weekly Hours</label>
              <input
                type="number"
                step="0.01"
                className="w-full border rounded p-2"
                value={weekly}
                onChange={e => setWeekly(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold">Monthly Hours</label>
              <input
                type="number"
                step="0.01"
                className="w-full border rounded p-2"
                value={monthly}
                onChange={e => setMonthly(e.target.value)}
              />
            </div>
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
