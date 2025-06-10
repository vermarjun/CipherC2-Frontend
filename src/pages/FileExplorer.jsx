import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function FileExplorer() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath, sessionId]);

  const fetchFiles = async (path) => {
    try {
      setError(null);
      setLoading(true);
      const response = await api.get(`/sessions/${sessionId}/files`, {
        params: { path }
      });
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError(error.response?.data?.detail || 'Failed to fetch files');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = async (file) => {
    if (file.type === 'directory') {
      setCurrentPath(file.path);
      setSelectedFile(null);
      setFileContent(null);
    } else {
      setSelectedFile(file);
      try {
        setLoading(true);
        const response = await api.get(`/sessions/${sessionId}/files`, {
          params: { 
            path: file.path,
            download: true
          },
          responseType: 'blob'
        });
        setFileContent(URL.createObjectURL(response.data));
      } catch (error) {
        console.error('Error fetching file content:', error);
        setError(error.response?.data?.detail || 'Failed to fetch file content');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDownload = async (file) => {
    try {
      setIsDownloading(true);
      const response = await api.get(`/sessions/${sessionId}/files`, {
        params: { 
          path: file.path,
          download: true
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
      setError(error.response?.data?.detail || 'Failed to download file');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBack = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    setCurrentPath(parentPath);
  };

  if (loading && !files.length) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">File Explorer</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            disabled={currentPath === '/'}
            className={`px-4 py-2 rounded-lg ${
              currentPath === '/' 
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Back
          </button>
          <div className="text-sm text-gray-400">
            Session ID: {sessionId}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/90 text-red-100 px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* File List */}
        <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
          <h2 className="text-lg font-semibold mb-4">Files</h2>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.path}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                  selectedFile?.path === file.path
                    ? 'bg-blue-600/20 border border-blue-600/50'
                    : 'hover:bg-neutral-800 border border-transparent'
                }`}
                onClick={() => handleFileClick(file)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">
                    {file.type === 'directory' ? '📁' : '📄'}
                  </span>
                  <span className="text-white">{file.name}</span>
                </div>
                {file.type === 'file' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(file);
                    }}
                    disabled={isDownloading}
                    className={`px-3 py-1 rounded ${
                      isDownloading
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isDownloading ? 'Downloading...' : 'Download'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* File Preview */}
        {selectedFile && (
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Preview</h2>
              <span className="text-sm text-gray-400">
                {selectedFile.name}
              </span>
            </div>
            {fileContent ? (
              <div className="bg-neutral-950 rounded-lg p-4 h-[calc(100vh-20rem)] overflow-auto">
                <iframe
                  src={fileContent}
                  className="w-full h-full"
                  title="File Preview"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[calc(100vh-20rem)]">
                <div className="text-gray-400">Select a file to preview</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 