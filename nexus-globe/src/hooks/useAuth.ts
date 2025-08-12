import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { Profile } from '../types';
import { AuthService } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string, userEmail?: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const startTime = performance.now();
      const profileData = await AuthService.fetchProfile(userId, userEmail);
      const endTime = performance.now();
      console.log(`Profile fetch took ${endTime - startTime}ms`, profileData);
      setProfile(profileData);
    } catch (error) {
      console.error('Error in fetchProfile process:', error);
      setProfile(null);
    } finally {
      // Ensure loading is set to false even if profile fetch fails
      console.log('Setting loading to false');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const checkSession = async () => {
      try {
        console.log('Checking session...', new Date().toISOString());
        const startTime = performance.now();
        const { data, error } = await AuthService.getCurrentSession();
        const endTime = performance.now();
        console.log(`Session check took ${endTime - startTime}ms`);
        console.log('Session result:', { data, error });
        
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        console.log('Session data:', data.session ? 'User found' : 'No user');
        
        if (data.session?.user) {
          setUser(data.session.user);
          await fetchProfile(data.session.user.id, data.session.user.email);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in checkSession:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    // Add timeout fallback in case session check hangs
    timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Session check timed out after 10 seconds, assuming no session');
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    }, 10000);

    checkSession();

    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session ? 'Session exists' : 'No session');
        
        if (mounted) {
          try {
            // Clear timeout since we have an auth state change
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
            
            setUser(session?.user ?? null);
            if (session?.user) {
              await fetchProfile(session.user.id, session.user.email);
            } else {
              setProfile(null);
              setLoading(false);
            }
          } catch (error) {
            console.error('Error in auth state change:', error);
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [fetchProfile, loading]);

  const signIn = async (email: string, password: string) => {
    return await AuthService.signIn(email, password);
  };

  const signUp = async (email: string, password: string) => {
    return await AuthService.signUp(email, password);
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAdmin = profile?.role === 'admin';

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