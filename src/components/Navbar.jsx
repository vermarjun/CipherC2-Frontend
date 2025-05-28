import { useState, useEffect, useRef } from 'react';
import chipherc2logo from "/cipherc2logo.png"
import axios from 'axios';

const Navbar = ({isConnected, setIsConnected, backend_url}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [serverConfig, setServerConfig] = useState('');
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [pastConnections, setPastConnections] = useState([
    'Server 1 (192.168.24.137)',
    'Server 2 (10.0.0.2)',
    'Test Server',
  ]);
  const [selectedPastConnection, setSelectedPastConnection] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

    const connectServer = async () => {
            try {
            console.log("clicked")
            setIsConnecting(true)
            const response = await axios.post(`${backend_url}/connect`);
            console.log(response)
            setIsConnecting(false)
            setIsConnected(response.data);
        } catch (error) {
            setIsConnecting(false)
            setIsConnected(false);
        }
        };
    
  const handleConnect = async () => {
    if (isConnected) {
    //   Change server logic
      setDropdownOpen(true);
    } else {
    //   Connect logic
      if (selectedOption === 'manual' && serverConfig.trim() !== '') {
        await connectServer();
        setDropdownOpen(false);
    } else if (selectedOption === 'file' && fileUploaded) {
          await connectServer();
          setDropdownOpen(false);
        } else if (selectedOption === 'past' && selectedPastConnection) {
          await connectServer();
          setDropdownOpen(false);
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileUploaded(true);
      // Process file here
    }
  };

  const isConnectButtonDisabled = !isConnected && 
    ((selectedOption === 'manual' && !serverConfig.trim()) || 
     (selectedOption === 'file' && !fileUploaded) || 
     (selectedOption === 'past' && !selectedPastConnection) || 
     !selectedOption);

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

        {/* Connect Button and Status */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex flex-row items-center space-x-2">
            <div className={`text-xs mt-1 font-medium ${
              isConnected ? 'text-green-600' : 'text-red-600'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <button
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                if (isConnected && dropdownOpen) {
                  setIsConnected(false);
                }
              }}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                isConnected
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300 hover:shadow-md'
              } transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
            >
              {isConnected ? 'Change Server' : 'Connect to Server'}
            </button>
          </div>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 animate-fadeIn">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Server Connection</h3>

                {/* Option 1: Manual Config */}
                <div className="mb-4">
                  <label className="flex items-center mb-2 cursor-pointer">
                    <input
                      type="radio"
                      name="connectionOption"
                      className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                      checked={selectedOption === 'manual'}
                      onChange={() => setSelectedOption('manual')}
                    />
                    <span className="ml-2 text-gray-700">Manual Configuration</span>
                  </label>
                  {selectedOption === 'manual' && (
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                      rows="3"
                      placeholder="Enter server configuration..."
                      value={serverConfig}
                      onChange={(e) => setServerConfig(e.target.value)}
                    />
                  )}
                </div>

                {/* Option 2: File Upload */}
                <div className="mb-4">
                  <label className="flex items-center mb-2 cursor-pointer">
                    <input
                      type="radio"
                      name="connectionOption"
                      className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                      checked={selectedOption === 'file'}
                      onChange={() => setSelectedOption('file')}
                    />
                    <span className="ml-2 text-gray-700">Upload Config File</span>
                  </label>
                  {selectedOption === 'file' && (
                    <div className="mt-2">
                      <label className="flex flex-col items-center px-4 py-6 bg-white rounded-lg border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition duration-150">
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        <span className="text-sm text-gray-600">
                          {fileUploaded ? 'File uploaded!' : 'Click to upload config file'}
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Option 3: Past Connections */}
                <div>
                  <label className="flex items-center mb-2 cursor-pointer">
                    <input
                      type="radio"
                      name="connectionOption"
                      className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                      checked={selectedOption === 'past'}
                      onChange={() => setSelectedOption('past')}
                    />
                    <span className="ml-2 text-gray-700">Saved Connections</span>
                  </label>
                  {selectedOption === 'past' && (
                    <div className="mt-2 max-h-40 overflow-y-auto">
                      {pastConnections.map((connection, index) => (
                        <div
                          key={index}
                          className={`p-3 mb-1 rounded-md cursor-pointer transition duration-150 ${
                            selectedPastConnection === connection
                              ? 'bg-blue-100 border border-blue-300'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                          onClick={() => setSelectedPastConnection(connection)}
                        >
                          {connection}
                        </div>
                      ))}
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
                        : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                    }`}
                    >
                    {isConnecting ? (
                        <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isConnected ? 'Changing...' : 'Connecting...'}
                        </div>
                    ) : (
                        isConnected ? 'Change Connection' : 'Connect'
                    )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;