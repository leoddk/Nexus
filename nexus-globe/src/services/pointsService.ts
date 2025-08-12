import { supabase } from '../lib/supabase';
import { NexusPoint } from '../types';

export class PointsService {
  static async fetchPoints(): Promise<NexusPoint[]> {
    const { data, error } = await supabase
      .from('nexus_points')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async addPoint(point: Omit<NexusPoint, 'id' | 'created_at' | 'updated_at'>): Promise<NexusPoint> {
    const { data, error } = await supabase
      .from('nexus_points')
      .insert(point)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updatePoint(id: string, updates: Partial<NexusPoint>): Promise<NexusPoint> {
    const { data, error } = await supabase
      .from('nexus_points')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deletePoint(id: string): Promise<void> {
    const { error } = await supabase
      .from('nexus_points')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  static async updatePointStatus(id: string, status: 'green' | 'yellow' | 'red'): Promise<NexusPoint> {
    return this.updatePoint(id, { status });
  }

  static async getPointsByStatus(status: 'green' | 'yellow' | 'red'): Promise<NexusPoint[]> {
    const { data, error } = await supabase
      .from('nexus_points')
      .select('*')
      .eq('status', status)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  static async searchPoints(searchTerm: string): Promise<NexusPoint[]> {
    const { data, error } = await supabase
      .from('nexus_points')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  static subscribeToChanges(callback: () => void) {
    console.log('Setting up real-time subscription for nexus_points');
    const channel = supabase
      .channel('nexus_points_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'nexus_points' 
      }, (payload) => {
        console.log('Real-time update received:', payload);
        callback();
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Unsubscribing from real-time updates');
      channel.unsubscribe();
    };
  }
}