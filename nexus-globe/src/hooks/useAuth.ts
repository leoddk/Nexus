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

    const checkSession = async () => {
      // Only check session if tab is focused
      if (!document.hasFocus()) {
        setLoading(false);
        return;
      }

      try {
        console.log('Checking session...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (mounted) {
          if (data.session?.user) {
            setUser(data.session.user);
            await fetchProfile(data.session.user.id, data.session.user.email);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in checkSession:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Only process auth changes if this tab is focused
        if (!document.hasFocus()) return;
        
        console.log('Auth state change:', event, session ? 'Session exists' : 'No session');
        
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
        }
      }
    );

    return () => {
      mounted = false;
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Add the missing signIn and signUp functions
  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAdmin = profile?.role === 'admin';

  // Add signIn and signUp to the return statement
  return { 
    user, 
    profile, 
    loading, 
    isAdmin, 
    signIn, 
    signUp, 
    signOut 
  };
};