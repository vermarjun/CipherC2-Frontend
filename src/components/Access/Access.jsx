import { useState } from 'react';
import InitialAccessVectors from './InitialAccessVectors';
import Loaders from './Loaders';

export default function Access() {
  const [activeTab, setActiveTab] = useState('vectors');

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-neutral-100">Access</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Manage initial access vectors and loaders for your operations.
          </p>
        </div>
      </div>

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

        <div className="mt-6">
          {activeTab === 'vectors' ? <InitialAccessVectors /> : <Loaders />}
        </div>
      </div>
    </div>
  );
} 