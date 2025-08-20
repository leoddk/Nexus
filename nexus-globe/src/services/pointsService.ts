import { supabase } from '../lib/supabase';
import { NexusPoint } from '../types';

export class PointsService {
  private static activeChannel: any = null;
  private static isSubscribing = false;
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
    // Prevent multiple subscriptions
    if (this.isSubscribing || this.activeChannel) {
      console.log('Real-time subscription already active, skipping...');
      return () => {}; // Return empty cleanup function
    }

    console.log('Setting up real-time subscription for nexus_points');
    this.isSubscribing = true;
    let timeoutId: NodeJS.Timeout | null = null;
    let retryCount = 0;
    const maxRetries = 3;
    
    const debouncedCallback = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log('Executing callback after real-time update');
        callback();
      }, 100);
    };
    
    const setupSubscription = async (): Promise<any> => {
      try {
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log('No session found, waiting for authentication...');
          // Retry after authentication
          setTimeout(() => {
            if (retryCount < maxRetries && this.isSubscribing) {
              retryCount++;
              console.log(`Retrying subscription setup (${retryCount}/${maxRetries})`);
              setupSubscription();
            }
          }, 2000);
          return null;
        }
        
        console.log('User authenticated, setting up real-time subscription');
        
        // Cleanup existing channel before creating new one
        if (this.activeChannel) {
          console.log('Cleaning up existing channel before creating new one');
          try {
            this.activeChannel.unsubscribe();
          } catch (error) {
            console.error('Error cleaning up existing channel:', error);
          }
          this.activeChannel = null;
        }
        
        this.activeChannel = supabase
          .channel(`nexus_points_changes_${Date.now()}`, {
            config: {
              broadcast: { self: false },
              presence: { key: 'nexus_client' }
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
              retryCount = 0; // Reset retry count on success
              this.isSubscribing = false;
            } else if (status === 'CHANNEL_ERROR') {
              console.error('❌ Error in real-time subscription');
              // Retry on error
              if (retryCount < maxRetries && this.isSubscribing) {
                retryCount++;
                console.log(`Retrying subscription after error (${retryCount}/${maxRetries})`);
                setTimeout(() => setupSubscription(), 3000);
              } else {
                this.isSubscribing = false;
              }
            } else if (status === 'TIMED_OUT') {
              console.error('⏰ Real-time subscription timed out');
              // Retry on timeout
              if (retryCount < maxRetries && this.isSubscribing) {
                retryCount++;
                console.log(`Retrying subscription after timeout (${retryCount}/${maxRetries})`);
                setTimeout(() => setupSubscription(), 5000);
              } else {
                this.isSubscribing = false;
              }
            } else if (status === 'CLOSED') {
              console.log('🔒 Real-time subscription closed');
              this.isSubscribing = false;
            }
          });

        return this.activeChannel;
      } catch (error) {
        console.error('Error setting up real-time subscription:', error);
        if (retryCount < maxRetries && this.isSubscribing) {
          retryCount++;
          console.log(`Retrying subscription after error (${retryCount}/${maxRetries})`);
          setTimeout(() => setupSubscription(), 3000);
        } else {
          this.isSubscribing = false;
        }
        return null;
      }
    };
    
    // Setup subscription with initial delay
    setTimeout(() => {
      if (this.isSubscribing) {
        setupSubscription();
      }
    }, 1000);

    return () => {
      console.log('Unsubscribing from real-time updates');
      if (timeoutId) clearTimeout(timeoutId);
      if (this.activeChannel) {
        try {
          this.activeChannel.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from channel:', error);
        }
        this.activeChannel = null;
      }
      this.isSubscribing = false;
    };
  }
}