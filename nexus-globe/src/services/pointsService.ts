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
    let timeoutId: NodeJS.Timeout | null = null;
    let isSubscribed = false;
    
    const debouncedCallback = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log('Executing callback after real-time update');
        callback();
      }, 100);
    };
    
    // Wait for authentication before subscribing
    const setupSubscription = async () => {
      try {
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log('No session found, waiting for authentication...');
          return;
        }
        
        console.log('User authenticated, setting up real-time subscription');
        
        const channel = supabase
          .channel('nexus_points_changes', {
            config: {
              broadcast: { self: false }
            }
          })
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'nexus_points' 
          }, (payload) => {
            console.log('Real-time update received:', {
              eventType: payload.eventType,
              table: payload.table,
              recordId: (payload.new as any)?.id || (payload.old as any)?.id,
              timestamp: new Date().toISOString()
            });
            debouncedCallback();
          })
          .subscribe((status) => {
            console.log('Real-time subscription status:', status);
            if (status === 'SUBSCRIBED') {
              console.log('✅ Successfully subscribed to nexus_points changes');
              isSubscribed = true;
            } else if (status === 'CHANNEL_ERROR') {
              console.error('❌ Error in real-time subscription');
              isSubscribed = false;
            } else if (status === 'TIMED_OUT') {
              console.error('⏰ Real-time subscription timed out');
              isSubscribed = false;
            } else if (status === 'CLOSED') {
              console.log('🔒 Real-time subscription closed');
              isSubscribed = false;
            }
          });

        return channel;
      } catch (error) {
        console.error('Error setting up real-time subscription:', error);
        return null;
      }
    };

    let channel: any = null;
    
    // Setup subscription after a short delay to ensure auth is ready
    setTimeout(async () => {
      channel = await setupSubscription();
    }, 1000);

    return () => {
      console.log('Unsubscribing from real-time updates');
      if (timeoutId) clearTimeout(timeoutId);
      if (channel && isSubscribed) {
        channel.unsubscribe();
      }
    };
  }
}