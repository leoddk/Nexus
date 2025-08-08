import { useState, useEffect } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Get initial session immediately
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (error) {
            console.error('Error getting session:', error);
            setUser(null);
            setIsAdmin(false);
          } else {
            setUser(session?.user ?? null);
            setIsAdmin(session?.user?.email === 'admin@airforce.mil' || false);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Session error:', error);
        if (mounted) {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          console.log('Auth state change:', event, session?.user?.email);
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            setUser(session?.user ?? null);
            setIsAdmin(session?.user?.email === 'admin@airforce.mil' || false);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setIsAdmin(false);
          }
          
          // Always set loading to false after any auth state change
          setLoading(false);
        }
      }
    );

    // Get initial session
    getInitialSession();

    // Handle visibility change (tab focus/blur)
    const handleVisibilityChange = () => {
      if (!document.hidden && mounted) {
        // Tab became visible again - refresh auth state
        supabase.auth.getSession().then(({ data: { session }, error }) => {
          if (mounted && !error) {
            setUser(session?.user ?? null);
            setIsAdmin(session?.user?.email === 'admin@airforce.mil' || false);
            setLoading(false);
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    return result;
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    const result = await supabase.auth.signUp({ email, password });
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    const result = await supabase.auth.signOut();
    setLoading(false);
    return result;
  };

  return {
    user,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
  };
};