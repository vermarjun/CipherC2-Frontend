import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function JobsList({ isConnected, backend_url, jobs, setJobs}) {

  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
  setLoading(true);
  try {
    const res = await axios.get(`${backend_url}/jobs`);
    // If response is an error, handle it
    if (res.status !== 200 || res.data.error) {
      console.error("Error response:", res.data);
      setJobs([]);
      return;
    }
    console.log(res.data)
    setJobs(res.data); // assuming it's now always a clean array
  } catch (error) {
    console.error("Fetch error:", error);
    setJobs([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (isConnected) {
      fetchJobs();
    }
  }, [isConnected]);

  return (
    <div className="p-6 bg-neutral-700 rounded-lg shadow-lg overflow-y-scroll">
      <div className="sticky top-0 z-10 flex items-center justify-between mb-4 bg-neutral-700">
        <h2 className="text-2xl font-semibold text-white">Jobs</h2>
        <button
            onClick={fetchJobs}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-1.5 border border-gray-600 rounded text-gray-300 transition ${
                loading ? "cursor-not-allowed opacity-50" : "hover:bg-gray-800"
            }`}
            >
            {loading ? (
                <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Fetching
                </>
            ) : (
                <>
                Refresh
                </>
            )}
            </button>
      </div>

      {loading ? (
        <div className="text-gray-300 p-4 text-center">Fetching Jobs..</div>
      ) : jobs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-700 text-sm text-gray-300">
            <thead className="bg-gray-800 text-gray-200">
              <tr>
                <th className="px-4 py-2 border border-gray-700">ID</th>
                <th className="px-4 py-2 border border-gray-700">Name</th>
                <th className="px-4 py-2 border border-gray-700">Protocol</th>
                <th className="px-4 py-2 border border-gray-700">Port</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className={`hover:bg-gray-800`}>
                    <td className={`px-4 py-2 border border-gray-700`}>
                    <Link
                      key={job.id}
                      to={`/job/${job.id}`}
                    >
                        {job.id}
                    </Link>
                    </td>
                    <td className="px-4 py-2 border border-gray-700">
                      {job.name}
                    </td>
                    <td className="px-4 py-2 border border-gray-700">
                      {job.protocol}
                    </td>
                    <td className="px-4 py-2 border border-gray-700">
                      {job.port}
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-gray-300 p-4 text-center">
          <p>No active jobs at the moment.</p>
          <p className="text-xs text-gray-400 mt-1">They’ll show up here once available.</p>
        </div>
      )}
    </div>
  );
}

export default JobsList;
