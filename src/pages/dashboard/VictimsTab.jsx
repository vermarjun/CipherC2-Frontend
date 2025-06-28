import VictimsList from '../../components/VictimsList';
import DashboardTabs from '../../components/DashboardTabs';
import { RefreshCw } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function VictimsTab() {
  const { refreshSessions } = useDashboard();

  return (
    <div className="p-6">
      <DashboardTabs />
      
      {/* Header with refresh button */}
      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Victim Devices</h1>
        <button
          onClick={refreshSessions}
          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors duration-200"
          title="Refresh devices"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Victims Panel */}
      <div className="mt-6">
        <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
          <VictimsList />
        </div>
      </div>
    </div>
  );
} 