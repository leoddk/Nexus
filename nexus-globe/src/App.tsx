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
  const [globeError, setGlobeError] = useState<string | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-blue-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading NEXUS Globe...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (pointsError) {
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Database Error</h2>
          <p className="text-gray-700 mb-4">Failed to load points:</p>
          <p className="text-sm text-red-500 mb-4">{pointsError}</p>
          <button
            onClick={signOut}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-blue-800 text-white px-6 py-4 shadow-lg z-20">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">NEXUS Globe</h1>
            <span className="text-sm opacity-75">Air Force Global Status Monitor</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="opacity-75">Welcome, </span>
              <span className="font-medium">{profile?.email || user.email}</span>
            </div>
            
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              isAdmin 
                ? 'bg-yellow-500 bg-opacity-20 text-yellow-200' 
                : 'bg-blue-500 bg-opacity-20 text-blue-200'
            }`}>
              {isAdmin ? 'ADMIN' : 'VIEWER'}
            </div>
            
            <button
              onClick={signOut}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative">
        {pointsLoading ? (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="text-white text-lg">Loading connection points...</div>
          </div>
        ) : globeError ? (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md">
              <h2 className="text-xl font-bold text-red-600 mb-4">Globe Error</h2>
              <p className="text-gray-700 mb-4">Failed to load the 3D globe:</p>
              <p className="text-sm text-red-500 mb-4">{globeError}</p>
              <button
                onClick={() => setGlobeError(null)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
              >
                Retry
              </button>
              <button
                onClick={signOut}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Globe with error boundary */}
            <div className="w-full h-full">
              <ErrorBoundary onError={setGlobeError}>
                <Globe 
                  points={points}
                  selectedPoint={selectedPoint}
                  onPointClick={setSelectedPoint}
                />
              </ErrorBoundary>
            </div>
            
            {/* Control Panel */}
            <ControlPanel
              points={points}
              selectedPoint={selectedPoint}
              onPointSelect={setSelectedPoint}
            />
            
            {/* Status Bar */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
              <div className="text-sm">
                Total Points: {points.length} | 
                Online: {points.filter(p => p.status === 'green').length} | 
                Warning: {points.filter(p => p.status === 'yellow').length} | 
                Offline: {points.filter(p => p.status === 'red').length}
                {selectedPoint && (
                  <span className="ml-2 text-blue-300">
                    | Selected: {selectedPoint.name}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: string) => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Globe Error:', error, errorInfo);
    this.props.onError(error.message || 'Unknown globe error');
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

export default App;