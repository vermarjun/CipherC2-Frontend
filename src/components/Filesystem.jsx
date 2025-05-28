import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backend_url } from '../App';

function ToolBarComponent({ explorerData, pathHistory, loading, theme, handleBackClick, setExplorerData, setPathHistory, setLoading, fetch_backend }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  // Always update currentPath when explorerData.Path changes
  useEffect(() => {
    setCurrentPath(explorerData.Path);
  }, [explorerData.Path]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    setCurrentPath(e.target.value);
  };

  async function fetchData(newPath){
    setLoading(true);
    // First change directory
    const cdResult = await fetch_backend('cd', newPath);
    // console.log("cdResult: ",cdResult);
      // Then list contents
      const lsResult = await fetch_backend('ls');
      // console.log("lsResult: ",lsResult);
      if (lsResult.Exists) {
        setExplorerData(lsResult);
        setPathHistory(prev => [...prev, lsResult.Path]);
      }
    setLoading(false);
  }
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      console.log('New Path:', currentPath);
      fetchData(currentPath);
      setIsEditing(false);

    }
  };

  return (
    <div className={`${theme.secondary} p-2 flex items-center border-b ${theme.border}`}>
      <button 
        onClick={handleBackClick}
        disabled={pathHistory.length <= 1 || loading}
        className={`p-2 rounded ${theme.secondaryHover} mr-2 ${(pathHistory.length <= 1 || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Back"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <div onClick={handleDoubleClick} className="flex-1 bg-white rounded px-3 py-1 border border-gray-300 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>

        {isEditing ? (
          <input
            type="text"
            value={currentPath}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 outline-none"
          />
        ) : (
          <span
            className="truncate cursor-text select-none"
          >
            {currentPath}
          </span>
        )}
      </div>
    </div>
  );
}


const FileExplorer = () => {
  // Theme colors - change these to update the entire component's color scheme
  const theme = {
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    primaryText: 'text-blue-600',
    secondary: 'bg-gray-200',
    secondaryHover: 'hover:bg-gray-300',
    background: 'bg-white',
    text: 'text-gray-800',
    border: 'border-gray-300',
    icon: 'text-blue-500',
    selected: 'bg-blue-100',
  };

  function parseExplorerData(input) {
  const lines = input.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

  const explorerData = {
    Path: "",
    Exists: false,
    files: [],
    timezone: "",
    timezoneOffset: 0,
  };

  let currentFile = null;

  for (let line of lines) {
    if (line.startsWith('Path:')) {
      explorerData.Path = line.match(/Path:\s*"(.+?)"/)?.[1] || "";
    } else if (line.startsWith('Exists:')) {
      explorerData.Exists = line.includes('true');
    } else if (line.startsWith('timezone:')) {
      explorerData.timezone = line.match(/timezone:\s*"(.+?)"/)?.[1] || "";
    } else if (line.startsWith('timezoneOffset:')) {
      explorerData.timezoneOffset = Number(line.split(':')[1].trim());
    } else if (line.startsWith('Files {')) {
      currentFile = {};
    } else if (line.startsWith('Name:')) {
      currentFile.Name = line.match(/Name:\s*"(.+?)"/)?.[1] || "";
    } else if (line.startsWith('IsDir:')) {
      currentFile.IsDir = line.includes('true');
    } else if (line.startsWith('Size:')) {
      currentFile.Size = Number(line.split(':')[1].trim());
    } else if (line.startsWith('ModTime:')) {
      currentFile.ModTime = Number(line.split(':')[1].trim());
    } else if (line.startsWith('Mode:')) {
      currentFile.Mode = line.match(/Mode:\s*"(.+?)"/)?.[1] || "";
      // If IsDir was never set, assume it's a file
      if (currentFile.IsDir === undefined) currentFile.IsDir = false;
      explorerData.files.push(currentFile);
      currentFile = null;
    }
  }

  return explorerData;
}

  const [explorerData, setExplorerData] = useState({
    path: "",
    exists: true,
    files: [],
    timezone: "IST",
    timezoneOffset: 19800
  });

  const [pathHistory, setPathHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetch_backend(command, path = null) {
    try {
        const requestData = path ? { command: command, path: path } : { command: command };
        if (requestData.command == "cd"){
          requestData.command = `cd, ${requestData.path}`
        }
        const response = await axios.post(`${backend_url}/interactwithsession`, requestData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log(response.data)
        const data = parseExplorerData(response.data.result);
        return data;
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        return null;
    }
  }

  // Initial load - get current directory
  useEffect(() => {
    const initializeExplorer = async () => {
      setLoading(true);
      const data = await fetch_backend('ls');
      if (data) {
        setExplorerData(data);
        setPathHistory([data.Path]);
      }
      setLoading(false);
    };
    
    initializeExplorer();
  }, []);
  const [selectedFile, setSelectedFile] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    file: null
  });
  const [dialog, setDialog] = useState({
    visible: false,
    file: null
  });

  const handleFileClick = (file) => {
    setSelectedFile(file.Name);
    if (file.IsDir) {
      // Empty function for now as requested
      console.log(`Folder clicked: ${file.Name}`);
    }
  };

  const handleFileDoubleClick = async (file) => {
    if (file.IsDir) {
      setLoading(true);
      
      // Construct the new path
      let newPath;
      if (explorerData.Path.endsWith('\\')) {
        newPath = `${explorerData.Path}${file.Name}`;
      } else {
        newPath = `${explorerData.Path}\\${file.Name}`;
      }
      
      // Convert Windows path format to the format expected by backend
      const backendPath = newPath.replace(/\\/g, '/');
      // First change directory
      const cdResult = await fetch_backend('cd', backendPath);
      if (cdResult) {
        // Then list contents
        const lsResult = await fetch_backend('ls');
        if (lsResult) {
          setExplorerData(lsResult);
          setPathHistory(prev => [...prev, lsResult.Path]);
        }
      }
      
      setLoading(false);
    } else {
      // For files, show dialog
      setDialog({
        visible: true,
        file: file
      });
    }
  };

  const handleBackClick = async () => {
    console.log("pathHistory: ",pathHistory)
    if (pathHistory.length > 1) {
      setLoading(true);
      
      const newHistory = [...pathHistory];
      newHistory.pop(); // Remove current path
      const previousPath = newHistory[newHistory.length - 1];
      
      // Convert Windows path format to the format expected by backend
      const backendPath = previousPath.replace(/\\/g, '/');
      
      // Change directory to previous path
      const cdResult = await fetch_backend('cd', backendPath);
      if (cdResult) {
        // Then list contents
        const lsResult = await fetch_backend('ls');
        if (lsResult) {
          setExplorerData(lsResult);
          setPathHistory(newHistory);
        }
      }
      
      setLoading(false);
    }
  };

  const handleContextMenu = (e, file) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      file: file
    });
  };

  const closeContextMenu = () => {
    setContextMenu({
      ...contextMenu,
      visible: false
    });
  };

  const handleContextAction = (action) => {
    switch(action) {
      case 'properties':
        setDialog({
          visible: true,
          file: contextMenu.file
        });
        break;
      case 'download':
        // Empty function for download
        console.log(`Downloading ${contextMenu.file.Name}`);
        break;
      default:
        break;
    }
    closeContextMenu();
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };

  return (
    <div className={`${theme.background} ${theme.text} rounded-lg shadow-lg overflow-hidden w-full max-w-6xl mx-auto h-screen  mb-10 flex flex-col`}>

    {/* Toolbar */}
    <ToolBarComponent explorerData={explorerData} pathHistory={pathHistory} loading={loading} theme={theme} handleBackClick={handleBackClick} setLoading={setLoading} setExplorerData={setExplorerData} setPathHistory={setPathHistory} fetch_backend={fetch_backend}/>
      {/* <div className={`${theme.secondary} p-2 flex items-center border-b ${theme.border}`}>
        <button 
          onClick={handleBackClick}
          disabled={pathHistory.length <= 1 || loading}
          className={`p-2 rounded ${theme.secondaryHover} mr-2 ${(pathHistory.length <= 1 || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="flex-1 bg-white rounded px-3 py-1 border border-gray-300 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
          <span className="truncate">{explorerData.Path}</span>
        </div>
      </div> */}

      {/* File Display Area */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 min-h-0">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          explorerData.files.map((file, index) => (
            <div 
              key={index}
              onClick={() => handleFileClick(file)}
              onDoubleClick={() => handleFileDoubleClick(file)}
              onContextMenu={(e) => handleContextMenu(e, file)}
              className={`flex flex-col items-center p-3 rounded-lg cursor-default ${selectedFile === file.Name ? theme.selected : ''} hover:${theme.selected}`}
            >
              <div className="w-16 h-16 flex items-center justify-center mb-2">
                {file.IsDir ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-center text-sm truncate w-full">{file.Name}</span>
            </div>
          ))
        )}
      </div>

      {/* Status Bar */}
      <div className={`${theme.secondary} p-2 text-xs border-t ${theme.border} flex justify-between`}>
        <span>{explorerData.files.length} items</span>
        <span>{explorerData.timezone} (UTC{explorerData.timezoneOffset >= 0 ? '+' : ''}{explorerData.timezoneOffset / 3600})</span>
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={closeContextMenu}
          />
          <div 
          className={`fixed z-20 ${theme.background} shadow-lg rounded-md py-1 w-48 border ${theme.border}`}
          style={{
            top: `${Math.min(contextMenu.y, window.innerHeight - 100)}px`, // prevent overflow at bottom
            left: `${contextMenu.x}px`
          }}
        >   
            <button className={`w-full text-left px-4 py-2 hover:${theme.selected}`} onClick={() => handleContextAction('download')}>Download</button>
          <button className={`w-full text-left px-4 py-2 hover:${theme.selected}`} onClick={() => handleContextAction('properties')}>Properties</button>
        </div>
        </>
      )}

      {/* File Dialog */}
      {dialog.visible && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center"
            onClick={() => setDialog({ ...dialog, visible: false })}
          >
            <div 
              className={`${theme.background} rounded-lg shadow-xl p-6 w-full max-w-md`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium mb-4">File Properties</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Name:</span> {dialog.file.Name}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {dialog.file.IsDir ? 'Folder' : 'File'}
                </div>
                {!dialog.file.IsDir && (
                  <div>
                    <span className="font-medium">Size:</span> {formatSize(dialog.file.Size)}
                  </div>
                )}
                <div>
                  <span className="font-medium">Modified:</span> {formatDate(dialog.file.ModTime)}
                </div>
                <div>
                  <span className="font-medium">Permissions:</span> {dialog.file.Mode}
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  className={`px-4 py-2 rounded ${theme.secondary} ${theme.secondaryHover}`}
                  onClick={() => setDialog({ ...dialog, visible: false })}
                >
                  Close
                </button>
                {!dialog.file.IsDir && (
                  <button 
                    className={`px-4 py-2 rounded ${theme.primary} text-white ${theme.primaryHover}`}
                    onClick={() => {
                      console.log(`Downloading ${dialog.file.Name}`);
                      setDialog({ ...dialog, visible: false });
                    }}
                  >
                    Download
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FileExplorer;