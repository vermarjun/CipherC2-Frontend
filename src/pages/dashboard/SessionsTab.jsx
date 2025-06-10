import SessionsList from '../../components/SessionsList';
import DashboardTabs from '../../components/DashboardTabs';
import { RefreshCw } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function SessionsTab() {
  const { refreshSessions } = useDashboard();

  return (
    <div className="p-6">
      <DashboardTabs />
      
      {/* Header with refresh button */}
      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Sessions</h1>
        <button
          onClick={refreshSessions}
          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors duration-200"
          title="Refresh sessions"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Sessions Panel */}
      <div className="mt-6">
        <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
          <SessionsList />
        </div>
      </div>
    </div>
  );
} 