import { useState, useEffect, useRef } from 'react';
import chipherc2logo from "/cipherc2logo.png"
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Navbar = ({ backend_url }) => {
  const { user, logout } = useAuth();
  const { isConnected, checkConnection } = useDashboard();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [serverConfig, setServerConfig] = useState('');
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [pastConnections, setPastConnections] = useState([]);
  const [selectedPastConnection, setSelectedPastConnection] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const [error, setError] = useState(null);
  const [connectionName, setConnectionName] = useState('');
  const [connectionConfig, setConnectionConfig] = useState('');
  const [showConfigInput, setShowConfigInput] = useState(false);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch past connections
  useEffect(() => {
    const fetchPastConnections = async () => {
      try {
        const response = await api.get('/connections');
        // Ensure each connection has an id field
        const connections = response.data.map(conn => ({
          ...conn,
          id: conn._id || conn.id // Handle both _id and id fields
        }));
        setPastConnections(connections);
      } catch (error) {
        console.error('Error fetching past connections:', error);
        // Fallback to localStorage if backend fails
        const savedConnections = localStorage.getItem('pastConnections');
        if (savedConnections) {
          setPastConnections(JSON.parse(savedConnections));
        }
      }
    };

    if (dropdownOpen) {
      fetchPastConnections();
    }
  }, [dropdownOpen]);

  const saveConnection = async (name, config) => {
    try {
      // Save to backend
      await api.post('/connections', { name, config });
      
      // Also save to localStorage as backup
      const savedConnections = localStorage.getItem('pastConnections');
      const localConnections = savedConnections ? JSON.parse(savedConnections) : [];
      const newConnection = { name, config, id: Date.now().toString() };
      
      // Check if connection already exists
      const exists = localConnections.some(conn => 
        conn.name === name || conn.config === config
      );
      
      if (!exists) {
        localConnections.push(newConnection);
        localStorage.setItem('pastConnections', JSON.stringify(localConnections));
      }

      // Refresh connections list
      const response = await api.get('/connections');
      setPastConnections(response.data.map(conn => ({
        ...conn,
        id: conn._id || conn.id,
        source: 'backend'
      })));
    } catch (error) {
      console.error('Error saving connection:', error);
      // Fallback to localStorage only
      const savedConnections = localStorage.getItem('pastConnections');
      const localConnections = savedConnections ? JSON.parse(savedConnections) : [];
      const newConnection = { name, config, id: Date.now().toString() };
      
      if (!localConnections.some(conn => conn.name === name || conn.config === config)) {
        localConnections.push(newConnection);
        localStorage.setItem('pastConnections', JSON.stringify(localConnections));
        setPastConnections(localConnections.map(conn => ({
          ...conn,
          source: 'local'
        })));
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const connectServer = async () => {
    try {
      setIsConnecting(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${backend_url}/connect`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsConnecting(false);
      setIsConnected(response.data);
    } catch (error) {
      setIsConnecting(false);
      setIsConnected(false);
    }
  };

  // Fetch full connection details when selecting a connection
  const handleConnectionSelect = async (conn) => {
    try {
      // Fetch the full connection details including config
      const response = await api.get(`/connections/${conn.id}`);
      const fullConnection = response.data;
      
      console.log('Selected connection details:', fullConnection);
      
      if (!fullConnection.config) {
        throw new Error('Connection configuration not found');
      }

      setSelectedPastConnection({
        ...conn,
        config: fullConnection.config
      });
      setConnectionConfig(fullConnection.config);
      setConnectionName(fullConnection.name);
    } catch (error) {
      console.error('Error fetching connection details:', error);
      setError('Failed to load connection details. Please try again.');
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      let configToUse = '';
      let nameToUse = '';

      // If a past connection is selected, use its config
      if (selectedPastConnection?.config) {
        // Parse the config if it's a string
        const config = typeof selectedPastConnection.config === 'string' 
          ? JSON.parse(selectedPastConnection.config)
          : selectedPastConnection.config;
        configToUse = config;
        nameToUse = selectedPastConnection.name;
        console.log('Using selected connection:', { name: nameToUse, config: configToUse });
      } 
      // Otherwise use the manually entered config
      else if (connectionConfig) {
        // Parse the config if it's a string
        configToUse = typeof connectionConfig === 'string'
          ? JSON.parse(connectionConfig)
          : connectionConfig;
        nameToUse = connectionName || `Connection ${Date.now()}`;
        console.log('Using manual connection:', { name: nameToUse, config: configToUse });
      }

      if (!configToUse) {
        throw new Error('Please select a saved connection or provide a configuration');
      }

      // Validate required fields
      const requiredFields = ["operator", "token", "lhost", "lport", "ca_certificate", "private_key", "certificate"];
      const missingFields = requiredFields.filter(field => !configToUse[field]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required configuration fields: ${missingFields.join(', ')}`);
      }

      // Connect using the configuration - send the config object directly
      const response = await api.post('/connect', configToUse);
      
      if (response.data.status === "connected") {
        await checkConnection();
        setDropdownOpen(false);
        setConnectionName('');
        setConnectionConfig('');
        setSelectedPastConnection(null);
      } else {
        throw new Error(response.data.message || 'Failed to connect');
      }
    } catch (error) {
      console.error('Connection error:', error);
      setError(error.message || 'Failed to connect');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await api.post('/disconnect');
      setIsConnected(false);
      setDropdownOpen(false);
      // Optionally redirect to dashboard after disconnect
      navigate('/dashboard');
    } catch (error) {
      console.error('Error disconnecting:', error);
      setError(error.response?.data?.detail || 'Failed to disconnect');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileUploaded(true);
      // Process file here
    }
  };

  const isConnectButtonDisabled = !isConnected && (
    (selectedOption === 'manual' && (!connectionConfig.trim() || !connectionName.trim())) ||
    (selectedOption === 'past' && !selectedPastConnection) ||
    !selectedOption ||
    isConnecting
  );

  return (
    <nav className={`sticky top-0 left-0 bg-neutral-900 text-black right-0 z-50 shadow-md transition-all duration-300 py-4`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center justify-center">
          <img 
            src={chipherc2logo}
            alt="Logo" 
            className="h-14 transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Navigation Links */}
        {/* <div className="flex items-center space-x-6">
          <Link 
            to="/dashboard/sessions" 
            className="text-neutral-300 hover:text-white transition-colors"
          >
            Sessions
          </Link>
          <Link 
            to="/dashboard/operators" 
            className="text-neutral-300 hover:text-white transition-colors"
          >
            Operators
          </Link>
          <Link 
            to="/dashboard/operations" 
            className="text-neutral-300 hover:text-white transition-colors"
          >
            Operations
          </Link>
          <Link 
            to="/dashboard/activity" 
            className="text-neutral-300 hover:text-white transition-colors"
          >
            Activity
          </Link> */}
        {/* </div> */}

        {/* User and Connect Section */}
        <div className="flex items-center space-x-4">
          {/* User Info - Only show when not connected */}
          {!isConnected && user && !dropdownOpen && (
            <div className="text-white text-sm">
              <span className="text-gray-400">Welcome, </span>
              <span className="font-medium">{user.username}</span>
            </div>
          )}

          {/* Connect Button and Status */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex flex-row items-center space-x-2">
              {/* Status indicator - Only show when connected */}
              {isConnected && (
                <div className="text-xs mt-1 font-medium text-green-600">
                  Connected
                </div>
              )}
              <button
                onClick={() => {
                  if (isConnected) {
                    handleDisconnect();
                  } else {
                    setDropdownOpen(!dropdownOpen);
                  }
                }}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isConnected
                    ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                } transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
              >
                {isConnected ? 'Disconnect' : 'Connect to Server'}
              </button>

              {/* Logout Button - Only show when not connected */}
              {!isConnected && (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-all duration-300"
                >
                  Logout
                </button>
              )}
            </div>

            {/* Dropdown - Only show when not connected */}
            {dropdownOpen && !isConnected && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 animate-fadeIn">
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Server Connection</h3>

                  {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                      {error}
                    </div>
                  )}

                  {/* Option 1: Manual Config */}
                  <div className="mb-4">
                    <label className="flex items-center mb-2 cursor-pointer">
                      <input
                        type="radio"
                        name="connectionOption"
                        className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                        checked={selectedOption === 'manual'}
                        onChange={() => {
                          setSelectedOption('manual');
                          setError(null);
                        }}
                      />
                      <span className="ml-2 text-gray-700">Manual Configuration</span>
                    </label>
                    {selectedOption === 'manual' && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Connection Name (required)"
                          value={connectionName}
                          onChange={(e) => {
                            setConnectionName(e.target.value);
                            setError(null);
                          }}
                        />
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                          rows="6"
                          placeholder="Paste server configuration JSON..."
                          value={connectionConfig}
                          onChange={(e) => {
                            setConnectionConfig(e.target.value);
                            setError(null);
                            // Try to parse JSON to validate
                            try {
                              if (e.target.value.trim()) {
                                JSON.parse(e.target.value);
                              }
                            } catch (err) {
                              // Don't set error here, just let the user continue typing
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Option 2: Past Connections */}
                  <div>
                    <label className="flex items-center mb-2 cursor-pointer">
                      <input
                        type="radio"
                        name="connectionOption"
                        className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                        checked={selectedOption === 'past'}
                        onChange={() => {
                          setSelectedOption('past');
                          setError(null);
                        }}
                      />
                      <span className="ml-2 text-gray-700">Saved Connections</span>
                    </label>
                    {selectedOption === 'past' && (
                      <div className="mt-2 max-h-48 overflow-y-auto">
                        {pastConnections.length === 0 ? (
                          <div className="text-gray-500 text-sm p-3">
                            No saved connections found
                          </div>
                        ) : (
                          pastConnections.map((connection) => {
                            const connectionId = connection.id || connection._id;
                            if (!connectionId) {
                              console.error('Connection missing ID:', connection);
                              return null;
                            }
                            return (
                              <div
                                key={connectionId}
                                className={`p-3 mb-1 rounded-md cursor-pointer transition duration-150 ${
                                  selectedPastConnection?.id === connectionId
                                    ? 'bg-blue-100 border border-blue-300'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                                onClick={() => handleConnectionSelect(connection)}
                              >
                                <div className="font-medium text-gray-800">{connection.name}</div>
                                <div className="text-sm text-gray-500">
                                  {new Date(connection.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>

                  {/* Connect Button */}
                  <button
                    onClick={handleConnect}
                    disabled={isConnectButtonDisabled || isConnecting}
                    className={`w-full mt-4 px-4 py-2 rounded-md font-medium transition duration-300 relative ${
                      isConnectButtonDisabled || isConnecting
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isConnecting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Connecting...
                      </div>
                    ) : (
                      'Connect'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;