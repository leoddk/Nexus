import React, { useRef, useEffect } from 'react';
import Globe from 'react-globe.gl';
import { NexusPoint } from '../types';

interface GlobeProps {
  points: NexusPoint[];
  onPointClick?: (point: NexusPoint) => void;
  selectedPoint?: NexusPoint | null;
}

const GlobeComponent: React.FC<GlobeProps> = ({ points, onPointClick, selectedPoint }) => {
  const globeEl = useRef<any>(null); // Fixed: added null as initial value

  // Convert points to format expected by react-globe.gl
  const globePoints = points.map(point => ({
    ...point,
    lat: point.latitude,
    lng: point.longitude,
    size: selectedPoint?.id === point.id ? 1.5 : 1,
    color: point.status === 'green' ? '#22c55e' : 
           point.status === 'yellow' ? '#eab308' : '#ef4444'
  }));

  // Auto-rotate the globe
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  // Focus on selected point
  useEffect(() => {
    if (selectedPoint && globeEl.current) {
      globeEl.current.pointOfView({
        lat: selectedPoint.latitude,
        lng: selectedPoint.longitude,
        altitude: 2
      }, 1000);
    }
  }, [selectedPoint]);

  return (
    <div className="w-full h-full bg-slate-900 relative">
      {/* Strategic Header */}
      <div className="absolute top-4 left-4 text-cyan-300 font-mono z-10">
        <h2 className="text-xl font-bold mb-1">⚡ NEXUS GLOBAL STRATEGIC MAP</h2>
        <p className="text-sm opacity-75">Real-time Air Force Network Status</p>
        <div className="mt-2 text-xs space-y-1">
          <div>🟢 OPERATIONAL: {points.filter(p => p.status === 'green').length}</div>
          <div>🟡 WARNING: {points.filter(p => p.status === 'yellow').length}</div>
          <div>🔴 OFFLINE: {points.filter(p => p.status === 'red').length}</div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded border border-cyan-400 font-mono text-xs z-10">
        <h3 className="text-cyan-300 font-bold mb-2">LEGEND</h3>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>OPERATIONAL</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>WARNING</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>OFFLINE</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-600 text-gray-400">
          Drag to rotate • Scroll to zoom • Click markers for details
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-80 rounded-lg p-2 z-10">
        <div className="flex space-x-2">
          <button
            onClick={() => {
              if (globeEl.current) {
                globeEl.current.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 1000);
              }
            }}
            className="px-3 py-1 rounded text-xs font-mono bg-gray-700 text-cyan-300 hover:bg-gray-600 transition-colors"
          >
            Reset View
          </button>
          <button
            onClick={() => {
              if (globeEl.current) {
                const controls = globeEl.current.controls();
                controls.autoRotate = !controls.autoRotate;
              }
            }}
            className="px-3 py-1 rounded text-xs font-mono bg-gray-700 text-cyan-300 hover:bg-gray-600 transition-colors"
          >
            Toggle Rotation
          </button>
        </div>
      </div>

      {/* React Globe GL */}
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        // Points configuration
        pointsData={globePoints}
        pointAltitude={0.01}
        pointColor="color"
        pointRadius="size"
        pointLabel={(point: any) => `
          <div style="
            background: rgba(0,0,0,0.9); 
            color: white; 
            padding: 8px; 
            border-radius: 4px; 
            border: 1px solid #00bcd4;
            font-family: monospace;
          ">
            <div style="color: #00bcd4; font-weight: bold;">${point.name}</div>
            <div style="font-size: 12px; margin-top: 4px;">${point.description || ''}</div>
            <div style="font-size: 11px; margin-top: 4px; color: #ccc;">
              📍 ${point.lat.toFixed(4)}°, ${point.lng.toFixed(4)}°
            </div>
            <div style="
              margin-top: 4px; 
              padding: 2px 6px; 
              border-radius: 2px; 
              font-size: 10px;
              background: ${point.status === 'green' ? '#22c55e' : 
                          point.status === 'yellow' ? '#eab308' : '#ef4444'};
              color: white;
            ">
              ${point.status.toUpperCase()}
            </div>
          </div>
        `}
        onPointClick={(point: any) => {
          if (onPointClick) {
            onPointClick(point);
          }
        }}
        
        // Animation and interaction
        animateIn={true}
        waitForGlobeReady={true}
        
        // Styling
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  );
};

export default GlobeComponent;