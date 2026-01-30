import OverrideTypeBadge from "./OverrideTypeBadge";

export default function OverrideTable({
  loading,
  overrides,
  onDelete
}: {
  loading: boolean;
  overrides: any[];
  onDelete: (id: number) => void;
}) {
  if (loading)
    return <div className="p-10 text-center">Loading...</div>;

  if (!overrides.length)
    return <div className="p-10 text-center text-slate-400">No overrides created</div>;

  return (
    <div className="bg-white rounded-xl border shadow overflow-hidden">

      <table className="w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-3 text-left">Date</th>
            <th>Override Type</th>
            <th>Reason</th>
            <th>Created By</th>
            <th>Created At</th>
            <th className="text-right pr-4">Action</th>
          </tr>
        </thead>

        <tbody>
          {overrides.map(o => (
            <tr key={o.id} className="border-t">
              <td className="p-3">{o.date}</td>

              <td>
                <OverrideTypeBadge type={o.override_type} />
              </td>

              <td>{o.reason}</td>

              <td>{o.created_by_name || "-"}</td>

              <td>{o.created_at}</td>

              <td className="text-right pr-4">
                <button
                  onClick={() => onDelete(o.id)}
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
