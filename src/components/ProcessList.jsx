import React, { useState, useEffect } from 'react';
import { X, RefreshCw, AlertTriangle, Info, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

function ProcessList({ sessionId, onBack }) {
  const [processes, setProcesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [processToTerminate, setProcessToTerminate] = useState(null);

  const fetchProcesses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the dedicated processes endpoint with session_id parameter
      const response = await api.get('/processes', {
        params: { session_id: sessionId }
      });
      
      if (response.data && response.data.status === 'success') {
        // The endpoint already returns the process list in the correct format
        setProcesses(response.data.processes);
      } else {
        throw new Error(response.data?.detail || 'Failed to fetch processes');
      }
    } catch (err) {
      console.error('Error fetching processes:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to fetch process list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerminateProcess = async (pid) => {
    try {
      setProcessToTerminate(pid);
      setShowConfirmDialog(true);
    } catch (err) {
      console.error('Error preparing to terminate process:', err);
      setError(err.message || 'Failed to prepare process termination');
    }
  };

  const confirmTerminate = async () => {
    if (!processToTerminate) return;
    
    try {
      // Use the terminate endpoint with session_id parameter
      const response = await api.post(`/processes/${processToTerminate}/terminate`, null, {
        params: { session_id: sessionId }
      });
      
      if (response.data && response.data.status === 'success') {
        // Refresh the process list
        await fetchProcesses();
        setShowConfirmDialog(false);
        setProcessToTerminate(null);
      } else {
        throw new Error(response.data?.detail || 'Failed to terminate process');
      }
    } catch (err) {
      console.error('Error terminating process:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to terminate process');
    }
  };

  // Add auto-refresh functionality
  useEffect(() => {
    fetchProcesses();
    // Refresh process list every 5 seconds
    const interval = setInterval(fetchProcesses, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const formatCmdLine = (cmdLine) => {
    if (!cmdLine || !Array.isArray(cmdLine)) return '';
    return cmdLine.join(' ').replace(/^"(.*)"$/, '$1'); // Remove surrounding quotes
  };

  if (isLoading && processes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with back button and refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Session</span>
          </button>
          <h2 className="text-xl font-semibold text-white">Running Processes</h2>
        </div>
        <button
          onClick={fetchProcesses}
          className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          title="Refresh process list"
        >
          <RefreshCw className="w-5 h-5 text-neutral-400" />
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900/50 border border-red-800 rounded-lg p-4 text-red-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Process list */}
      <div className="grid gap-4">
        {processes.map((process) => (
          <div
            key={process.pid}
            className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-sm font-mono">
                    PID: {process.pid}
                  </span>
                  <span className="px-2 py-1 bg-neutral-800 text-neutral-300 rounded text-sm font-mono">
                    PPID: {process.ppid}
                  </span>
                  <button
                    onClick={() => handleTerminateProcess(process.pid)}
                    className="p-1 hover:bg-red-900/50 rounded transition-colors group"
                    title="Terminate process"
                  >
                    <X className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                  </button>
                </div>
                
                <h3 className="text-white font-medium truncate" title={process.executable}>
                  {process.executable}
                </h3>
                
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-neutral-400">
                    <span className="text-neutral-500">Owner:</span> {process.owner}
                  </p>
                  <p className="text-sm text-neutral-400">
                    <span className="text-neutral-500">Architecture:</span> {process.architecture}
                  </p>
                  {process.cmd_line && process.cmd_line.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-neutral-500 mb-1">Command Line:</p>
                      <div className="bg-neutral-800 rounded p-2">
                        <code className="text-xs text-neutral-300 font-mono break-all">
                          {formatCmdLine(process.cmd_line)}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-semibold text-white">Terminate Process</h3>
            </div>
            
            <p className="text-neutral-300 mb-6">
              Are you sure you want to terminate process {processToTerminate}? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setProcessToTerminate(null);
                }}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmTerminate}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
              >
                Terminate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProcessList; 