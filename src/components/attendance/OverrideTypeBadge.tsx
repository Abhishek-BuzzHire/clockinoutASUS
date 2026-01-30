export default function OverrideTypeBadge({ type }: { type: string }) {
  const map: any = {
    CANCELLED: "bg-red-100 text-red-700",
    WORKING_DAY: "bg-blue-100 text-blue-700",
    COMP_OFF: "bg-green-100 text-green-700"
  };

  return (
    <span className={`px-3 py-1 rounded text-xs font-semibold ${map[type]}`}>
      {type}
    </span>
  );
}
