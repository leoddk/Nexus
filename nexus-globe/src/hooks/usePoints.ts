import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { NexusPoint } from '../types';

export const usePoints = () => {
  const [points, setPoints] = useState<NexusPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoints = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching points from Supabase...');
      
      const { data, error } = await supabase
        .from('nexus_points')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Points fetched successfully:', data);
      setPoints(data || []);
    } catch (err) {
      console.error('Error in fetchPoints:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching points');
    } finally {
      setLoading(false);
    }
  };

  const addPoint = async (point: Omit<NexusPoint, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('nexus_points')
        .insert(point)
        .select()
        .single();

      if (error) throw error;
      setPoints(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error adding point:', error);
      return { data: null, error };
    }
  };

  const updatePoint = async (id: string, updates: Partial<NexusPoint>) => {
    try {
      const { data, error } = await supabase
        .from('nexus_points')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setPoints(prev => prev.map(p => p.id === id ? data : p));
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error updating point:', error);
      return { data: null, error };
    }
  };

  const deletePoint = async (id: string) => {
    try {
      const { error } = await supabase
        .from('nexus_points')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPoints(prev => prev.filter(p => p.id !== id));
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error deleting point:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchPoints();

    // Skip real-time subscription for now to isolate the issue
    // const subscription = supabase
    //   .channel('nexus_points_channel')
    //   .on('postgres_changes', 
    //     { event: '*', schema: 'public', table: 'nexus_points' },
    //     (payload) => {
    //       console.log('Real-time update:', payload);
    //     }
    //   )
    //   .subscribe();

    // return () => {
    //   subscription.unsubscribe();
    // };
  }, []);

  return {
    points,
    loading,
    error,
    addPoint,
    updatePoint,
    deletePoint,
    refetch: fetchPoints,
  };
};