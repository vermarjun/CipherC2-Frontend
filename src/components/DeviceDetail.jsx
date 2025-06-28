import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDashboard } from '../context/DashboardContext';
import {
  ArrowLeft,
  Monitor,
  User,
  Cpu,
  HardDrive,
  Shield,
  Globe,
  Clock,
  Database,
  Terminal,
  RefreshCw,
  Wifi,
  Server,
  Activity
} from 'lucide-react';

// Helper function to format date
const formatDate = (timestamp) => {
  try {
    const date = new Date(timestamp * 1000);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

// Helper function to format session ID
const formatSessionId = (sessionId) => {
  const parts = sessionId.split('-');
  return parts[0];
};

function DeviceDetail() {
  const { deviceId } = useParams();
  const { sessions, isLoading } = useDashboard();
  const navigate = useNavigate();

  // Process sessions to get device data
  const deviceData = useMemo(() => {
    const deviceSessions = sessions.filter(session => 
      (session.device_id || session.hostname) === deviceId
    );

    if (deviceSessions.length === 0) return null;

    // Get device info from the first session
    const firstSession = deviceSessions[0];
    const device = {
      id: deviceId,
      hostname: firstSession.hostname,
      username: firstSession.username,
      os: firstSession.os,
      arch: firstSession.arch,
      version: firstSession.version,
      remoteAddress: firstSession.remote_address,
      transport: firstSession.transport,
      firstContact: Math.min(...deviceSessions.map(s => s.firstContact)),
      lastCheckIn: Math.max(...deviceSessions.map(s => s.lastCheckIn)),
      isOnline: deviceSessions.some(s => !s.isDead),
      totalSessions: deviceSessions.length,
      activeSessions: deviceSessions.filter(s => !s.isDead),
      deadSessions: deviceSessions.filter(s => s.isDead)
    };

    return device;
  }, [sessions, deviceId]);

  if (isLoading.sessions) {
    return (
      <div className="min-h-screen bg-neutral-950 text-gray-100">
        <div className="flex items-center justify-center h-screen">
          <div className="text-neutral-400">Loading device information...</div>
        </div>
      </div>
    );
  }

  if (!deviceData) {
    return (
      <div className="min-h-screen bg-neutral-950 text-gray-100">
        <div className="flex items-center justify-center h-screen">
          <div className="text-neutral-400">Device not found</div>
        </div>
      </div>
    );
  }

  const getStatusColor = (isOnline) => {
    return isOnline
      ? "text-green-400 bg-green-800/30"
      : "text-red-400 bg-red-800/30";
  };

  const cardData = [
    {
      icon: <Globe />,
      label: "Status",
      value: deviceData.isOnline ? "Online" : "Offline",
      className: `px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(deviceData.isOnline)}`,
    },
    { icon: <Monitor />, label: "Hostname", value: deviceData.hostname },
    { icon: <User />, label: "Username", value: deviceData.username },
    {
      icon: <Cpu />,
      label: "OS",
      value: `${deviceData.os} ${deviceData.arch}`,
    },
    {
      icon: <Globe />,
      label: "Remote Address",
      value: deviceData.remoteAddress,
    },
    { icon: <Shield />, label: "Transport", value: deviceData.transport },
    { icon: <Monitor />, label: "Version", value: deviceData.version },
    {
      icon: <Clock />,
      label: "First Contact",
      value: formatDate(deviceData.firstContact),
    },
    {
      icon: <Clock />,
      label: "Last Active",
      value: formatDate(deviceData.lastCheckIn),
    },
    { icon: <Database />, label: "Total Sessions", value: deviceData.totalSessions },
    { icon: <Activity />, label: "Active Sessions", value: deviceData.activeSessions.length },
    { icon: <Server />, label: "Dead Sessions", value: deviceData.deadSessions.length },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100">
      {/* Header */}
      <div className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/victims')}
                className="flex items-center space-x-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <div className="h-8 w-px bg-neutral-700"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-100">{deviceData.hostname}</h1>
                <p className="text-sm text-gray-400">Device ID: {deviceId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 bg-neutral-800 rounded-lg">
                <div className={`w-2 h-2 ${deviceData.isOnline ? "bg-green-500" : "bg-red-500"} rounded-full animate-pulse`}></div>
                <span className="text-sm text-gray-300">{deviceData.isOnline ? "Online" : "Offline"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-100 mb-2">
            Device Information
          </h2>
          <p className="text-gray-400">
            Comprehensive overview of the target device and its session history
          </p>
        </div>

        {/* Device Info Cards */}
        <div className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {cardData.map((item, index) => (
              <div
                key={index}
                className="bg-neutral-900 rounded-xl shadow-md border border-neutral-800 p-3 hover:shadow-lg hover:border-blue-600 transition-all duration-200 cursor-pointer group min-w-0"
              >
                <div className="flex items-center space-x-2">
                  <div className="text-neutral-400 group-hover:text-blue-400 transition-colors duration-200 flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-neutral-400 mb-0.5 truncate">
                      {item.label}
                    </p>
                    <p
                      className={`text-[12px] font-semibold truncate ${
                        item.className || "text-white"
                      }`}
                      title={item.value}
                    >
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sessions Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Sessions */}
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Active Sessions</h3>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                {deviceData.activeSessions.length}
              </span>
            </div>
            
            {deviceData.activeSessions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border border-neutral-800 text-sm text-neutral-300">
                  <thead className="bg-neutral-800 text-neutral-200">
                    <tr>
                      <th className="px-3 py-2 border border-neutral-800">ID</th>
                      <th className="px-3 py-2 border border-neutral-800">Transport</th>
                      <th className="px-3 py-2 border border-neutral-800">Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deviceData.activeSessions.map((session) => (
                      <tr key={session.id} className="hover:bg-neutral-800">
                        <td className="px-3 py-2 border border-neutral-800 text-emerald-500">
                          <Link to={`/session/${session.id}`} className="hover:text-blue-400">
                            {formatSessionId(session.id)}
                          </Link>
                        </td>
                        <td className="px-3 py-2 border border-neutral-800 text-neutral-300">
                          {session.transport}
                        </td>
                        <td className="px-3 py-2 border border-neutral-800 text-neutral-300">
                          {formatDate(session.lastCheckIn)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-neutral-400 p-4 text-center">
                No active sessions for this device.
              </div>
            )}
          </div>

          {/* Past Sessions */}
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
            <div className="flex items-center space-x-2 mb-4">
              <Server className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-semibold text-white">Past Sessions</h3>
              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                {deviceData.deadSessions.length}
              </span>
            </div>
            
            {deviceData.deadSessions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border border-neutral-800 text-sm text-neutral-300">
                  <thead className="bg-neutral-800 text-neutral-200">
                    <tr>
                      <th className="px-3 py-2 border border-neutral-800">ID</th>
                      <th className="px-3 py-2 border border-neutral-800">Transport</th>
                      <th className="px-3 py-2 border border-neutral-800">Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deviceData.deadSessions.map((session) => (
                      <tr key={session.id} className="hover:bg-neutral-800">
                        <td className="px-3 py-2 border border-neutral-800 text-red-500">
                          <Link to={`/session/${session.id}`} className="hover:text-blue-400">
                            {formatSessionId(session.id)}
                          </Link>
                        </td>
                        <td className="px-3 py-2 border border-neutral-800 text-neutral-300">
                          {session.transport}
                        </td>
                        <td className="px-3 py-2 border border-neutral-800 text-neutral-300">
                          {formatDate(session.lastCheckIn)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-neutral-400 p-4 text-center">
                No past sessions for this device.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeviceDetail; 