export default function WorkingRulesTable({
  loading,
  rules,
  onEdit
}: {
  loading: boolean;
  rules: any[];
  onEdit: (rule: any) => void;
}) {
  if (loading)
    return <div className="p-10 text-center">Loading...</div>;

  if (!rules.length)
    return <div className="p-10 text-center text-slate-400">No rules created yet</div>;

  return (
    <div className="bg-white rounded-xl border shadow overflow-hidden">

      <table className="w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-3 text-left">Company</th>
            <th>Working Days</th>
            <th>Daily Hours</th>
            <th>Weekly Hours</th>
            <th>Monthly Hours</th>
            <th className="text-right pr-4">Action</th>
          </tr>
        </thead>

        <tbody>
          {rules?.map(rule => (
            <tr key={rule.id} className="border-t">
              <td className="p-3 font-medium">{rule.company_name}</td>
              <td>{rule.working_days.join(", ")}</td>
              <td>{rule.daily_work_hours}</td>
              <td>{rule.weekly_work_hours}</td>
              <td>{rule.monthly_work_hours}</td>
              <td className="text-right pr-4">
                <button
                  onClick={() => onEdit(rule)}
                  className="px-4 py-2 rounded bg-blue-600 text-white text-sm"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}