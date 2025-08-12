import { supabase } from '../lib/supabase';
import { Profile } from '../types';

export class AuthService {
  static async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
  }

  static async signUp(email: string, password: string) {
    return await supabase.auth.signUp({ email, password });
  }

  static async signOut() {
    return await supabase.auth.signOut();
  }

  static async getCurrentSession() {
    try {
      return await supabase.auth.getSession();
    } catch (error) {
      console.error('Session check failed:', error);
      throw error;
    }
  }

  static async fetchProfile(userId: string, userEmail?: string): Promise<Profile | null> {
    try {
      console.log('AuthService: Starting profile fetch for userId:', userId);
      
      // Add timeout to prevent infinite hanging
      const profileQuery = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );

      const { data, error } = await Promise.race([profileQuery, timeoutPromise]) as any;
      
      console.log('AuthService: Profile query result:', { data, error });

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        console.log('AuthService: Profile not found, creating new profile');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({ id: userId, email: userEmail, role: 'viewer' })
          .select()
          .single();

        console.log('AuthService: Profile creation result:', { newProfile, createError });
        if (createError) throw createError;
        return newProfile;
      }

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching/creating profile:', error);
      // Return default profile if database isn't set up
      if (error instanceof Error && error.message === 'Profile fetch timeout') {
        console.warn('Profile fetch timed out, returning default profile');
        return {
          id: userId,
          email: userEmail || 'unknown@example.com',
          role: 'viewer' as const,
          created_at: new Date().toISOString()
        };
      }
      return null;
    }
  }

  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  }

  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}