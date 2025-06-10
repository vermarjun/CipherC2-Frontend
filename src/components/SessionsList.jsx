import { Link } from "react-router-dom";
import { useDashboard } from '../context/DashboardContext';
import { useState } from 'react';

// Helper function to format date
const formatDate = (timestamp) => {
  try {
    // Convert Unix timestamp (seconds) to milliseconds for JavaScript Date
    const date = new Date(timestamp * 1000);
    if (isNaN(date.getTime())) {
      console.error('Invalid timestamp:', timestamp);
      return 'Invalid Date';
    }
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,  // Use 12-hour format with AM/PM
      // Remove timeZone: 'UTC' to use local timezone
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

// Helper function to format session ID
const formatSessionId = (sessionId) => {
  // Get the part before the first dash
  const parts = sessionId.split('-');
  return parts[0];
};

function SessionsList() {
  const { sessions, isLoading } = useDashboard();
  const [showActive, setShowActive] = useState(true);

  // Filter sessions based on active/dead status
  const filteredSessions = sessions.filter(session => showActive ? !session.isDead : session.isDead);

  return (
    <div className="w-full">
      {/* Toggle buttons */}
      <div className="flex items-center space-x-4 mb-4">
        <h2 className="text-xl font-semibold text-white">
          {showActive ? 'Active Sessions' : 'Dead Sessions'}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowActive(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showActive 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-300'
            }`}
          >
            Active Sessions
          </button>
          <button
            onClick={() => setShowActive(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !showActive 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-300'
            }`}
          >
            Dead Sessions
          </button>
        </div>
      </div>

      {isLoading.sessions ? (
        <div className="text-neutral-400 p-4 text-center">Fetching sessions…</div>
      ) : filteredSessions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border border-neutral-800 text-sm text-neutral-300">
            <thead className="bg-neutral-800 text-neutral-200">
              <tr>
                <th className="px-4 py-2 border border-neutral-800">ID</th>
                <th className="px-4 py-2 border border-neutral-800">User Name</th>
                <th className="px-4 py-2 border border-neutral-800">Transport</th>
                <th className="px-4 py-2 border border-neutral-800">First Contact</th>
                <th className="px-4 py-2 border border-neutral-800">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((session) => (
                <tr key={session.id} className="hover:bg-neutral-800">
                  <td className={`px-4 py-2 border border-neutral-800 ${session.isDead ? "text-red-500" : "text-emerald-500"}`}>
                    <Link to={`/session/${session.id}`} className="hover:text-blue-400">
                      {formatSessionId(session.id)}
                    </Link>
                  </td>
                  <td className="px-4 py-2 border border-neutral-800 text-neutral-300">
                    {session.username}
                  </td>
                  <td className="px-4 py-2 border border-neutral-800 text-neutral-300">
                    {session.transport}
                  </td>
                  <td className="px-4 py-2 border border-neutral-800 text-neutral-300">
                    {formatDate(session.firstContact)}
                  </td>
                  <td className="px-4 py-2 border border-neutral-800 text-neutral-300">
                    {formatDate(session.lastCheckIn)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-neutral-300 p-4 text-center">
          <p>No {showActive ? 'active' : 'dead'} sessions at the moment.</p>
          <p className="text-xs text-neutral-400 mt-1">
            {showActive 
              ? "They'll show up here once available."
              : "No terminated sessions to display."}
          </p>
        </div>
      )}
    </div>
  );
}

export default SessionsList;
