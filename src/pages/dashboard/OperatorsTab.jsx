import OperatorsList from '../../components/OperatorsList';
import ClientList from '../../components/ClientList';
import DashboardTabs from '../../components/DashboardTabs';
import { RefreshCw } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function OperatorsTab() {
  const { refreshOperators } = useDashboard();

  return (
    <div className="p-6">
      <DashboardTabs />
      
      {/* Header with refresh button */}
      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Operators & Clients</h1>
        <button
          onClick={refreshOperators}
          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors duration-200"
          title="Refresh operators"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Client List Panel */}
      <div className="mt-6">
        <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
          <ClientList />
        </div>
      </div>

      {/* Operators Panel */}
      <div className="mt-6">
        <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
          <OperatorsList />
        </div>
      </div>
    </div>
  );
} 