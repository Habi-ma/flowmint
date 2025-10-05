import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/api/supabaseClient';

// Hook to automatically set the auth session for API requests
export const useAuthToken = () => {
  const { accessToken, isAuthenticated } = useAuth();

  useEffect(() => {
    // With Supabase, the session is automatically managed
    // The supabase client will use the current session for API requests
    // No need to manually set the session
    if (!isAuthenticated) {
      // Ensure we're signed out if not authenticated
      supabase.auth.signOut();
    }
  }, [isAuthenticated, accessToken]);
};
