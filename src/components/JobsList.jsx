import { Link } from "react-router-dom";
import { useDashboard } from '../context/DashboardContext';

function JobsList() {
  const { jobs, isLoading, refreshJobs } = useDashboard();

  return (
    <div className="w-full bg-neutral-900 rounded-lg overflow-hidden">
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-neutral-900 border-b border-neutral-800">
        <h2 className="text-2xl font-semibold text-neutral-100">Jobs</h2>
        <button
          onClick={refreshJobs}
          disabled={isLoading.jobs}
          className={`flex items-center gap-2 px-3 py-1.5 border border-neutral-700 rounded text-neutral-300 transition ${
            isLoading.jobs ? "cursor-not-allowed opacity-50" : "hover:bg-neutral-800"
          }`}
        >
          {isLoading.jobs ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-neutral-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Fetching
            </>
          ) : (
            <>Refresh</>
          )}
        </button>
      </div>

      {isLoading.jobs ? (
        <div className="text-neutral-400 p-4 text-center">Fetching Jobs..</div>
      ) : jobs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border border-neutral-800 text-sm text-neutral-300">
            <thead className="bg-neutral-800 text-neutral-200">
              <tr>
                <th className="px-4 py-2 border border-neutral-800">ID</th>
                <th className="px-4 py-2 border border-neutral-800">Name</th>
                <th className="px-4 py-2 border border-neutral-800">Protocol</th>
                <th className="px-4 py-2 border border-neutral-800">Port</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-neutral-800">
                  <td className="px-4 py-2 border border-neutral-800">
                    <Link to={`/job/${job.id}`} className="text-neutral-300 hover:text-blue-400">
                      {job.id}
                    </Link>
                  </td>
                  <td className="px-4 py-2 border border-neutral-800 text-neutral-300">
                    {job.name}
                  </td>
                  <td className="px-4 py-2 border border-neutral-800 text-neutral-300">
                    {job.protocol}
                  </td>
                  <td className="px-4 py-2 border border-neutral-800 text-neutral-300">
                    {job.port}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-neutral-300 p-4 text-center">
          <p>No active jobs at the moment.</p>
          <p className="text-xs text-neutral-400 mt-1">They'll show up here once available.</p>
        </div>
      )}
    </div>
  );
}

export default JobsList;
