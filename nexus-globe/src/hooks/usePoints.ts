import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { NexusPoint } from '../types';

export const usePoints = () => {
  const [points, setPoints] = useState<NexusPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoints = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const { data, error } = await supabase
        .from('nexus_points')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPoints(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const addPoint = async (point: Omit<NexusPoint, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('nexus_points')
      .insert(point)
      .select()
      .single();
    
    if (error) throw error;
    setPoints(prev => [data, ...prev]);
    return { data, error: null };
  };

  const updatePoint = async (id: string, updates: Partial<NexusPoint>) => {
    const { data, error } = await supabase
      .from('nexus_points')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    setPoints(prev => prev.map(p => p.id === id ? data : p));
    return { data, error: null };
  };

  const deletePoint = async (id: string) => {
    const { error } = await supabase
      .from('nexus_points')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    setPoints(prev => prev.filter(p => p.id !== id));
    return { error: null };
  };

  useEffect(() => {
    let mounted = true;
    
    const initializePoints = async () => {
      if (mounted) {
        await fetchPoints(true);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializePoints();

    const channel = supabase.channel('nexus_points_channel');
    const subscription = channel
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'nexus_points' 
      }, (payload) => {
        if (mounted) {
          fetchPoints(false);
        }
      })
      .subscribe();

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return { points, loading, error, addPoint, updatePoint, deletePoint };
};