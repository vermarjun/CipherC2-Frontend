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
   Clock
} from 'lucide-react';
import axios from 'axios';
import { backend_url } from '../App';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from "lucide-react"; // optional: lucide icons

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
    return status === "connected"
      ? "text-green-400 bg-green-800/30"
      : "text-red-400 bg-red-800/30";
  };

  const cardData = [
    {
      icon: <Globe />,
      label: "Status",
      value: displayData.status,
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

function SessionDetail() {
  const [activeCategory, setActiveCategory] = useState('Dashboard');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dialogRef = useRef(null);
  const buttonRef = useRef(null);
  const { sessionId } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock function to simulate navigation
  const navigate = useNavigate();
  // Mock function to simulate API calls
  async function interact_with_session(command) {
    try {
      console.log(`Command executed: ${command}`);
      const mockResponse = { status: 'success', command, timestamp: new Date().toISOString() };
      console.log('Response:', mockResponse);
    } catch (error) {
      console.error('Error:', error);
    }
  }
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
        { name: 'File System', description: 'Access file system', icon: <HardDrive className="w-5 h-5" />, command: 'filesystem', isLink: true, link: '/filesystem' },
        { name: 'Screenshot', description: 'Capture screen', icon: <Camera className="w-5 h-5" />, command: 'screenshot' },
        { name: 'Shell', description: 'Interactive shell', icon: <Terminal className="w-5 h-5" />, command: 'shell' },
        { name: 'Execute', description: 'Run program', icon: <Play className="w-5 h-5" />, command: 'execute' },
        { name: 'Process List', description: 'List processes', icon: <Database className="w-5 h-5" />, command: 'ps' },
        { name: 'Network Info', description: 'Interface config', icon: <Network className="w-5 h-5" />, command: 'ifconfig' },
        { name: 'Netstat', description: 'Network connections', icon: <Wifi className="w-5 h-5" />, command: 'netstat' },
        { name: 'Session Info', description: 'Session details', icon: <Eye className="w-5 h-5" />, command: 'info' }
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

  async function fetchSession(){
      const response = await axios.get(`${backend_url}/sessions/${sessionId}/files?path=/`)
      console.log("printing the session reponse")
      console.log(response);
      console.log("printing the session reponse data")
      console.log(response.data)
      setData(response.data);
  } 

  const handleActionClick = (action) => {
    if (action.isLink) {
      navigate(action.link);
    } else {
      interact_with_session(action.command);
    }
  };

  const toggleDialog = () => setIsDialogOpen(!isDialogOpen);

  useEffect(()=>{ 
    setIsLoading(true); 
    fetchSession();
    setIsLoading(false); 
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
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Active</span>
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
                        onClick={() => interact_with_session(action.command)}
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

        {/* Action Grid */}
        {
          (categories[activeCategory].title == 'Dashboard') ? 
          <Dashboard data={data} isLoading={isLoading}/> 
            : 
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
        }
      </div>
    </div>
  );
}

export default SessionDetail;