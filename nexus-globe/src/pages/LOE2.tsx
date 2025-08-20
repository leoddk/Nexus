import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { TaskStatus } from '../types/eee';

const LOE2: React.FC = () => {
  const { isAdmin } = useAuth();
  const [selectedView, setSelectedView] = useState<'dashboard' | 'indicators' | 'events'>('dashboard');
  // const [selectedEvent, setSelectedEvent] = useState<string | null>(null); // TODO: Will be used for event management

  // Mock data - replace with real data hooks later
  const mockStats = {
    totalIndicators: 24,
    successfulIndicators: 18,
    inProgressIndicators: 4,
    failedIndicators: 2,
    totalMOEs: 72,
    totalComponents: 156,
    avgTimeToComplete: 45,
    mostUsedTools: ['Network Scanner', 'Comm Relay', 'Data Processor'],
    problematicNetworks: ['SIPR-A', 'JWICS-B']
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'successful': return 'text-green-400 bg-green-900/30 border-green-500/50';
      case 'unsuccessful': return 'text-red-400 bg-red-900/30 border-red-500/50';
      case 'in-progress': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-500/50';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'successful': return '✅';
      case 'unsuccessful': return '❌';
      case 'in-progress': return '⏳';
      default: return '⭕';
    }
  };

  return (
    <div className="flex-1 bg-slate-900 text-white overflow-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-green-400 mb-2">EEE Progress Dashboard</h1>
            <p className="text-xl text-gray-300">Exercise, Events & Experiments Tracking</p>
          </div>
          {isAdmin && (
            <div className="flex space-x-2">
              <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                + New Event
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                + Add Indicator
              </button>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-slate-800 p-1 rounded-lg w-fit">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'indicators', label: 'Indicators', icon: '🎯' },
            { id: 'events', label: 'EEE Events', icon: '📅' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedView(tab.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                selectedView === tab.id
                  ? 'bg-green-600 text-white'
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dashboard View */}
        {selectedView === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400">Total Indicators</h3>
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="text-3xl font-bold text-green-400">{mockStats.totalIndicators}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {mockStats.successfulIndicators} successful, {mockStats.failedIndicators} failed
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400">MOEs</h3>
                  <span className="text-2xl">📈</span>
                </div>
                <div className="text-3xl font-bold text-green-400">{mockStats.totalMOEs}</div>
                <div className="text-sm text-gray-500 mt-1">Measures of Effectiveness</div>
              </div>

              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400">Components</h3>
                  <span className="text-2xl">⚙️</span>
                </div>
                <div className="text-3xl font-bold text-green-400">{mockStats.totalComponents}</div>
                <div className="text-sm text-gray-500 mt-1">Tools, Networks, Processes</div>
              </div>

              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400">Avg Time</h3>
                  <span className="text-2xl">⏱️</span>
                </div>
                <div className="text-3xl font-bold text-green-400">{mockStats.avgTimeToComplete}m</div>
                <div className="text-sm text-gray-500 mt-1">Task completion time</div>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-xl font-semibold text-green-400 mb-4">Success Rate Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Successful</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: `${(mockStats.successfulIndicators / mockStats.totalIndicators) * 100}%`}}></div>
                      </div>
                      <span className="text-green-400 text-sm font-medium">{Math.round((mockStats.successfulIndicators / mockStats.totalIndicators) * 100)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">In Progress</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${(mockStats.inProgressIndicators / mockStats.totalIndicators) * 100}%`}}></div>
                      </div>
                      <span className="text-yellow-400 text-sm font-medium">{Math.round((mockStats.inProgressIndicators / mockStats.totalIndicators) * 100)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Failed</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{width: `${(mockStats.failedIndicators / mockStats.totalIndicators) * 100}%`}}></div>
                      </div>
                      <span className="text-red-400 text-sm font-medium">{Math.round((mockStats.failedIndicators / mockStats.totalIndicators) * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-xl font-semibold text-green-400 mb-4">Component Analysis</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Most Used Tools</h4>
                    <div className="space-y-1">
                      {mockStats.mostUsedTools.map((tool, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm">
                          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                          <span className="text-gray-300">{tool}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Problematic Networks</h4>
                    <div className="space-y-1">
                      {mockStats.problematicNetworks.map((network, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm">
                          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                          <span className="text-gray-300">{network}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Indicators View */}
        {selectedView === 'indicators' && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-green-400">NEXUS Progress Indicators</h3>
                {isAdmin && (
                  <button className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm">
                    + Add Indicator
                  </button>
                )}
              </div>

              {/* Sample Indicator */}
              <div className="bg-slate-700 rounded-lg p-4 mb-4 border border-slate-600">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-medium text-white mb-1">Communication Interoperability</h4>
                    <p className="text-gray-400 text-sm">Multi-domain communication across all network types</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor('in-progress')}`}>
                    {getStatusIcon('in-progress')} In Progress
                  </div>
                </div>

                {/* MOEs */}
                <div className="pl-4 border-l-2 border-green-500/30">
                  <h5 className="text-sm font-medium text-green-300 mb-2">Measures of Effectiveness (MOEs)</h5>
                  <div className="space-y-3">
                    <div className="bg-slate-600 rounded p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white text-sm font-medium">Cross-Network Message Delivery</span>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor('successful')}`}>✅ 95%</span>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">Target: 90% | Current: 95%</div>
                      
                      {/* Implementation Components */}
                      <div className="pl-3 border-l border-gray-500">
                        <div className="text-xs text-gray-300 mb-1">Implementation Components:</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span>📡 SATCOM Relay</span>
                            <span className="text-green-400">✅ Working</span>
                          </div>
                          <div className="flex justify-between">
                            <span>🔗 SIPR Network</span>
                            <span className="text-yellow-400">⏳ Testing</span>
                          </div>
                          <div className="flex justify-between">
                            <span>📞 Voice Bridge</span>
                            <span className="text-green-400">✅ Working</span>
                          </div>
                          <div className="flex justify-between">
                            <span>💬 Chat Integration</span>
                            <span className="text-red-400">❌ Failed</span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          Avg Time: 12 min | Tasks: 45/50 completed
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events View */}
        {selectedView === 'events' && (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-400">EEE Events</h3>
              {isAdmin && (
                <button className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm">
                  + New Event
                </button>
              )}
            </div>
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-4">📅</div>
              <p>Event management interface coming soon...</p>
              <p className="text-sm mt-2">This will show active exercises, events, and experiments with their associated indicators.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LOE2;