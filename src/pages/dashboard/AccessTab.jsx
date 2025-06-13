import DashboardTabs from '../../components/DashboardTabs';
import { RefreshCw } from 'lucide-react';
import InitialAccessVectors from '../../components/Access/InitialAccessVectors';
import Loaders from '../../components/Access/Loaders';
import { useState } from 'react';

export default function AccessTab() {
  const [activeTab, setActiveTab] = useState('vectors');

  return (
    <div className="p-6">
      <DashboardTabs />
      
      {/* Header with refresh button */}
      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Access</h1>
        <button
          onClick={() => window.location.reload()}
          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors duration-200"
          title="Refresh access"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Access Tabs */}
      <div className="mt-6">
        <div className="border-b border-neutral-800">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('vectors')}
              className={`${
                activeTab === 'vectors'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-300 hover:border-neutral-700'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Initial Access Vectors
            </button>
            <button
              onClick={() => setActiveTab('loaders')}
              className={`${
                activeTab === 'loaders'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-300 hover:border-neutral-700'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Loaders
            </button>
          </nav>
        </div>

        {/* Content Panels */}
        <div className="mt-6 space-y-6">
          {activeTab === 'vectors' ? (
            <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
              <InitialAccessVectors />
            </div>
          ) : (
            <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
              <Loaders />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 