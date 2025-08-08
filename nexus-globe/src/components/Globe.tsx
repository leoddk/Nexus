import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { NexusPoint } from '../types';

interface GlobeProps {
  points: NexusPoint[];
  onPointClick?: (point: NexusPoint | null) => void;
  selectedPoint?: NexusPoint | null;
}

const GlobeComponent: React.FC<GlobeProps> = ({ points, onPointClick, selectedPoint }) => {
  const globeEl = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  const globePoints = useMemo(() => points.map(point => ({
    ...point,
    lat: point.latitude,
    lng: point.longitude,
    size: selectedPoint?.id === point.id ? 0.8 : 0.4,
    color: point.status === 'green' ? '#22c55e' :
           point.status === 'yellow' ? '#eab308' : '#ef4444'
  })), [points, selectedPoint]);

  const toggleAutoRotation = useCallback(() => setIsAutoRotating(prev => !prev), []);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({ 
          width: containerRef.current.clientWidth, 
          height: containerRef.current.clientHeight 
        });
      }
    };
    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (globeEl.current) {
      const controls = globeEl.current.controls();
      controls.autoRotate = !selectedPoint && isAutoRotating;
      controls.autoRotateSpeed = 0.3;
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
    }
  }, [selectedPoint, isAutoRotating]);

  const handlePointClick = (point: any) => {
    onPointClick?.(point as NexusPoint);
  };

  const handleGlobeClick = () => onPointClick?.(null);

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
    <div ref={containerRef} className="w-full h-full bg-slate-900 relative overflow-hidden">
      <div className="absolute top-2 left-2 md:top-4 md:left-4 text-cyan-300 font-mono z-10 pointer-events-none">
        <h2 className="text-lg md:text-xl font-bold mb-1">⚡ NEXUS GLOBAL STRATEGIC MAP</h2>
        <p className="text-xs md:text-sm opacity-75">Real-time Air Force Network Status</p>
      </div>
      
      <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 bg-black bg-opacity-80 text-white p-2 rounded font-mono text-xs z-10 pointer-events-none">
        Developed By Dodge Kudrna
      </div>
      
      <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 w-72 md:w-80 bg-black bg-opacity-80 text-white p-2 md:p-3 rounded border border-cyan-400 font-mono text-xs z-10 pointer-events-none">
        <h3 className="text-cyan-300 font-bold mb-2">LEGEND</h3>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
            <span>OPERATIONAL</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
            <span>WARNING</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
            <span>OFFLINE</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-600 text-gray-400">
          <span className="hidden md:inline">Click empty space to resume rotation</span>
        </div>
      </div>
      
      <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-black bg-opacity-80 rounded-lg p-1 md:p-2 z-10">
        <div className="flex flex-col space-y-1">
          <div className="flex space-x-1 md:space-x-2">
            <button 
              onClick={() => { 
                if (globeEl.current) { 
                  onPointClick?.(null); 
                  globeEl.current.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 1000); 
                } 
              }} 
              className="px-2 md:px-3 py-1 rounded text-xs font-mono bg-gray-700 text-cyan-300 hover:bg-gray-600"
            >
              Reset
            </button>
            <button 
              onClick={toggleAutoRotation} 
              className={`px-2 md:px-3 py-1 rounded text-xs font-mono ${
                isAutoRotating ? 'bg-green-700 text-green-200' : 'bg-gray-700 text-cyan-300'
              }`}
            >
              {isAutoRotating ? 'Stop' : 'Start'}
            </button>
          </div>
          <div className="text-xs text-center">
            <span className={`${
              selectedPoint ? 'text-orange-300' : 
              isAutoRotating ? 'text-green-300' : 'text-gray-400'
            }`}>
              {selectedPoint ? '🎯 Focused' : isAutoRotating ? '🔄 Rotating' : '⏸️ Paused'}
            </span>
          </div>
        </div>
      </div>
      
      {selectedPoint && (
        <div className="absolute top-20 left-2 md:left-4 bg-black bg-opacity-90 text-white p-3 rounded-lg border border-cyan-400 max-w-xs z-10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-cyan-300">{selectedPoint.name}</h3>
            <button 
              onClick={() => onPointClick?.(null)} 
              className="text-gray-400 hover:text-white ml-2"
            >
              &#x2715;
            </button>
          </div>
          {selectedPoint.description && (
            <p className="text-sm text-gray-300 mb-2">{selectedPoint.description}</p>
          )}
          <div className="text-xs text-cyan-400 space-y-1">
            <div>📍 {selectedPoint.latitude.toFixed(4)}°, {selectedPoint.longitude.toFixed(4)}°</div>
            <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              selectedPoint.status === 'green' ? 'bg-green-600 text-green-100' : 
              selectedPoint.status === 'yellow' ? 'bg-yellow-600 text-yellow-100' : 
              'bg-red-600 text-red-100'
            }`}>
              {selectedPoint.status.toUpperCase()}
            </div>
          </div>
        </div>
      )}
      
      {dimensions.width > 0 && (
        <Globe
          ref={globeEl}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          pointsData={globePoints}
          pointAltitude={0.01}
          pointColor="color"
          pointRadius="size"
          pointLabel={(point: any) => `<div style="background:rgba(0,0,0,0.8);color:white;padding:5px;border-radius:3px;"><b>${point.name}</b><br/>${point.status.toUpperCase()}</div>`}
          onPointClick={handlePointClick}
          onGlobeClick={handleGlobeClick}
          width={dimensions.width}
          height={dimensions.height}
        />
      )}
    </div>
  );
};

export default GlobeComponent;