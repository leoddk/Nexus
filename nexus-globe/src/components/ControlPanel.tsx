import React, { useState } from 'react';
import { NexusPoint } from '../types';
import { usePoints } from '../hooks/usePoints';
import { useAuth } from '../hooks/useAuth';

interface ControlPanelProps {
  points: NexusPoint[];
  selectedPoint: NexusPoint | null;
  onPointSelect: (point: NexusPoint | null) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  points,
  selectedPoint,
  onPointSelect,
}) => {
  const { isAdmin } = useAuth();
  const { addPoint, updatePoint, deletePoint } = usePoints();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPoint, setEditingPoint] = useState<NexusPoint | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    status: 'green' as 'green' | 'yellow' | 'red',
  });

  const statusCounts = points.reduce(
    (acc, point) => {
      acc[point.status]++;
      return acc;
    },
    { green: 0, yellow: 0, red: 0 }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const pointData = {
      name: formData.name,
      description: formData.description,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      status: formData.status,
    };

    if (editingPoint) {
      await updatePoint(editingPoint.id, pointData);
      setEditingPoint(null);
    } else {
      await addPoint(pointData);
      setShowAddForm(false);
    }

    setFormData({
      name: '',
      description: '',
      latitude: '',
      longitude: '',
      status: 'green',
    });
  };

  const handleEdit = (point: NexusPoint) => {
    setFormData({
      name: point.name,
      description: point.description || '',
      latitude: point.latitude.toString(),
      longitude: point.longitude.toString(),
      status: point.status,
    });
    setEditingPoint(point);
    setShowAddForm(true);
  };

  const handleDelete = async (point: NexusPoint) => {
    if (window.confirm(`Are you sure you want to delete "${point.name}"?`)) {
      await deletePoint(point.id);
      if (selectedPoint?.id === point.id) {
        onPointSelect(null);
      }
    }
  };

  const handleStatusChange = async (point: NexusPoint, newStatus: 'green' | 'yellow' | 'red') => {
    await updatePoint(point.id, { status: newStatus });
  };

  return (
    <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-lg z-10 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-air-force-blue">NEXUS Control Panel</h2>
        
        {/* Status Overview */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-green-100 p-2 rounded text-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
            <div className="text-sm font-medium">{statusCounts.green}</div>
            <div className="text-xs text-gray-600">Online</div>
          </div>
          <div className="bg-yellow-100 p-2 rounded text-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-1"></div>
            <div className="text-sm font-medium">{statusCounts.yellow}</div>
            <div className="text-xs text-gray-600">Warning</div>
          </div>
          <div className="bg-red-100 p-2 rounded text-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1"></div>
            <div className="text-sm font-medium">{statusCounts.red}</div>
            <div className="text-xs text-gray-600">Offline</div>
          </div>
        </div>
      </div>

      {/* Add Point Button */}
      {isAdmin && (
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingPoint(null);
              setFormData({
                name: '',
                description: '',
                latitude: '',
                longitude: '',
                status: 'green',
              });
            }}
            className="w-full bg-air-force-blue text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            {showAddForm ? 'Cancel' : 'Add New Point'}
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      {isAdmin && showAddForm && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-medium mb-3">
            {editingPoint ? 'Edit Point' : 'Add New Point'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Point Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded text-sm"
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full p-2 border rounded text-sm"
                required
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full p-2 border rounded text-sm"
                required
              />
            </div>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="green">Online (Green)</option>
              <option value="yellow">Warning (Yellow)</option>
              <option value="red">Offline (Red)</option>
            </select>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors text-sm"
            >
              {editingPoint ? 'Update Point' : 'Add Point'}
            </button>
          </form>
        </div>
      )}

      {/* Points List */}
      <div className="p-4">
        <h3 className="font-medium mb-3">Connection Points ({points.length})</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {points.map((point) => (
            <div
              key={point.id}
              className={`p-3 border rounded cursor-pointer transition-colors ${
                selectedPoint?.id === point.id
                  ? 'border-air-force-blue bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onPointSelect(point)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      point.status === 'green'
                        ? 'bg-green-500'
                        : point.status === 'yellow'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                  ></div>
                  <span className="font-medium text-sm">{point.name}</span>
                </div>
                
                {isAdmin && (
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(point, 'green');
                      }}
                      className={`w-6 h-6 rounded-full ${
                        point.status === 'green' ? 'bg-green-500' : 'bg-gray-300'
                      } hover:bg-green-400 transition-colors`}
                      title="Set Online"
                    ></button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(point, 'yellow');
                      }}
                      className={`w-6 h-6 rounded-full ${
                        point.status === 'yellow' ? 'bg-yellow-500' : 'bg-gray-300'
                      } hover:bg-yellow-400 transition-colors`}
                      title="Set Warning"
                    ></button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(point, 'red');
                      }}
                      className={`w-6 h-6 rounded-full ${
                        point.status === 'red' ? 'bg-red-500' : 'bg-gray-300'
                      } hover:bg-red-400 transition-colors`}
                      title="Set Offline"
                    ></button>
                  </div>
                )}
              </div>
              
              {point.description && (
                <p className="text-xs text-gray-600 mt-1">{point.description}</p>
              )}
              
              <div className="text-xs text-gray-500 mt-1">
                {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
              </div>

              {isAdmin && selectedPoint?.id === point.id && (
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(point);
                    }}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(point);
                    }}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;