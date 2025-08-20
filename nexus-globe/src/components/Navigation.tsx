import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isAdmin, signOut } = useAuth();

  const tabs = [
    { path: '/', label: 'Home', active: location.pathname === '/' },
    { path: '/loe1', label: 'LOE 1: Architecture', active: location.pathname === '/loe1' },
    { path: '/loe2', label: 'LOE 2: Airmen', active: location.pathname === '/loe2' },
    { path: '/loe3', label: 'LOE 3: AAA', active: location.pathname === '/loe3' }
  ];

  return (
    <header className="bg-slate-800 text-white px-4 py-3 shadow-lg z-20 border-b border-slate-700">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <h1 
            className="text-xl font-bold text-cyan-400 cursor-pointer hover:text-cyan-300 transition-colors"
            onClick={() => navigate('/')}
          >
            NEXUS
          </h1>
          <nav className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  tab.active
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">Welcome, {profile?.email || user.email}</span>
            <div className={`px-2 py-1 rounded text-xs font-bold ${isAdmin ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white'}`}>
              {isAdmin ? 'ADMIN' : 'VIEWER'}
            </div>
            <button onClick={signOut} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors">
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;