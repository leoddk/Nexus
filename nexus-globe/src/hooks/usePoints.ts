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
      const data = await PointsService.fetchPoints();
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
      setPoints(prev => prev.map(p => p.id === id ? updatedPoint : p));
      // Force a refresh to ensure the UI is updated
      await fetchPoints(false);
      return { data: updatedPoint, error: null };
    } catch (error: any) {
      console.error('Error updating point:', error);
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
    
    const initializePoints = async () => {
      try {
        if (mounted) {
          setLoading(true);
          setError(null);
          await fetchPoints(true);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    initializePoints();

    const unsubscribe = PointsService.subscribeToChanges(() => {
      if (mounted) {
        fetchPoints(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
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