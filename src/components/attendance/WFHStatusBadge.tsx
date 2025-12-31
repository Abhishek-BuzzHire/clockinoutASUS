export default function WFHStatusBadge({ status }: { status: string }) {
  const map: any = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700"
  };

  return (
    <span className={`px-3 py-1 rounded text-xs font-semibold ${map[status]}`}>
      {status}
    </span>
  );
}
