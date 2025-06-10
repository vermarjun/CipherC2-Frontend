import { useState, useEffect } from 'react';
import { Settings, Play, Database, Shield, RefreshCw } from 'lucide-react';
import api from '../../api';
import DashboardTabs from '../../components/DashboardTabs';
import ListenerPanel from '../../components/ListenersPanel';
import GeneratePanel from '../../components/GeneratePanel';
import ClientSettingsPanel from '../../components/ClientSettingsPanel';
import JobsList from '../../components/JobsList';

export default function OperationsTab() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/jobs');
      setJobs(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // Refresh jobs every 30 seconds
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <DashboardTabs />
        <div className="mt-6 space-y-6">
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800 animate-pulse">
            <div className="h-6 bg-neutral-800 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-neutral-800 rounded w-3/4"></div>
              <div className="h-4 bg-neutral-800 rounded w-1/2"></div>
            </div>
          </div>
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800 animate-pulse">
            <div className="h-6 bg-neutral-800 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-neutral-800 rounded w-3/4"></div>
              <div className="h-4 bg-neutral-800 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <DashboardTabs />
        <div className="mt-6 bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <DashboardTabs />
      
      {/* Header with refresh button */}
      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Operations</h1>
        <button
          onClick={fetchJobs}
          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors duration-200"
          title="Refresh operations"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Operations grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jobs Panel */}
        <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
          <div className="flex items-center space-x-2 mb-4">
            <Play className="w-5 h-5 text-neutral-400" />
            <h2 className="text-lg font-semibold text-white">Active Jobs</h2>
          </div>
          <JobsList 
            jobs={jobs} 
            setJobs={setJobs} 
            isConnected={true} 
            setIsConnected={() => {}}
          />
        </div>

        {/* C2 Management Panel */}
        <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-neutral-400" />
            <h2 className="text-lg font-semibold text-white">C2 Lifecycle Management</h2>
          </div>
          <div className="space-y-6">
            <ListenerPanel jobs={jobs} />
            <GeneratePanel />
            <ClientSettingsPanel />
          </div>
        </div>
      </div>
    </div>
  );
} 