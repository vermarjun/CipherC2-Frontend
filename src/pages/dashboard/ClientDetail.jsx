import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import {
  ArrowLeft,
  User,
  Clock,
  Globe,
  Shield,
  Activity,
  FileText,
  AlertTriangle,
  Database,
  Network,
  Settings,
  Eye,
  ShieldAlert,
  Terminal,
  Key,
  Lock,
  Unlock,
  MapPin,
  Calendar,
  Globe as GlobeIcon,
  Monitor,
  Smartphone,
  Fingerprint,
  History,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart2,
  PieChart,
  LineChart,
  Activity as ActivityIcon,
} from 'lucide-react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function ClientDetail() {
  const { clientId } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.is_admin) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  async function fetchClientData() {
    try {
      setError(null);
      setIsLoading(true);
      const response = await api.get(`/users/${clientId}`);
      console.log('Client data:', response.data);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching client:', error.response?.data || error.message);
      setError(error.response?.data?.detail || 'Failed to fetch client data');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  if (!user?.is_admin) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-800 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-neutral-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-neutral-950 text-gray-100 p-6">
        <div className="text-red-400">No data available</div>
      </div>
    );
  }

  // Calculate some statistics
  const totalActiveHours = Object.values(data.metadata?.total_active_hours_per_day || {}).reduce((a, b) => a + b, 0);
  const uniqueLocations = new Set(data.metadata?.locations?.map(l => `${l.city}, ${l.country}`)).size;
  const uniqueDevices = new Set(data.metadata?.device_fingerprints || []).size;
  const successRate = data.metadata?.loginHistory?.length 
    ? (data.metadata.loginHistory.length / (data.metadata.loginHistory.length + (data.metadata.failedLoginAttempts?.length || 0))) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100">
      {/* Header */}
      <div className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/operators')}
                className="flex items-center space-x-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Operators</span>
              </button>
              <div className="h-8 w-px bg-neutral-700"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-100">
                  {data.username}
                </h1>
                <p className="text-sm text-gray-400">
                  {data.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 bg-neutral-800 rounded-lg">
                <div className={`w-2 h-2 ${data.is_admin ? "bg-purple-500" : "bg-blue-500"} rounded-full`}></div>
                <span className="text-sm text-gray-300">
                  {data.is_admin ? "Admin" : "User"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <ActivityIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-400">Total Active Hours</p>
                <p className="text-xl font-semibold">{totalActiveHours.toFixed(1)}h</p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-400">Unique Locations</p>
                <p className="text-xl font-semibold">{uniqueLocations}</p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Smartphone className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-400">Unique Devices</p>
                <p className="text-xl font-semibold">{uniqueDevices}</p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Shield className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-400">Login Success Rate</p>
                <p className="text-xl font-semibold">{successRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Map and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location Map */}
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
            <div className="p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span>Location History</span>
              </h2>
            </div>
            <div className="h-[400px]">
              <MapContainer
                center={[0, 0]}
                zoom={2}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {data.metadata?.locations?.map((location, index) => (
                  <Marker
                    key={index}
                    position={[location.latitude || 0, location.longitude || 0]}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">{location.city}, {location.country}</p>
                        <p className="text-neutral-500">
                          {formatDistanceToNow(new Date(location.date))} ago
                        </p>
                        <p className="text-neutral-500">IP: {location.ip}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-neutral-900 rounded-xl border border-neutral-800">
            <div className="p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-400" />
                <span>Recent Activity</span>
              </h2>
            </div>
            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
              {data.metadata?.actions?.slice(-10).reverse().map((action, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="p-2 bg-neutral-800 rounded-lg">
                    <Activity className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{action.action}</p>
                    <p className="text-xs text-neutral-400">{action.details}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {formatDistanceToNow(new Date(action.date))} ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security and Login History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Status */}
          <div className="bg-neutral-900 rounded-xl border border-neutral-800">
            <div className="p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold flex items-center space-x-2">
                <Shield className="w-5 h-5 text-yellow-400" />
                <span>Security Status</span>
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-800/50 rounded-lg p-3">
                  <p className="text-sm text-neutral-400">Failed Login Attempts</p>
                  <p className="text-xl font-semibold mt-1">
                    {data.metadata?.failedLoginAttempts?.length || 0}
                  </p>
                </div>
                <div className="bg-neutral-800/50 rounded-lg p-3">
                  <p className="text-sm text-neutral-400">Last Password Change</p>
                  <p className="text-sm font-medium mt-1">
                    {data.metadata?.last_password_change
                      ? formatDistanceToNow(new Date(data.metadata.last_password_change))
                      : 'Never'}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-neutral-400">Recent Failed Logins</h3>
                {data.metadata?.failedLoginAttempts?.slice(-5).reverse().map((attempt, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-neutral-300">{attempt.ip}</span>
                    <span className="text-neutral-500">•</span>
                    <span className="text-neutral-400">{attempt.reason}</span>
                    <span className="text-neutral-500">•</span>
                    <span className="text-neutral-500">
                      {formatDistanceToNow(new Date(attempt.date))} ago
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Login History */}
          <div className="bg-neutral-900 rounded-xl border border-neutral-800">
            <div className="p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold flex items-center space-x-2">
                <History className="w-5 h-5 text-blue-400" />
                <span>Login History</span>
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                {data.metadata?.loginHistory?.slice(-5).reverse().map((login, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-neutral-300">{login.ip}</span>
                    <span className="text-neutral-500">•</span>
                    <span className="text-neutral-400">{login.location}</span>
                    <span className="text-neutral-500">•</span>
                    <span className="text-neutral-500">
                      {formatDistanceToNow(new Date(login.date))} ago
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Page Visits and Device Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Page Visits */}
          <div className="bg-neutral-900 rounded-xl border border-neutral-800">
            <div className="p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <span>Recent Page Visits</span>
              </h2>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {data.metadata?.pagesVisited?.slice(-10).reverse().map((visit, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-neutral-300 truncate">{visit.url}</span>
                    <span className="text-neutral-500">
                      {formatDistanceToNow(new Date(visit.date))} ago
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Device Information */}
          <div className="bg-neutral-900 rounded-xl border border-neutral-800">
            <div className="p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-green-400" />
                <span>Device Information</span>
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-neutral-400">User Agents</h3>
                {data.metadata?.userAgents?.slice(-5).map((agent, index) => (
                  <div key={index} className="text-sm text-neutral-300 bg-neutral-800/50 p-2 rounded">
                    {agent}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-neutral-400">Device Fingerprints</h3>
                {data.metadata?.device_fingerprints?.slice(-5).map((fingerprint, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <Fingerprint className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-300 font-mono">{fingerprint}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed top-4 right-4 bg-red-900/90 text-red-100 px-4 py-2 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
}

export default ClientDetail; 