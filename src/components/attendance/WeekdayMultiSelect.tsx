const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function WeekdayMultiSelect({
  value,
  onChange
}: {
  value: string[];
  onChange: (days: string[]) => void;
}) {

  const toggle = (day: string) => {
    if (value.includes(day)) {
      onChange(value.filter(d => d !== day));
    } else {
      onChange([...value, day]);
    }
  };

  return (
    <div>
      <label className="text-xs font-semibold">Working Days</label>

      <div className="flex flex-wrap gap-2 mt-2">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => toggle(day)}
            className={`px-3 py-1 rounded border text-sm ${
              value.includes(day)
                ? "bg-blue-600 text-white"
                : "bg-white"
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}
