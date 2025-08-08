import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string, userEmail: string | undefined) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        console.log('Profile not found, creating new profile');
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({ id: userId, email: userEmail, role: 'viewer' })
          .select()
          .single();

        if (createError) {
          console.error("Failed to create profile:", createError);
          throw createError;
        }
        
        setProfile(newProfile);
      } else if (error) {
        console.error("Failed to fetch profile:", error);
        throw error;
      } else {
        console.log('Profile fetched successfully:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchProfile process:', error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    console.log('useAuth effect triggered');
    
    // REMOVED: setLoading(true); - This was causing issues
    
    const checkSession = async () => {
      try {
        console.log('Checking session...');
        
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session check error:', error);
          if (mounted) {
            setUser(null);
            setProfile(null);
          }
          return;
        }

        console.log('Session check result:', data.session ? 'Session found' : 'No session');
        
        if (mounted) {
          setUser(data.session?.user ?? null);
          if (data.session?.user) {
            await fetchProfile(data.session.user.id, data.session.user.email);
          } else {
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        console.log('Setting loading to false');
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session ? 'Session exists' : 'No session');
        
        // REMOVED: setLoading(true); - This was the main culprit causing loading screen on refresh
        
        if (mounted) {
          try {
            setUser(session?.user ?? null);
            if (session?.user) {
              await fetchProfile(session.user.id, session.user.email);
            } else {
              setProfile(null);
            }
          } catch (error) {
            console.error('Error in auth state change:', error);
          }
          // REMOVED: finally block that sets loading to false
        }
      }
    );

    return () => {
      mounted = false;
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = (email: string, password: string) => 
    supabase.auth.signInWithPassword({ email, password });

  const signUp = (email: string, password: string) => 
    supabase.auth.signUp({ email, password });

  const signOut = () => supabase.auth.signOut();

  const isAdmin = profile?.role === 'admin';

  return { user, profile, loading, isAdmin, signIn, signUp, signOut };
};