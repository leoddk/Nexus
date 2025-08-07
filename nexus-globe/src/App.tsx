import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { usePoints } from './hooks/usePoints';
import Auth from './components/Auth';
import Globe from './components/Globe';
import ControlPanel from './components/ControlPanel';
import { NexusPoint } from './types';

const App: React.FC = () => {
  const { user, profile, loading: authLoading, isAdmin, signOut } = useAuth();
  const { points, loading: pointsLoading, error: pointsError } = usePoints();
  const [selectedPoint, setSelectedPoint] = useState<NexusPoint | null>(null);

  if (authLoading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Authentication...</div>;
  }
  if (!user) {
    return <Auth />;
  }
  if (pointsError) {
    return <div className="min-h-screen bg-red-900 flex items-center justify-center text-white">Error loading points: {pointsError}</div>;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 overflow-hidden">
      <header className="bg-slate-800 text-white px-4 py-3 shadow-lg z-20 border-b border-slate-700">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-cyan-400">NEXUS Globe</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">Welcome, {profile?.email || user.email}</span>
            <div className={`px-2 py-1 rounded text-xs font-bold ${isAdmin ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white'}`}>
              {isAdmin ? 'ADMIN' : 'VIEWER'}
            </div>
            <button onClick={signOut} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm">Sign Out</button>
          </div>
        </div>
      </header>
      <main className="flex-1 relative">
        <Globe points={points} selectedPoint={selectedPoint} onPointClick={setSelectedPoint} />
        <ControlPanel points={points} selectedPoint={selectedPoint} onPointSelect={setSelectedPoint} />
        {pointsLoading && <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/70 text-white p-2 rounded-md z-30">Loading Points...</div>}
      </main>
    </div>
  );
};
export default App;