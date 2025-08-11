import React, { useState, useMemo } from 'react';
import { NexusPoint } from '../types';
import { usePoints } from '../hooks/usePoints';
import { useAuth } from '../hooks/useAuth';

interface ControlPanelProps {
  points: NexusPoint[];
  selectedPoint: NexusPoint | null;
  onPointSelect: (point: NexusPoint | null) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ points, selectedPoint, onPointSelect }) => {
  const { isAdmin } = useAuth();
  const { addPoint, updatePoint, deletePoint } = usePoints();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPoint, setEditingPoint] = useState<NexusPoint | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    latitude: '', 
    longitude: '', 
    status: 'green' as 'green' | 'yellow' | 'red' 
  });

  const statusCounts = points.reduce((acc, point) => { 
    acc[point.status]++; 
    return acc; 
  }, { green: 0, yellow: 0, red: 0 });

  const filteredPoints = useMemo(() => {
    if (!searchTerm.trim()) return points;
    const term = searchTerm.toLowerCase().trim();
    return points.filter(point => 
      point.name.toLowerCase().includes(term) ||
      (point.description && point.description.toLowerCase().includes(term))
    );
  }, [points, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.latitude || !formData.longitude) return;
    
    const pointData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      status: formData.status
    };

    try {
      if (editingPoint) {
        await updatePoint(editingPoint.id, pointData);
      } else {
        await addPoint(pointData);
      }
      setFormData({ name: '', description: '', latitude: '', longitude: '', status: 'green' });
      setShowAddForm(false);
      setEditingPoint(null);
    } catch (error) {
      console.error('Error saving point:', error);
    }
  };

  const handleEdit = (point: NexusPoint) => {
    setFormData({ 
      name: point.name, 
      description: point.description || '', 
      latitude: point.latitude.toString(), 
      longitude: point.longitude.toString(), 
      status: point.status 
    });
    setEditingPoint(point);
    setIsPanelOpen(true);
    setShowAddForm(true);
  };

  const handleDelete = async (point: NexusPoint) => {
    if (window.confirm(`Are you sure you want to delete "${point.name}"?`)) {
      await deletePoint(point.id);
      if (selectedPoint?.id === point.id) onPointSelect(null);
    }
  };

  const handleStatusChange = async (point: NexusPoint, newStatus: 'green' | 'yellow' | 'red') => { 
    await updatePoint(point.id, { status: newStatus }); 
  };

  const clearSearch = () => setSearchTerm('');
  const togglePanel = () => setIsPanelOpen(!isPanelOpen);

  return (
    <>
      <button
        onClick={togglePanel}
        className="absolute top-4 right-4 bg-black bg-opacity-75 text-cyan-300 p-2 rounded-lg z-20 hover:bg-opacity-100 transition-all"
        title={isPanelOpen ? 'Hide Control Panel' : 'Show Control Panel'}
      >
        <div className="w-6 h-6 flex items-center justify-center">
          {isPanelOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </div>
      </button>

      <div className={`absolute top-20 right-4 w-72 md:w-80 bg-white rounded-lg shadow-lg z-10 max-h-[calc(100vh-6rem)] overflow-y-auto transform transition-transform duration-300 ease-in-out ${
        isPanelOpen ? 'translate-x-0' : 'translate-x-[120%]'
      }`}>
        <div className="p-3 md:p-4 border-b border-gray-200">
          <h2 className="text-base md:text-lg font-semibold text-air-force-blue mb-3">NEXUS Control Panel</h2>
          <div className="grid grid-cols-3 gap-2">
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

        <div className="p-3 md:p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search points..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingPoint(null);
                setFormData({ name: '', description: '', latitude: '', longitude: '', status: 'green' });
              }}
              className="w-full mt-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-sm"
            >
              {showAddForm ? 'Cancel' : 'Add New Point'}
            </button>
          )}
        </div>

        {isAdmin && showAddForm && (
          <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold mb-2">
              {editingPoint ? 'Edit Point' : 'Add New Point'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-2">
              <input
                type="text"
                placeholder="Point name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm h-16 resize-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Latitude"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                  step="any"
                  min="-90"
                  max="90"
                  required
                />
                <input
                  type="number"
                  placeholder="Longitude"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                  step="any"
                  min="-180"
                  max="180"
                  required
                />
              </div>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'green' | 'yellow' | 'red' })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="green">Online</option>
                <option value="yellow">Warning</option>
                <option value="red">Offline</option>
              </select>
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-1 px-2 rounded hover:bg-green-600 text-sm"
              >
                {editingPoint ? 'Update Point' : 'Add Point'}
              </button>
            </form>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {filteredPoints.map((point) => {
              const isSelected = selectedPoint?.id === point.id;
              return (
                <div
                  key={point.id}
                  onClick={() => onPointSelect(isSelected ? null : point)}
                  className={`p-2 mb-2 rounded cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 hover:bg-gray-100'
                  } border`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        point.status === 'green' ? 'bg-green-500' :
                        point.status === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="font-medium text-sm">{point.name}</span>
                    </div>
                    {isAdmin && isSelected && (
                      <div className="flex space-x-1">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleStatusChange(point, 'green'); 
                          }} 
                          className={`w-6 h-6 rounded-full ${point.status === 'green' ? 'bg-green-500' : 'bg-gray-300'} hover:bg-green-400`} 
                          title="Set Online"
                        ></button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleStatusChange(point, 'yellow'); 
                          }} 
                          className={`w-6 h-6 rounded-full ${point.status === 'yellow' ? 'bg-yellow-500' : 'bg-gray-300'} hover:bg-yellow-400`} 
                          title="Set Warning"
                        ></button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleStatusChange(point, 'red'); 
                          }} 
                          className={`w-6 h-6 rounded-full ${point.status === 'red' ? 'bg-red-500' : 'bg-gray-300'} hover:bg-red-400`} 
                          title="Set Offline"
                        ></button>
                      </div>
                    )}
                  </div>
                  {point.description && <p className="text-xs text-gray-600 mt-1 truncate">{point.description}</p>}
                  <div className="text-xs text-gray-500 mt-1">{point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}</div>
                  {isAdmin && isSelected && (
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
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default ControlPanel;