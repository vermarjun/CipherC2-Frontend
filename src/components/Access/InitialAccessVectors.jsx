import { useState } from 'react';
import axios from 'axios';
import { Download, AlertCircle, FileCode, FileText } from 'lucide-react';

function HTASmuggling() {
  const [isLoading, setIsLoading] = useState(false);
  const [zipFile, setZipFile] = useState(null);
  const [error, setError] = useState(null);
  const [zipName, setZipName] = useState('hta_smuggle');
  const [implantName, setImplantName] = useState('implant.exe');

  const generateHTAZip = async () => {
    if (!zipName || !implantName) {
      setError('Please provide both ZIP name and implant name');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8000/generatezip/', {
        params: {
          zipname: zipName,
          implant_name: implantName
        },
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      setZipFile(url);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate HTA ZIP file');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadZip = () => {
    if (zipFile) {
      const link = document.createElement('a');
      link.href = zipFile;
      link.download = `${zipName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 transition-all duration-200 hover:border-neutral-700">
      <div className="flex items-start space-x-4">
        <div className="p-3 rounded-lg bg-neutral-800 text-blue-400">
          <FileCode className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-lg text-gray-100">HTA ZIP Smuggling</h3>
          <p className="text-sm text-gray-400 mt-2">
            Generate a ZIP file containing an HTA payload for initial access.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ZIP File Name
              </label>
              <input
                type="text"
                value={zipName}
                onChange={(e) => setZipName(e.target.value)}
                placeholder="Enter ZIP file name..."
                className="w-full px-4 py-2.5 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Implant Name
              </label>
              <input
                type="text"
                value={implantName}
                onChange={(e) => setImplantName(e.target.value)}
                placeholder="Enter implant name..."
                className="w-full px-4 py-2.5 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-sm"
              />
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <button
              type="button"
              onClick={generateHTAZip}
              disabled={isLoading || !zipName || !implantName}
              className={`inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg transition-colors duration-200 ${
                isLoading || !zipName || !implantName
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-blue-600/90 hover:bg-blue-600 text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate HTA ZIP'
              )}
            </button>
            
            {zipFile && (
              <button
                type="button"
                onClick={downloadZip}
                className="inline-flex items-center px-5 py-2.5 border border-neutral-700 text-sm font-medium rounded-lg text-blue-400 bg-neutral-800/50 hover:bg-neutral-800 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Download ZIP
              </button>
            )}
          </div>
          
          {error && (
            <div className="mt-4 rounded-lg bg-red-900/20 p-4 border border-red-800/50">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-400">Error</h3>
                  <div className="mt-1 text-sm text-red-300">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function INKSmuggling() {
  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 transition-all duration-200 hover:border-neutral-700">
      <div className="flex items-start space-x-4">
        <div className="p-3 rounded-lg bg-neutral-800 text-purple-400">
          <FileText className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-lg text-gray-100">INK Smuggling</h3>
          <p className="text-sm text-gray-400 mt-2">
            Generate an INK file for initial access (Coming soon).
          </p>
          <div className="mt-6">
            <button
              type="button"
              disabled
              className="inline-flex items-center px-5 py-2.5 border border-neutral-700 text-sm font-medium rounded-lg bg-neutral-800/50 text-neutral-500 cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InitialAccessVectors() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      <HTASmuggling />
      <INKSmuggling />
    </div>
  );
} 