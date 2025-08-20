import React, { useState } from 'react';
import { usePoints } from '../hooks/usePoints';
import Globe from '../components/Globe';
import ControlPanel from '../components/ControlPanel';
import { NexusPoint } from '../types';

const LOE1: React.FC = () => {
  const { points, loading: pointsLoading, error: pointsError } = usePoints();
  const [selectedPoint, setSelectedPoint] = useState<NexusPoint | null>(null);

  if (pointsError) {
    return (
      <div className="min-h-screen bg-red-900 flex items-center justify-center text-white">
        Error loading points: {pointsError}
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <Globe points={points} selectedPoint={selectedPoint} onPointClick={setSelectedPoint} />
      <ControlPanel points={points} selectedPoint={selectedPoint} onPointSelect={setSelectedPoint} />
      {pointsLoading && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/70 text-white p-2 rounded-md z-30">
          Loading Points...
        </div>
      )}
    </div>
  );
};

export default LOE1;