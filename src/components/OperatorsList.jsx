import { useDashboard } from '../context/DashboardContext';

function OperatorsList() {
  const { operators, isLoading } = useDashboard();

  return (
    <div className="w-full">
      {isLoading.operators ? (
        <div className="text-neutral-400 p-4 text-center">Fetching operators…</div>
      ) : operators.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border border-neutral-800 text-sm text-neutral-300">
            <thead className="bg-neutral-800 text-neutral-200">
              <tr>
                <th className="px-4 py-2 border border-neutral-800">ID</th>
                <th className="px-4 py-2 border border-neutral-800">Name</th>
              </tr>
            </thead>
            <tbody>
              {operators.map((op) => (
                <tr key={op.id} className="hover:bg-neutral-800">
                  <td className="px-4 py-2 border border-neutral-800 text-neutral-300">{op.id}</td>
                  <td className={`px-4 py-2 border border-neutral-800 ${op.isOnline ? "text-emerald-500" : "text-red-500"}`}>
                    {op.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-neutral-300 p-4 text-center">
          <p>No operators available at the moment.</p>
          <p className="text-xs text-neutral-400 mt-1">They'll appear here once available.</p>
        </div>
      )}
    </div>
  );
}

export default OperatorsList;
