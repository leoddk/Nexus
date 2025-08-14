import { useState, useEffect, useCallback } from 'react';
import { NexusPoint, StatusCount } from '../types';
import { PointsService } from '../services/pointsService';

export const usePoints = () => {
  const [points, setPoints] = useState<NexusPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoints = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      console.log('Fetching points from database...');
      const data = await PointsService.fetchPoints();
      console.log('Fetched points:', data.length, 'points');
      setPoints(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching points:', err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  const addPoint = async (point: Omit<NexusPoint, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newPoint = await PointsService.addPoint(point);
      setPoints(prev => [newPoint, ...prev]);
      return { data: newPoint, error: null };
    } catch (error: any) {
      console.error('Error adding point:', error);
      return { data: null, error };
    }
  };

  const updatePoint = async (id: string, updates: Partial<NexusPoint>) => {
    try {
      const updatedPoint = await PointsService.updatePoint(id, updates);
      // Update local state immediately for better UX
      setPoints(prev => {
        console.log('Updating local state for point:', id, 'with updates:', updates);
        const newPoints = [...prev]; // Create a new array
        const index = newPoints.findIndex(p => p.id === id);
        if (index !== -1) {
          newPoints[index] = { ...updatedPoint }; // Create a new object
        }
        console.log('New points state after update:', newPoints.find(p => p.id === id));
        return newPoints;
      });
      
      return { data: updatedPoint, error: null };
    } catch (error: any) {
      console.error('Error updating point:', error);
      // On error, refetch to ensure consistency
      await fetchPoints(false);
      return { data: null, error };
    }
  };

  const deletePoint = async (id: string) => {
    try {
      await PointsService.deletePoint(id);
      setPoints(prev => prev.filter(p => p.id !== id));
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting point:', error);
      return { error };
    }
  };

  const getStatusCounts = useCallback((): StatusCount => {
    const counts = points.reduce((acc, point) => {
      acc[point.status]++;
      acc.total++;
      return acc;
    }, { green: 0, yellow: 0, red: 0, total: 0 });
    
    return counts;
  }, [points]);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | null = null;
    
    const initializePoints = async () => {
      try {
        if (mounted) {
          setLoading(true);
          setError(null);
          console.log('🔄 Initializing points data...');
          await fetchPoints(true);
          
          // Set up real-time subscription after initial data load
          if (mounted) {
            console.log('🔗 Setting up real-time subscription...');
            unsubscribe = PointsService.subscribeToChanges(() => {
              if (mounted) {
                console.log('📡 Real-time callback triggered, refetching points...');
                fetchPoints(false);
              }
            });
          }
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    initializePoints();

    return () => {
      console.log('🧹 Cleaning up usePoints hook...');
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchPoints]);

  return { 
    points, 
    loading, 
    error, 
    addPoint, 
    updatePoint, 
    deletePoint, 
    getStatusCounts,
    refetch: () => fetchPoints(true)
  };
};