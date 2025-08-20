import React from 'react';

const LOE2: React.FC = () => {
  return (
    <div className="flex-1 bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-400 mb-4">LOE 2: Airmen</h1>
          <p className="text-xl text-gray-300">Personnel Management and Resource Allocation</p>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
          <h2 className="text-2xl font-semibold text-green-400 mb-4">Coming Soon</h2>
          <p className="text-gray-300 mb-6">
            This section will contain tools and functionality for managing airmen resources, 
            personnel allocation, and workforce optimization.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-700 rounded p-4">
              <h3 className="font-semibold text-green-300 mb-2">Personnel Dashboard</h3>
              <p className="text-sm text-gray-400">View and manage airmen assignments and availability</p>
            </div>
            <div className="bg-slate-700 rounded p-4">
              <h3 className="font-semibold text-green-300 mb-2">Resource Allocation</h3>
              <p className="text-sm text-gray-400">Optimize personnel distribution across missions</p>
            </div>
            <div className="bg-slate-700 rounded p-4">
              <h3 className="font-semibold text-green-300 mb-2">Training Management</h3>
              <p className="text-sm text-gray-400">Track training progress and certifications</p>
            </div>
            <div className="bg-slate-700 rounded p-4">
              <h3 className="font-semibold text-green-300 mb-2">Deployment Planning</h3>
              <p className="text-sm text-gray-400">Plan and coordinate personnel deployments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LOE2;