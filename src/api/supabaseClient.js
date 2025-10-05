import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Function to sign in with Google OAuth
export const signInWithGoogle = async (googleCredential) => {
  try {
    // Use Supabase's built-in Google OAuth
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: googleCredential,
    });
    
    if (error) {
      console.error('Error signing in with Google:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in signInWithGoogle:', error);
    return { data: null, error };
  }
};

// Function to set the auth session for API requests
export const setAuthSession = async (accessToken) => {
  if (accessToken) {
    // For now, we'll use the Google credential directly with Supabase
    return await signInWithGoogle(accessToken);
  } else {
    // Sign out if no token
    await supabase.auth.signOut();
  }
};

// Function to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};
