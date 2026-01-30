import HolidayStatusBadge from "./HolidayStatusBadge";

export default function HolidayTable({
  loading,
  holidays,
  onEdit,
  onDelete
}: {
  loading: boolean;
  holidays: any[];
  onEdit: (holiday: any) => void;
  onDelete: (id: number) => void;
}) {
  if (loading)
    return <div className="p-10 text-center">Loading...</div>;

  if (!holidays.length)
    return <div className="p-10 text-center text-slate-400">No holidays created</div>;

  return (
    <div className="bg-white rounded-xl border shadow overflow-hidden">

      <table className="w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th>Date</th>
            <th>Type</th>
            <th>Status</th>
            <th>Created By</th>
            <th className="text-right pr-4">Action</th>
          </tr>
        </thead>

        <tbody>
          {holidays?.map(h => (
            <tr key={h.id} className="border-t">
              <td className="p-3 font-medium">{h.name}</td>
              <td>{h.date}</td>
              <td>{h.holiday_type}</td>
              <td>
                <HolidayStatusBadge active={h.is_active} />
              </td>
              <td>{h.created_by_name || "-"}</td>
              <td className="text-right pr-4 space-x-2">
                <button
                  onClick={() => onEdit(h)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  Edit
                </button>

                <button
                  onClick={() => onDelete(h.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}
