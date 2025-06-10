import { useState, useEffect } from "react";
import SessionsList from "../components/SessionsList";
import OperatorsList from "../components/OperatorsList";
import JobsList from "../components/JobsList";
import ListenerPanel from "../components/ListenersPanel";
import GeneratePanel from "../components/GeneratePanel";
import ClientSettingsPanel from "../components/ClientSettingsPanel";
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  // Check connection state on mount and periodically
  useEffect(() => {
    const checkConnectionState = async () => {
      try {
        const response = await api.get('/connected');
        setIsConnected(response.data);
      } catch (error) {
        console.error('Error checking connection state:', error);
        setIsConnected(false);
      }
    };

    // Check immediately
    checkConnectionState();

    // Then check every 30 seconds
    const interval = setInterval(checkConnectionState, 30000);

    return () => clearInterval(interval);
  }, []);

  // If not connected, show a minimal welcome message
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] space-y-6">
        <p className="text-gray-400 text-lg">Please connect to a server using the connect button in the navbar to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm text-gray-400">Connected</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Jobs and C2 Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
            <h2 className="text-lg font-semibold mb-4 text-white">Jobs</h2>
            <JobsList 
              jobs={jobs} 
              setJobs={setJobs} 
              isConnected={isConnected} 
              setIsConnected={setIsConnected}
            />
          </div>

          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
            <h2 className="text-lg font-semibold mb-4 text-white">C2 Lifecycle Management</h2>
            <div className="space-y-4">
              <ListenerPanel jobs={jobs} />
              <GeneratePanel />
              <ClientSettingsPanel />
            </div>
          </div>
        </div>

        {/* Right Column - Sessions and Operators */}
        <div className="space-y-6">
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
            <h2 className="text-lg font-semibold mb-4 text-white">Active Sessions</h2>
            <SessionsList 
              isConnected={isConnected} 
              setIsConnected={setIsConnected}
            />
          </div>

          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
            <h2 className="text-lg font-semibold mb-4 text-white">Operators</h2>
            <OperatorsList 
              isConnected={isConnected} 
              setIsConnected={setIsConnected}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 