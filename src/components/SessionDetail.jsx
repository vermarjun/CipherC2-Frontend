import { useState, useEffect, useRef } from 'react';
import React from 'react';
import {
  Terminal, 
  FileText, 
  Camera, 
  X, 
  Play, 
  Edit, 
  Shield, 
  Key, 
  User, 
  Settings, 
  Network, 
  Database,
  Eye,
  RefreshCw,
  ArrowLeft,
  MoreVertical,
  Cpu,
  HardDrive,
  Wifi,
  Lock,
  Unlock,
  LayoutDashboardIcon,
   Monitor,
   Globe,
   Clock,
   Download,
   Loader2,
   Command,
   FileCode,
   Send,
   Search,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import ScreenshotViewer from './Screenshotcapture';
import ProcessList from './ProcessList';
import NetworkConnections from './NetworkConnections';

function Dashboard({ data, isLoading = false }) {
  const [displayData, setDisplayData] = useState(null);

  useEffect(() => {
    if (data && !isLoading) {
      const timer = setTimeout(() => setDisplayData(data), 500);
      return () => clearTimeout(timer);
    }
  }, [data, isLoading]);

  if (isLoading || !displayData) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="bg-neutral-900 rounded-xl shadow-inner border border-neutral-800 p-3 animate-pulse"
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-neutral-700 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-2.5 bg-neutral-700 rounded w-14 mb-1"></div>
                  <div className="h-2.5 bg-neutral-800 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    return status
     ?"text-red-400 bg-red-800/30"
      : "text-green-400 bg-green-800/30";
  };
  const cardData = [
    {
      icon: <Globe />,
      label: "Status",
      // it returs IsDead value so if it is false means connected and if true means that the session is dead
      value: (displayData.status)? "disconnected":"connected",
      className: `px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(displayData.status)}`,
    },
    { icon: <Monitor />, label: "Hostname", value: displayData.Hostname },
    { icon: <User />, label: "Username", value: displayData.Username },
    {
      icon: <Cpu />,
      label: "OS",
      value: `${displayData.OS} ${displayData.Arch}`,
    },
    {
      icon: <Globe />,
      label: "Remote Address",
      value: displayData["Remote Address"],
    },
    { icon: <HardDrive />, label: "PID", value: displayData.PID },
    { icon: <Shield />, label: "Active C2", value: displayData["Active C2"] },
    { icon: <Monitor />, label: "Version", value: displayData.Version },
    {
      icon: <Clock />,
      label: "Reconnect Interval",
      value: `${displayData["Reconnect Interval"] / 1000000000}s`,
    },
  ];

  return (
    <div className="w-full mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {cardData.map((item, index) => (
          <div
            key={index}
            className="bg-neutral-900 rounded-xl shadow-md border border-neutral-800 p-3 hover:shadow-lg hover:border-blue-600 transition-all duration-200 cursor-pointer group min-w-0"
          >
            <div className="flex items-center space-x-2">
              <div className="text-neutral-400 group-hover:text-blue-400 transition-colors duration-200 flex-shrink-0">
                {React.cloneElement(item.icon, { className: "w-4 h-4" })}
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

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 shadow-sm">
          <div className="flex items-center space-x-2 mb-3">
            <HardDrive className="w-4 h-4 text-neutral-500" />
            <h3 className="text-sm font-semibold text-white">File Path</h3>
          </div>
          <p className="text-xs text-neutral-300 break-all font-mono bg-neutral-800 p-2 rounded border border-neutral-700">
            {displayData.Filename}
          </p>
        </div>

        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 shadow-sm">
          <div className="flex items-center space-x-2 mb-3">
            <Shield className="w-4 h-4 text-neutral-500" />
            <h3 className="text-sm font-semibold text-white">Security Info</h3>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-neutral-300">
              <span className="font-medium text-neutral-400">UID:</span>{" "}
              {displayData.UID.split("-").slice(-1)[0]}
            </p>
            <p className="text-xs text-neutral-300">
              <span className="font-medium text-neutral-400">Burned:</span>{" "}
              <span
                className={`ml-1 ${
                  displayData.Burned ? "text-red-500" : "text-green-500"
                }`}
              >
                {displayData.Burned ? "Yes" : "No"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExecuteDialog({ isOpen, onClose, sessionId }) {
  const [mode, setMode] = useState(null);
  const [exePath, setExePath] = useState('');
  const [cmdInput, setCmdInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExecute = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setOutput('');

      let commandString;
      if (mode === 'exe') {
        commandString = `execute,exe,${exePath}`;
        // Add any additional arguments if needed
      } else {
        commandString = `execute,command,${cmdInput}`;
      }

      console.log('Sending command:', commandString); // Add logging

      const response = await api.post('/interactwithsession', {
        command: commandString
      });
      
      if (response.data.status === 'error') {
        throw new Error(response.data.detail || 'Execution failed');
      }

      // Format the output to show stdout, stderr and exit code
      let formattedOutput = '';
      if (response.data.stdout) {
        formattedOutput += `STDOUT:\n${response.data.stdout}\n\n`;
      }
      if (response.data.stderr) {
        formattedOutput += `STDERR:\n${response.data.stderr}\n\n`;
      }
      if (response.data.exitCode !== null) {
        formattedOutput += `Exit Code: ${response.data.exitCode}`;
      }

      setOutput(formattedOutput || 'Command executed successfully');
    } catch (err) {
      setError(err.message || 'Failed to execute command');
      console.error('Execution error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-2xl mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="text-xl font-semibold text-white">Execute</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {!mode ? (
            // Mode selection
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMode('exe')}
                className="flex flex-col items-center p-6 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all group"
              >
                <FileCode className="w-8 h-8 text-blue-400 mb-2 group-hover:text-blue-300" />
                <span className="text-white font-medium">Execute File</span>
                <span className="text-sm text-neutral-400 mt-1">Run an executable file</span>
              </button>
              <button
                onClick={() => setMode('command')}
                className="flex flex-col items-center p-6 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all group"
              >
                <Command className="w-8 h-8 text-green-400 mb-2 group-hover:text-green-300" />
                <span className="text-white font-medium">Run Command</span>
                <span className="text-sm text-neutral-400 mt-1">Execute a shell command</span>
              </button>
            </div>
          ) : (
            // Input form
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-neutral-400">
                <button
                  onClick={() => setMode(null)}
                  className="hover:text-white transition-colors"
                >
                  ← Back
                </button>
                <span>•</span>
                <span>{mode === 'exe' ? 'Execute File' : 'Run Command'}</span>
              </div>

              {mode === 'exe' ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-300">
                    Executable Path
                  </label>
                  <input
                    type="text"
                    value={exePath}
                    onChange={(e) => setExePath(e.target.value)}
                    placeholder="Enter full path to executable..."
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-300">
                    Command
                  </label>
                  <input
                    type="text"
                    value={cmdInput}
                    onChange={(e) => setCmdInput(e.target.value)}
                    placeholder="Enter command to execute..."
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <button
                onClick={handleExecute}
                disabled={isLoading || (mode === 'exe' ? !exePath : !cmdInput)}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isLoading || (mode === 'exe' ? !exePath : !cmdInput)
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Execute</span>
                  </>
                )}
              </button>

              {error && (
                <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              {output && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-neutral-300">Output</h3>
                    <button
                      onClick={() => setOutput('')}
                      className="text-xs text-neutral-400 hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="p-3 bg-neutral-800 border border-neutral-700 rounded-lg">
                    <pre className="text-sm text-neutral-300 whitespace-pre-wrap font-mono">
                      {output}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EnvironmentDialog({ isOpen, onClose, sessionId }) {
  const [mode, setMode] = useState(null); // 'get', 'set', or 'unset'
  const [getVarName, setGetVarName] = useState('');
  const [newVarName, setNewVarName] = useState('');
  const [newVarValue, setNewVarValue] = useState('');
  const [unsetVarName, setUnsetVarName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [output, setOutput] = useState('');

  const fetchEnvVar = async (name) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/environment?session_id=${sessionId}&name=${encodeURIComponent(name)}`);
      if (response.data.status === 'success') {
        const envVar = response.data.environment[0];
        setOutput(`${envVar.name}=${envVar.value}`);
      } else {
        throw new Error('Failed to fetch environment variable');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching environment variable:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetEnv = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post(`/environment?session_id=${sessionId}&name=${encodeURIComponent(newVarName)}&value=${encodeURIComponent(newVarValue)}`);
      if (response.data.status === 'success') {
        setNewVarName('');
        setNewVarValue('');
        setOutput(response.data.message);
      } else {
        throw new Error('Failed to set environment variable');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error setting environment variable:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsetEnv = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.delete(`/environment?session_id=${sessionId}&name=${encodeURIComponent(unsetVarName)}`);
      if (response.data.status === 'success') {
        setUnsetVarName('');
        setOutput(response.data.message);
      } else {
        throw new Error('Failed to unset environment variable');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error unsetting environment variable:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setMode(null);
    setGetVarName('');
    setNewVarName('');
    setNewVarValue('');
    setUnsetVarName('');
    setError(null);
    setOutput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-2xl mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="text-xl font-semibold text-white">Environment Variables</h2>
          <button
            onClick={() => {
              resetState();
              onClose();
            }}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {!mode ? (
            // Mode selection
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setMode('get')}
                className="flex flex-col items-center p-6 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all group"
              >
                <Eye className="w-8 h-8 text-blue-400 mb-2 group-hover:text-blue-300" />
                <span className="text-white font-medium">Get Variable</span>
                <span className="text-sm text-neutral-400 mt-1">Get a specific variable</span>
              </button>
              <button
                onClick={() => setMode('set')}
                className="flex flex-col items-center p-6 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all group"
              >
                <Edit className="w-8 h-8 text-green-400 mb-2 group-hover:text-green-300" />
                <span className="text-white font-medium">Set Variable</span>
                <span className="text-sm text-neutral-400 mt-1">Set a new variable</span>
              </button>
              <button
                onClick={() => setMode('unset')}
                className="flex flex-col items-center p-6 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all group"
              >
                <X className="w-8 h-8 text-red-400 mb-2 group-hover:text-red-300" />
                <span className="text-white font-medium">Unset Variable</span>
                <span className="text-sm text-neutral-400 mt-1">Remove a variable</span>
              </button>
            </div>
          ) : (
            // Input form
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-neutral-400">
                <button
                  onClick={resetState}
                  className="hover:text-white transition-colors"
                >
                  ← Back
                </button>
                <span>•</span>
                <span>
                  {mode === 'get' ? 'Get Variable' : 
                   mode === 'set' ? 'Set Variable' : 
                   'Unset Variable'}
                </span>
              </div>

              {mode === 'get' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">
                      Variable Name
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={getVarName}
                        onChange={(e) => setGetVarName(e.target.value)}
                        placeholder="Enter variable name..."
                        className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => fetchEnvVar(getVarName)}
                        disabled={isLoading || !getVarName}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          isLoading || !getVarName
                            ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Fetching...</span>
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4" />
                            <span>Fetch</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {mode === 'set' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">
                      Variable Name
                    </label>
                    <input
                      type="text"
                      value={newVarName}
                      onChange={(e) => setNewVarName(e.target.value)}
                      placeholder="Enter variable name..."
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">
                      Variable Value
                    </label>
                    <input
                      type="text"
                      value={newVarValue}
                      onChange={(e) => setNewVarValue(e.target.value)}
                      placeholder="Enter variable value..."
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleSetEnv}
                    disabled={isLoading || !newVarName || !newVarValue}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      isLoading || !newVarName || !newVarValue
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Setting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Set Variable</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {mode === 'unset' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300">
                      Variable Name
                    </label>
                    <input
                      type="text"
                      value={unsetVarName}
                      onChange={(e) => setUnsetVarName(e.target.value)}
                      placeholder="Enter variable name to unset..."
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleUnsetEnv}
                    disabled={isLoading || !unsetVarName}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      isLoading || !unsetVarName
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Unsetting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Unset Variable</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              {output && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-neutral-300">Output</h3>
                    <button
                      onClick={() => setOutput('')}
                      className="text-xs text-neutral-400 hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="p-3 bg-neutral-800 border border-neutral-700 rounded-lg">
                    <pre className="text-sm text-neutral-300 whitespace-pre-wrap font-mono">
                      {output}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RegistryDialog({ isOpen, onClose, sessionId }) {
  const [mode, setMode] = useState(null); // 'read', 'write', or 'create'
  const [hive, setHive] = useState('HKLM');
  const [regPath, setRegPath] = useState('');
  const [key, setKey] = useState('');
  const [regType, setRegType] = useState('STRING');
  const [stringValue, setStringValue] = useState('');
  const [dwordValue, setDwordValue] = useState('');
  const [qwordValue, setQwordValue] = useState('');
  const [byteValue, setByteValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [output, setOutput] = useState('');

  const hiveOptions = [
    'HKLM',
    'HKCU',
    'HKCR',
    'HKU',
    'HKCC'
  ];

  const regTypeOptions = [
    { value: 'STRING', label: 'String Value' },
    { value: 'DWORD', label: 'DWORD Value' },
    { value: 'QWORD', label: 'QWORD Value' },
    { value: 'BINARY', label: 'Binary Value' }
  ];

  const handleReadRegistry = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/registry?session_id=${sessionId}&hive=${encodeURIComponent(hive)}&reg_path=${encodeURIComponent(regPath)}&key=${encodeURIComponent(key)}`);
      if (response.data.status === 'success') {
        const regData = response.data.registry;
        if (regData && regData.value) {
          const value = regData.value;
          let displayValue = '';
          
          switch (value.type) {
            case 'STRING':
              displayValue = value.string_value;
              break;
            case 'DWORD':
              displayValue = value.dword_value;
              break;
            case 'QWORD':
              displayValue = value.qword_value;
              break;
            case 'BINARY':
              displayValue = value.byte_value;
              break;
            default:
              displayValue = 'Unknown type';
          }
          
          setOutput(`Type: ${value.type}\nValue: ${displayValue}`);
        } else {
          setOutput('No value found');
        }
      } else {
        throw new Error('Failed to read registry value');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error reading registry value:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWriteRegistry = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate inputs based on type
      if (regType === 'STRING' && !stringValue) {
        throw new Error('String value required for STRING type');
      } else if (regType === 'DWORD' && !dwordValue) {
        throw new Error('DWORD value required for DWORD type');
      } else if (regType === 'QWORD' && !qwordValue) {
        throw new Error('QWORD value required for QWORD type');
      } else if (regType === 'BINARY' && !byteValue) {
        throw new Error('Binary value required for BINARY type');
      }

      const params = new URLSearchParams({
        session_id: sessionId,
        hive: hive,
        reg_path: regPath,
        key: key,
        reg_type: regType
      });

      // Add value based on type
      if (regType === 'STRING') params.append('string_value', stringValue);
      if (regType === 'DWORD') params.append('dword_value', dwordValue);
      if (regType === 'QWORD') params.append('qword_value', qwordValue);
      if (regType === 'BINARY') params.append('byte_value', byteValue);

      const response = await api.post(`/registry?${params.toString()}`);
      if (response.data.status === 'success') {
        setOutput(response.data.message);
        // Clear values after successful write
        setStringValue('');
        setDwordValue('');
        setQwordValue('');
        setByteValue('');
      } else {
        throw new Error('Failed to write registry value');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error writing registry value:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post(`/registry/create-key?session_id=${sessionId}&hive=${encodeURIComponent(hive)}&reg_path=${encodeURIComponent(regPath)}&key=${encodeURIComponent(key)}`);
      if (response.data.status === 'success') {
        setOutput(response.data.message);
        // Clear values after successful creation
        setRegPath('');
        setKey('');
      } else {
        throw new Error('Failed to create registry key');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error creating registry key:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setMode(null);
    setHive('HKEY_LOCAL_MACHINE');
    setRegPath('');
    setKey('');
    setRegType('STRING');
    setStringValue('');
    setDwordValue('');
    setQwordValue('');
    setByteValue('');
    setError(null);
    setOutput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-2xl mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="text-xl font-semibold text-white">Registry Operations</h2>
          <button
            onClick={() => {
              resetState();
              onClose();
            }}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {!mode ? (
            // Mode selection
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setMode('read')}
                className="flex flex-col items-center p-6 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all group"
              >
                <Eye className="w-8 h-8 text-blue-400 mb-2 group-hover:text-blue-300" />
                <span className="text-white font-medium">Read Value</span>
                <span className="text-sm text-neutral-400 mt-1">Read a registry value</span>
              </button>
              <button
                onClick={() => setMode('write')}
                className="flex flex-col items-center p-6 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all group"
              >
                <Edit className="w-8 h-8 text-green-400 mb-2 group-hover:text-green-300" />
                <span className="text-white font-medium">Write Value</span>
                <span className="text-sm text-neutral-400 mt-1">Set a registry value</span>
              </button>
              <button
                onClick={() => setMode('create')}
                className="flex flex-col items-center p-6 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all group"
              >
                <Database className="w-8 h-8 text-purple-400 mb-2 group-hover:text-purple-300" />
                <span className="text-white font-medium">Create Key</span>
                <span className="text-sm text-neutral-400 mt-1">Create a new key</span>
              </button>
            </div>
          ) : (
            // Input form
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-neutral-400">
                <button
                  onClick={resetState}
                  className="hover:text-white transition-colors"
                >
                  ← Back
                </button>
                <span>•</span>
                <span>
                  {mode === 'read' ? 'Read Registry Value' : 
                   mode === 'write' ? 'Write Registry Value' : 
                   'Create Registry Key'}
                </span>
              </div>

              {/* Common fields for all modes */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-300">
                    Registry Hive
                  </label>
                  <select
                    value={hive}
                    onChange={(e) => setHive(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {hiveOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-300">
                    Registry Path
                  </label>
                  <input
                    type="text"
                    value={regPath}
                    onChange={(e) => setRegPath(e.target.value)}
                    placeholder="Enter registry path (e.g., SOFTWARE\\MyApp)"
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-300">
                    Key Name
                  </label>
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="Enter key name"
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Additional fields for write mode */}
                {mode === 'write' && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-neutral-300">
                        Value Type
                      </label>
                      <select
                        value={regType}
                        onChange={(e) => setRegType(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      >
                        {regTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {regType === 'STRING' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-300">
                          String Value
                        </label>
                        <input
                          type="text"
                          value={stringValue}
                          onChange={(e) => setStringValue(e.target.value)}
                          placeholder="Enter string value"
                          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}

                    {regType === 'DWORD' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-300">
                          DWORD Value
                        </label>
                        <input
                          type="number"
                          value={dwordValue}
                          onChange={(e) => setDwordValue(e.target.value)}
                          placeholder="Enter DWORD value (0-4294967295)"
                          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}

                    {regType === 'QWORD' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-300">
                          QWORD Value
                        </label>
                        <input
                          type="number"
                          value={qwordValue}
                          onChange={(e) => setQwordValue(e.target.value)}
                          placeholder="Enter QWORD value"
                          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}

                    {regType === 'BINARY' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-300">
                          Binary Value (hex)
                        </label>
                        <input
                          type="text"
                          value={byteValue}
                          onChange={(e) => setByteValue(e.target.value)}
                          placeholder="Enter binary value as hex (e.g., 00 FF A1)"
                          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Action button */}
                <button
                  onClick={
                    mode === 'read' ? handleReadRegistry :
                    mode === 'write' ? handleWriteRegistry :
                    handleCreateKey
                  }
                  disabled={isLoading || !hive || !regPath || !key || 
                    (mode === 'write' && (
                      (regType === 'STRING' && !stringValue) ||
                      (regType === 'DWORD' && !dwordValue) ||
                      (regType === 'QWORD' && !qwordValue) ||
                      (regType === 'BINARY' && !byteValue)
                    ))
                  }
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isLoading || !hive || !regPath || !key || 
                    (mode === 'write' && (
                      (regType === 'STRING' && !stringValue) ||
                      (regType === 'DWORD' && !dwordValue) ||
                      (regType === 'QWORD' && !qwordValue) ||
                      (regType === 'BINARY' && !byteValue)
                    ))
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      : mode === 'read' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                        mode === 'write' ? 'bg-green-600 hover:bg-green-700 text-white' :
                        'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        {mode === 'read' ? 'Reading...' :
                         mode === 'write' ? 'Writing...' :
                         'Creating...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>
                        {mode === 'read' ? 'Read Value' :
                         mode === 'write' ? 'Write Value' :
                         'Create Key'}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              {output && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-neutral-300">Output</h3>
                    <button
                      onClick={() => setOutput('')}
                      className="text-xs text-neutral-400 hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="p-3 bg-neutral-800 border border-neutral-700 rounded-lg">
                    <pre className="text-sm text-neutral-300 whitespace-pre-wrap font-mono">
                      {output}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionDetail() {
  const [activeCategory, setActiveCategory] = useState('Dashboard');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dialogRef = useRef(null);
  const buttonRef = useRef(null);
  const { sessionId } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSSOpen, setIsSSOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isExecuteOpen, setIsExecuteOpen] = useState(false);
  const [showProcessList, setShowProcessList] = useState(false);
  const [showNetworkConnections, setShowNetworkConnections] = useState(false);
  const [activeDialog, setActiveDialog] = useState(null);

  const navigate = useNavigate();
  const management = {
      title: 'Session Management',
      icon: <Settings className="w-5 h-5" />,
      actions: [
        { name: 'Interactive', description: 'Open interactive', icon: <Terminal className="w-5 h-5" />, command: 'interactive' },
        { name: 'Reconfig', description: 'Reconfigure session', icon: <Settings className="w-5 h-5" />, command: 'reconfig' },
        { name: 'Rename', description: 'Rename session', icon: <Edit className="w-5 h-5" />, command: 'rename' },
        { name: 'Extensions', description: 'Manage extensions', icon: <Database className="w-5 h-5" />, command: 'extensions' },
        { name: 'Get PID', description: 'Process ID', icon: <Eye className="w-5 h-5" />, command: 'getpid' },
        { name: 'Get UID', description: 'User ID', icon: <User className="w-5 h-5" />, command: 'getuid' },
        { name: 'Get GID', description: 'Group ID', icon: <User className="w-5 h-5" />, command: 'getgid' },
        { name: 'Close', description: 'Close session', icon: <X className="w-5 h-5" />, command: 'close' },
        { name: 'Terminate', description: 'Terminate process', icon: <X className="w-5 h-5" />, command: 'terminate' },
        { name: 'Kill', description: 'Kill session', icon: <X className="w-5 h-5" />, command: 'kill', danger: true }
      ]
  }

  const categories = {
    Dashboard: {
      title: 'Dashboard',
      icon: <LayoutDashboardIcon className="w-5 h-5" />,
      actions: []
    },
    system: {
      title: 'System Control',
      icon: <Cpu className="w-5 h-5" />,
      actions: [
        { 
          name: 'File System', 
          description: 'Access file system', 
          icon: <HardDrive className="w-5 h-5" />, 
          command: 'filesystem', 
          isLink: true, 
          link: `/filesystem/${sessionId}`
        },
        { name: 'Screenshot', description: 'Capture screen', icon: <Camera className="w-5 h-5" />, command: 'screenshot', function: () => setIsSSOpen(true) },
        { name: 'Shell', description: 'Interactive shell', icon: <Terminal className="w-5 h-5" />, command: 'shell' },
        { 
          name: 'Execute', 
          description: 'Run program or command', 
          icon: <Play className="w-5 h-5" />, 
          function: () => setIsExecuteOpen(true) 
        },
        { name: 'Process List', description: 'List processes', icon: <Database className="w-5 h-5" />, command: 'ps' },
        { name: 'Network Info', description: 'Interface config', icon: <Network className="w-5 h-5" />, command: 'ifconfig' },
        { name: 'Netstat', description: 'Network connections', icon: <Wifi className="w-5 h-5" />, command: 'netstat' },
        { name: 'Session Info', description: 'Session details', icon: <Eye className="w-5 h-5" />, command: 'info' },
        { 
          name: 'Environment Variables', 
          description: 'Manage environment variables', 
          icon: <Settings className="w-5 h-5" />, 
          command: 'environment', 
          function: () => setActiveDialog('environment') 
        },
        { 
          name: 'Registry Operations', 
          description: 'Manage registry keys and values', 
          icon: <Database className="w-5 h-5" />, 
          command: 'registry', 
          function: () => setActiveDialog('registry') 
        },
      ]
    },
    privileges: {
      title: 'Privilege Escalation',
      icon: <Shield className="w-5 h-5" />,
      actions: [
        { name: 'Get System', description: 'Escalate to SYSTEM', icon: <Unlock className="w-5 h-5" />, command: 'getsystem' },
        { name: 'Get Privileges', description: 'Current privileges', icon: <Key className="w-5 h-5" />, command: 'getprivs' },
        { name: 'Impersonate', description: 'Impersonate user', icon: <User className="w-5 h-5" />, command: 'impersonate' },
        { name: 'Make Token', description: 'Create logon session', icon: <Lock className="w-5 h-5" />, command: 'make-token' },
        { name: 'Run As', description: 'Run as user', icon: <User className="w-5 h-5" />, command: 'runas' },
        { name: 'Rev2Self', description: 'Revert token', icon: <RefreshCw className="w-5 h-5" />, command: 'rev2self' },
        { name: 'Who Am I', description: 'Current context', icon: <Eye className="w-5 h-5" />, command: 'whoami' }
      ]
    },
    injection: {
      title: 'Code Injection',
      icon: <Database className="w-5 h-5" />,
      actions: [
        { name: 'Execute Assembly', description: 'Load .NET assembly', icon: <Play className="w-5 h-5" />, command: 'execute-assembly' },
        { name: 'Execute Shellcode', description: 'Run shellcode', icon: <Terminal className="w-5 h-5" />, command: 'execute-shellcode' },
        { name: 'Spawn DLL', description: 'Reflective DLL', icon: <Database className="w-5 h-5" />, command: 'spawndll' },
        { name: 'Sideload', description: 'Load shared object', icon: <HardDrive className="w-5 h-5" />, command: 'sideload' },
        { name: 'MSF Payload', description: 'Execute MSF', icon: <Play className="w-5 h-5" />, command: 'msf' },
        { name: 'MSF Inject', description: 'Inject MSF payload', icon: <Database className="w-5 h-5" />, command: 'msf-inject' },
        { name: 'Process Dump', description: 'Dump memory', icon: <HardDrive className="w-5 h-5" />, command: 'procdump' },
        { name: 'Migrate', description: 'Process migration', icon: <RefreshCw className="w-5 h-5" />, command: 'migrate' }
      ]
    },
    persistence: {
      title: 'Persistence & Backdoors',
      icon: <Lock className="w-5 h-5" />,
      actions: [
        { name: 'Backdoor', description: 'Infect file', icon: <Lock className="w-5 h-5" />, command: 'backdoor' },
        { name: 'DLL Hijack', description: 'Plant DLL', icon: <Database className="w-5 h-5" />, command: 'dllhijack' },
        { name: 'PSExec', description: 'Remote service', icon: <Network className="w-5 h-5" />, command: 'psexec' },
        { name: 'Registry', description: 'Registry ops', icon: <Settings className="w-5 h-5" />, command: 'registry' },
        { name: 'Shikata-ga-nai', description: 'Polymorphic encoder', icon: <RefreshCw className="w-5 h-5" />, command: 'shikata-ga-nai' }
      ]
    },
    network: {
      title: 'Network Operations',
      icon: <Network className="w-5 h-5" />,
      actions: [
        { name: 'Port Forward', description: 'TCP forwarding', icon: <Network className="w-5 h-5" />, command: 'portfwd' },
        { name: 'Reverse Port Forward', description: 'Reverse forwarding', icon: <Network className="w-5 h-5" />, command: 'rportfwd' },
        { name: 'SOCKS5 Proxy', description: 'SOCKS5 proxy', icon: <Network className="w-5 h-5" />, command: 'socks5' },
        { name: 'SSH', description: 'SSH command', icon: <Terminal className="w-5 h-5" />, command: 'ssh' },
        { name: 'Pivots', description: 'List pivots', icon: <Network className="w-5 h-5" />, command: 'pivots' },
        { name: 'Ping', description: 'Round trip test', icon: <Wifi className="w-5 h-5" />, command: 'ping' }
      ]
    },
    utilities: {
      title: 'File Operations',
      icon: <FileText className="w-5 h-5" />,
      actions: [
        { name: 'Cat', description: 'Display file', icon: <FileText className="w-5 h-5" />, command: 'cat' },
        { name: 'Move/Rename', description: 'Move or rename', icon: <Edit className="w-5 h-5" />, command: 'mv' }
      ]
    }
  };

  async function fetchSession() {
    try {
      setError(null);
      setIsLoading(true);
      const response = await api.get(`/sessions/${sessionId}/files?path=/`);
      console.log('Session data:', response.data);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching session:', error.response?.data || error.message);
      setError(error.response?.data?.detail || 'Failed to fetch session data');
      if (error.response?.status === 401) {
        // Token expired or invalid
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const handleActionClick = (action) => {
    if (action.isLink) {
      console.log('Navigating to:', action.link);
      navigate(action.link);
    } else if (action.function) {
      const fn = action.function;
      fn();
    } else if (action.command === 'ps') {
      setShowProcessList(true);
    } else if (action.command === 'netstat') {
      setShowNetworkConnections(true);
    } else {
      fetch_backend(action.command);
    }
  };

  const toggleDialog = () => setIsDialogOpen(!isDialogOpen);

  useEffect(()=>{ 
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target) && !buttonRef.current.contains(event.target)) {
        setIsDialogOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [])

  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100">
      {/* Header */}
      <div className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <div className="h-8 w-px bg-neutral-700"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-100">{(data==null?"":data.Name)}</h1>
                <p className="text-sm text-gray-400">Session ID : {sessionId.split("-")[0]}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 bg-neutral-800 rounded-lg">
                <div className={`w-2 h-2 ${data == null || !data.isDead? "bg-green-500":"bg-red-500"} rounded-full animate-pulse`}></div>
                <span className="text-sm text-gray-300">{(data == null || !data.isDead)?"Active":"Dead"}</span>
              </div>
              <div className='relative'>
                <button ref={buttonRef} onClick={toggleDialog} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
                {/* Animated Dialog */}
                {isDialogOpen && (
                  <div
                    ref={dialogRef}
                    className="absolute z-50 right-4 mt-2 w-64 bg-black border border-gray-300 shadow-xl rounded-lg p-2 animate-slide-down"
                    style={{ animation: 'slideDown 200ms ease-out forwards' }}
                  >
                    <h2 className="text-lg font-semibold mb-2">Session Management</h2>
                    {management.actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => fetch_backend(action.command)}
                        className={`flex items-center w-full p-2 rounded ${action.danger ? 'hover:bg-red-600 hover:text-white' : 'hover:text-neutral-700'} hover:bg-neutral-200  ${action.danger ? 'text-red-600' : 'text-neutral-300'}`}
                      >
                        {action.icon}
                        <span className="ml-2 text-sm">{action.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Keyframes */}
                <style>{`
                  @keyframes slideDown {
                    0% {
                      opacity: 0;
                      transform: translateY(-8px);
                    }
                    100% {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                  @keyframes slideUp {
                    0% {
                      opacity: 1;
                      transform: translateY(0);
                    }
                    100% {
                      opacity: 0;
                      transform: translateY(-8px);
                    }
                  }
                `}</style>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-neutral-900 border-b border-neutral-800">
        <div className="px-6">
          <div className="flex space-x-1 overflow-x-auto">
            {Object.entries(categories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  activeCategory === key
                    ? 'bg-neutral-800 text-gray-100 border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-neutral-800/50'
                }`}
              >
                {category.icon}
                <span>{category.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-100 mb-2">
            {categories[activeCategory].title}
          </h2>
          <p className="text-gray-400">
            Manage and control your remote session with professional-grade tools
          </p>
        </div>

        {/* Action Grid, Process List, or Network Connections */}
        {showProcessList ? (
          <ProcessList 
            sessionId={sessionId} 
            onBack={() => setShowProcessList(false)} 
          />
        ) : showNetworkConnections ? (
          <NetworkConnections
            sessionId={sessionId}
            onBack={() => setShowNetworkConnections(false)}
          />
        ) : categories[activeCategory].title === 'Dashboard' ? (
          <Dashboard data={data} isLoading={isLoading} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories[activeCategory].actions.map((action, index) => (
              <div
                key={index}
                onClick={() => handleActionClick(action)}
                className={`group relative bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-neutral-950/50 ${
                  action.danger ? 'hover:border-red-500/50 hover:bg-red-950/20' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${
                    action.danger 
                      ? 'bg-red-950/50 text-red-400 group-hover:bg-red-900/50' 
                      : 'bg-neutral-800 text-gray-400 group-hover:bg-neutral-700 group-hover:text-gray-300'
                  } transition-colors duration-200`}>
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-gray-100 group-hover:text-white transition-colors ${
                      action.danger ? 'group-hover:text-red-400' : ''
                    }`}>
                      {action.name}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1 group-hover:text-gray-300 transition-colors">
                      {action.description}
                    </p>
                  </div>
                </div>
                
                {/* Hover effect indicator */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ScreenshotViewer
          isOpen={isSSOpen}
          onClose={() => setIsSSOpen(false)}
        />
      <ExecuteDialog
        isOpen={isExecuteOpen}
        onClose={() => setIsExecuteOpen(false)}
        sessionId={sessionId}
      />
      {activeDialog === 'environment' && (
        <EnvironmentDialog
          isOpen={true}
          onClose={() => setActiveDialog(null)}
          sessionId={sessionId}
        />
      )}
      {activeDialog === 'registry' && (
        <RegistryDialog
          isOpen={true}
          onClose={() => setActiveDialog(null)}
          sessionId={sessionId}
        />
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-900/90 text-red-100 px-4 py-2 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
}

export default SessionDetail;