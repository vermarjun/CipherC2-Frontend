import { Link } from "react-router-dom";
import { useDashboard } from '../context/DashboardContext';
import { useState, useMemo } from 'react';

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

function VictimsList() {
  const { sessions, isLoading } = useDashboard();
  const [showOnline, setShowOnline] = useState(true);

  // Process sessions to get unique devices
  const devices = useMemo(() => {
    const deviceMap = new Map();

    sessions.forEach(session => {
      // Use device_id if available, otherwise use hostname as fallback
      const deviceId = session.device_id || session.hostname;
      
      if (!deviceMap.has(deviceId)) {
        // Create new device entry
        deviceMap.set(deviceId, {
          id: deviceId,
          hostname: session.hostname,
          username: session.username,
          os: session.os,
          arch: session.arch,
          version: session.version,
          remoteAddress: session.remote_address,
          firstContact: session.firstContact,
          lastCheckIn: session.lastCheckIn,
          isOnline: !session.isDead,
          sessionCount: 1,
          activeSessions: session.isDead ? 0 : 1,
          deadSessions: session.isDead ? 1 : 0,
          sessions: [session]
        });
      } else {
        // Update existing device entry
        const device = deviceMap.get(deviceId);
        device.sessionCount += 1;
        if (session.isDead) {
          device.deadSessions += 1;
        } else {
          device.activeSessions += 1;
        }
        device.sessions.push(session);
        
        // Update last check-in if this session is more recent
        if (session.lastCheckIn > device.lastCheckIn) {
          device.lastCheckIn = session.lastCheckIn;
        }
        
        // Update first contact if this session is older
        if (session.firstContact < device.firstContact) {
          device.firstContact = session.firstContact;
        }
        
        // Update online status - device is online if any session is active
        device.isOnline = device.isOnline || !session.isDead;
      }
    });

    return Array.from(deviceMap.values());
  }, [sessions]);

  // Filter devices based on online/offline status
  const filteredDevices = devices.filter(device => showOnline ? device.isOnline : !device.isOnline);

  return (
    <div className="w-full">
      {/* Toggle buttons */}
      <div className="flex items-center space-x-4 mb-4">
        <h2 className="text-xl font-semibold text-white">
          {showOnline ? 'Online Devices' : 'Offline Devices'}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowOnline(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showOnline 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-300'
            }`}
          >
            Online Devices
          </button>
          <button
            onClick={() => setShowOnline(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !showOnline 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-300'
            }`}
          >
            Offline Devices
          </button>
        </div>
      </div>

      {isLoading.sessions ? (
        <div className="text-neutral-400 p-4 text-center">Fetching devices…</div>
      ) : filteredDevices.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border border-neutral-800 text-sm text-neutral-300">
            <thead className="bg-neutral-800 text-neutral-200">
              <tr>
                <th className="px-4 py-2 border border-neutral-800">Device ID</th>
                <th className="px-4 py-2 border border-neutral-800">Hostname</th>
                <th className="px-4 py-2 border border-neutral-800">Username</th>
                <th className="px-4 py-2 border border-neutral-800">OS</th>
                <th className="px-4 py-2 border border-neutral-800">Sessions</th>
                <th className="px-4 py-2 border border-neutral-800">First Contact</th>
                <th className="px-4 py-2 border border-neutral-800">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((device) => (
                <tr key={device.id} className="hover:bg-neutral-800">
                  <td className={`px-4 py-2 border border-neutral-800 ${device.isOnline ? "text-emerald-500" : "text-red-500"}`}>
                    <Link to={`/device/${device.id}`} className="hover:text-blue-400">
                      {device.id}
                    </Link>
                  </td>
                  <td className="px-4 py-2 border border-neutral-800 text-neutral-300">
                    {device.hostname}
                  </td>
                  <td className="px-4 py-2 border border-neutral-800 text-neutral-300">
                    {device.username}
                  </td>
                  <td className="px-4 py-2 border border-neutral-800 text-neutral-300">
                    {device.os} {device.arch}
                  </td>
                  <td className="px-4 py-2 border border-neutral-800 text-neutral-300">
                    <span className="flex items-center space-x-2">
                      <span className="text-emerald-400">{device.activeSessions}</span>
                      <span className="text-neutral-500">/</span>
                      <span className="text-red-400">{device.deadSessions}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2 border border-neutral-800 text-neutral-300">
                    {formatDate(device.firstContact)}
                  </td>
                  <td className="px-4 py-2 border border-neutral-800 text-neutral-300">
                    {formatDate(device.lastCheckIn)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-neutral-300 p-4 text-center">
          <p>No {showOnline ? 'online' : 'offline'} devices at the moment.</p>
          <p className="text-xs text-neutral-400 mt-1">
            {showOnline 
              ? "They'll show up here once available."
              : "No offline devices to display."}
          </p>
        </div>
      )}
    </div>
  );
}

export default VictimsList; 