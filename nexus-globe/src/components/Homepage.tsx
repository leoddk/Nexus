import React from 'react';
import { useNavigate } from 'react-router-dom';

const Homepage: React.FC = () => {
  const navigate = useNavigate();

  const loeData = [
    {
      id: 'loe1',
      title: 'LOE 1: Architecture',
      description: 'Explore and manage global architecture points and connections',
      path: '/loe1',
      bgColor: 'bg-gradient-to-br from-blue-600 to-blue-800',
      hoverColor: 'hover:from-blue-500 hover:to-blue-700'
    },
    {
      id: 'loe2',
      title: 'LOE 2: Airmen',
      description: 'Personnel management and airmen resources',
      path: '/loe2',
      bgColor: 'bg-gradient-to-br from-green-600 to-green-800',
      hoverColor: 'hover:from-green-500 hover:to-green-700'
    },
    {
      id: 'loe3',
      title: 'LOE 3: AAA',
      description: 'Augmentation, Automation, and Artificial Intelligence',
      path: '/loe3',
      bgColor: 'bg-gradient-to-br from-purple-600 to-purple-800',
      hoverColor: 'hover:from-purple-500 hover:to-purple-700'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-cyan-400 mb-4">NEXUS</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A comprehensive platform for managing architecture, airmen, and advanced automation systems.
            Choose your line of effort to get started.
          </p>
        </div>

        {/* LOE Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {loeData.map((loe) => (
            <div
              key={loe.id}
              onClick={() => navigate(loe.path)}
              className={`${loe.bgColor} ${loe.hoverColor} rounded-lg p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-slate-700 hover:border-slate-500`}
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">{loe.title}</h2>
                <p className="text-gray-200 mb-6 leading-relaxed">{loe.description}</p>
                <div className="inline-flex items-center text-white font-semibold">
                  <span>Enter</span>
                  <svg
                    className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-20 text-center">
          <div className="bg-slate-800 rounded-lg p-8 max-w-4xl mx-auto border border-slate-700">
            <h3 className="text-2xl font-bold text-cyan-400 mb-4">Welcome to NEXUS</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">Architecture</h4>
                <p className="text-sm">Visualize and manage global infrastructure connections and points of interest.</p>
              </div>
              <div>
                <h4 className="font-semibold text-green-400 mb-2">Airmen</h4>
                <p className="text-sm">Comprehensive personnel management and resource allocation tools.</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">AAA Systems</h4>
                <p className="text-sm">Advanced automation and AI-powered augmentation capabilities.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;