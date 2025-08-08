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
  const [isCollapsed, setIsCollapsed] = useState(false);
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
      (point.description && point.description.toLowerCase().includes(term)) ||
      point.status.toLowerCase().includes(term)
    );
  }, [points, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pointData = {
      name: formData.name,
      description: formData.description,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      status: formData.status
    };
    if (editingPoint) {
      await updatePoint(editingPoint.id, pointData);
    } else {
      await addPoint(pointData);
    }
    setEditingPoint(null);
    setShowAddForm(false);
    setFormData({ name: '', description: '', latitude: '', longitude: '', status: 'green' });
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
  const togglePanel = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      {/* Hamburger Menu Button - Always visible - Fixed positioning */}
      <button
        onClick={togglePanel}
        className="absolute top-4 right-4 bg-black bg-opacity-80 text-cyan-300 p-3 rounded-lg z-20 hover:bg-opacity-100 transition-all duration-200"
        title={isCollapsed ? 'Show Control Panel' : 'Hide Control Panel'}
      >
        <div className="w-6 h-6 flex flex-col justify-center space-y-1">
          {/* Show hamburger lines when closed, X when open */}
          {!isCollapsed ? (
            // Hamburger lines (menu closed - show hamburger)
            <>
              <div className="h-0.5 bg-current"></div>
              <div className="h-0.5 bg-current"></div>
              <div className="h-0.5 bg-current"></div>
            </>
          ) : (
            // X icon (menu open - show X)
            <>
              <div className="h-0.5 bg-current transform rotate-45 translate-y-1.5 absolute"></div>
              <div className="h-0.5 bg-current transform -rotate-45 -translate-y-1.5 absolute"></div>
            </>
          )}
        </div>
      </button>

      {/* Control Panel - Slides in/out - Improved positioning */}
      <div className={`absolute top-20 right-4 w-72 md:w-80 bg-white rounded-lg shadow-lg z-10 max-h-[calc(100vh-6rem)] overflow-y-auto transform transition-all duration-300 ease-in-out ${
        isCollapsed ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'
      }`}>
        
        {/* Header with status counts */}
        <div className="p-3 md:p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base md:text-lg font-semibold text-air-force-blue">NEXUS Control Panel</h2>
            <button
              onClick={togglePanel}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              title="Hide Panel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
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

        {/* Search Section */}
        <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search bases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-air-force-blue focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="mt-2 text-xs text-gray-600">
              {filteredPoints.length === 0 ? (
                <span className="text-red-600">No bases found</span>
              ) : (
                <span>
                  {filteredPoints.length} of {points.length} bases found
                  <button onClick={clearSearch} className="ml-2 text-air-force-blue hover:underline">
                    Show all
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Admin Add Button */}
        {isAdmin && (
          <div className="p-3 md:p-4 border-b border-gray-200">
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingPoint(null);
                setFormData({ name: '', description: '', latitude: '', longitude: '', status: 'green' });
              }}
              className="w-full bg-air-force-blue text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm"
            >
              {showAddForm ? 'Cancel' : 'Add New Base'}
            </button>
          </div>
        )}

        {/* Admin Add/Edit Form */}
        {isAdmin && showAddForm && (
          <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-medium mb-3 text-sm">{editingPoint ? 'Edit Base' : 'Add New Base'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Base Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-air-force-blue"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-air-force-blue"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-air-force-blue"
                  required
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-air-force-blue"
                  required
                />
              </div>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-air-force-blue"
              >
                <option value="green">Online</option>
                <option value="yellow">Warning</option>
                <option value="red">Offline</option>
              </select>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors text-sm"
              >
                {editingPoint ? 'Update Base' : 'Add Base'}
              </button>
            </form>
          </div>
        )}

        {/* Points List */}
        <div className="p-3 md:p-4">
          <h3 className="font-medium mb-3 text-sm">
            Connection Points ({filteredPoints.length})
            {searchTerm && filteredPoints.length !== points.length && (
              <span className="text-gray-500 font-normal"> of {points.length}</span>
            )}
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredPoints.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                {searchTerm ? 'No bases match' : 'No points found'}
              </div>
            ) : (
              filteredPoints.map((point) => {
                const isSelected = selectedPoint?.id === point.id;
                return (
                  <div
                    key={point.id}
                    className={`p-3 border rounded cursor-pointer transition-colors ${
                      isSelected ? 'border-air-force-blue bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      if (isSelected) onPointSelect(null);
                      else onPointSelect(point);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          point.status === 'green' ? 'bg-green-500' :
                          point.status === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className="font-medium text-sm truncate">{point.name}</span>
                      </div>
                      {isAdmin && (
                        <div className="flex space-x-1 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(point, 'green');
                            }}
                            className={`w-6 h-6 rounded-full ${
                              point.status === 'green' ? 'bg-green-500' : 'bg-gray-300'
                            } hover:bg-green-400`}
                            title="Set Online"
                          ></button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(point, 'yellow');
                            }}
                            className={`w-6 h-6 rounded-full ${
                              point.status === 'yellow' ? 'bg-yellow-500' : 'bg-gray-300'
                            } hover:bg-yellow-400`}
                            title="Set Warning"
                          ></button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(point, 'red');
                            }}
                            className={`w-6 h-6 rounded-full ${
                              point.status === 'red' ? 'bg-red-500' : 'bg-gray-300'
                            } hover:bg-red-400`}
                            title="Set Offline"
                          ></button>
                        </div>
                      )}
                    </div>
                    {point.description && (
                      <p className="text-xs text-gray-600 mt-1 truncate">{point.description}</p>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                    </div>
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
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ControlPanel;