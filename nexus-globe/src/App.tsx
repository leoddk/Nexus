import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Auth from './components/Auth';
import Navigation from './components/Navigation';
import Homepage from './components/Homepage';
import LOE1 from './pages/LOE1';
import LOE2 from './pages/LOE2';
import LOE3 from './pages/LOE3';

const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-xl mb-2">Loading Authentication...</div>
          <div className="text-sm text-gray-400">Connecting to Supabase...</div>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show auth screen if no user
  if (!user) {
    return <Auth />;
  }

  return (
    <Router>
      <div className="h-screen w-screen flex flex-col bg-slate-900 overflow-hidden">
        <Navigation />
        <main className="flex-1 relative">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/loe1" element={<LOE1 />} />
            <Route path="/loe2" element={<LOE2 />} />
            <Route path="/loe3" element={<LOE3 />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;