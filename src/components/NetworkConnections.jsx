import React, { useState, useEffect } from 'react';
import { Wifi, RefreshCw, Filter, ArrowLeft, Globe, Server, Terminal, Loader2 } from 'lucide-react';
import api from '../api';

function NetworkConnections({ sessionId, onBack }) {
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    tcp: true,
    udp: true,
    ipv4: true,
    ipv6: true,
    listening: true
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchConnections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/network-connections', {
        params: {
          session_id: sessionId,
          ...filters
        }
      });
      setConnections(response.data.connections);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch network connections');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [sessionId, filters]);

  const getProtocolColor = (protocol) => {
    switch (protocol?.toLowerCase()) {
      case 'tcp':
        return 'text-blue-400 bg-blue-400/10';
      case 'udp':
        return 'text-purple-400 bg-purple-400/10';
      case 'tcp6':
        return 'text-cyan-400 bg-cyan-400/10';
      case 'udp6':
        return 'text-indigo-400 bg-indigo-400/10';
      default:
        return 'text-neutral-400 bg-neutral-400/10';
    }
  };

  const getStateColor = (state) => {
    switch (state?.toLowerCase()) {
      case 'listen':
        return 'text-green-400 bg-green-400/10';
      case 'established':
        return 'text-blue-400 bg-blue-400/10';
      case 'time_wait':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'close_wait':
        return 'text-orange-400 bg-orange-400/10';
      default:
        return 'text-neutral-400 bg-neutral-400/10';
    }
  };

  const formatAddress = (addr) => {
    if (!addr.ip) return '-';
    const ip = addr.ip === '::' ? '0.0.0.0' : addr.ip;
    return addr.port ? `${ip}:${addr.port}` : ip;
  };

  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-400" />
            </button>
            <div className="flex items-center space-x-2">
              <Wifi className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Network Connections</h2>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-neutral-800 text-neutral-400'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              onClick={fetchConnections}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {Object.entries(filters).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center space-x-2 p-2 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-700 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="form-checkbox h-4 w-4 text-blue-500 rounded border-neutral-600 bg-neutral-700 focus:ring-blue-500"
                />
                <span className="text-sm text-neutral-300 capitalize">{key}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-900/50 border-b border-red-800 text-red-200">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : (
        /* Connections Table */
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Protocol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Local Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Remote Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">State</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Process</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {connections.map((conn, index) => (
                <tr key={index} className="hover:bg-neutral-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getProtocolColor(conn.protocol)}`}>
                      {conn.protocol}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-300">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-neutral-500" />
                      <span>{formatAddress(conn.local_address)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-300">
                    <div className="flex items-center space-x-2">
                      <Server className="w-4 h-4 text-neutral-500" />
                      <span>{formatAddress(conn.remote_address)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStateColor(conn.state)}`}>
                      {conn.state}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <Terminal className="w-4 h-4 text-neutral-500" />
                      <div>
                        <div className="text-sm text-neutral-300">{conn.process.executable}</div>
                        <div className="text-xs text-neutral-500">PID: {conn.process.pid}</div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default NetworkConnections; 