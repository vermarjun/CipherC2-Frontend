import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function SessionsList({ isConnected, backend_url}) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = async () => {
  setLoading(true);
  try {
    const res = await axios.get(`${backend_url}/sessions`);
    // If response is an error, handle it
    if (res.status !== 200 || res.data.error) {
      console.error("Error response:", res.data);
      setSessions([]);
      return;
    }

    setSessions(res.data); // assuming it's now always a clean array
  } catch (error) {
    console.error("Fetch error:", error);
    setSessions([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (isConnected) {
      fetchSessions();
    }
  }, [isConnected]);

  return (
    <div className="p-6 bg-neutral-700 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-white">Active Sessions</h2>
        <button
            onClick={fetchSessions}
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
        <div className="text-gray-300 p-4 text-center">Fetching sessions…</div>
      ) : sessions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-700 text-sm text-gray-300">
            <thead className="bg-gray-800 text-gray-200">
              <tr>
                <th className="px-4 py-2 border border-gray-700">ID</th>
                <th className="px-4 py-2 border border-gray-700">User Name</th>
                <th className="px-4 py-2 border border-gray-700">Host Name</th>
                <th className="px-4 py-2 border border-gray-700">OS</th>
                <th className="px-4 py-2 border border-gray-700">Transport</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-800">
                    <td className="px-4 py-2 border border-gray-700">
                    <Link
                      key={session.id}
                      to={`/session/${session.id}`}
                    >
                        {session.id}
                    </Link>
                    </td>
                    <td className="px-4 py-2 border border-gray-700">
                      {session.username}
                    </td>
                    <td className="px-4 py-2 border border-gray-700">
                      {session.hostname}
                    </td>
                    <td className="px-4 py-2 border border-gray-700">
                      {session.os}
                    </td>
                    <td className="px-4 py-2 border border-gray-700">
                      {session.transport}
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-gray-300 p-4 text-center">
          <p>No active sessions at the moment.</p>
          <p className="text-xs text-gray-400 mt-1">They’ll show up here once available.</p>
        </div>
      )}
    </div>
  );
}

export default SessionsList;
