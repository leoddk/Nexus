import { createClient } from '@supabase/supabase-js';
import { NexusPoint, Profile } from '../types';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.log('REACT_APP_SUPABASE_URL:', supabaseUrl);
  console.log('REACT_APP_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      nexus_points: {
        Row: NexusPoint;
        Insert: Omit<NexusPoint, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<NexusPoint, 'id' | 'created_at'>>;
      };
    };
  };
}