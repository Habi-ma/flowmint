import { createContext, useContext, useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { supabase, signInWithGoogle, signOut as supabaseSignOut } from '@/api/supabaseClient';
import { User } from '@/api/entities';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);

  // Function to fetch user profile from the users table
  const fetchUserProfile = async (userEmail) => {
    try {
      if (!userEmail) return null;
      
      const profile = await User.getByEmail(userEmail);
      setUserProfile(profile);
      
      // Cache the profile in localStorage
      localStorage.setItem('userProfile', JSON.stringify(profile));
      
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
      return null;
    }
  };

  // Check for existing Supabase session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if there's an existing Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && !error) {
          setUser(session.user);
          setAccessToken(session.access_token);
          
          // Check if we have cached user profile in localStorage
          const cachedProfile = localStorage.getItem('userProfile');
          if (cachedProfile) {
            try {
              const profile = JSON.parse(cachedProfile);
              setUserProfile(profile);
            } catch (parseError) {
              console.error('Error parsing cached profile:', parseError);
              localStorage.removeItem('userProfile');
            }
          } else {
            // Only fetch if we don't have cached data
            try {
              await fetchUserProfile(session.user.email);
            } catch (profileError) {
              console.error('Error fetching user profile during init:', profileError);
            }
          }
        } else {
          // Clear any stale local storage
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userProfile');
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userProfile');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user);
          setAccessToken(session.access_token);
          
          // Check if we have cached user profile in localStorage
          const cachedProfile = localStorage.getItem('userProfile');
          if (cachedProfile) {
            try {
              const profile = JSON.parse(cachedProfile);
              setUserProfile(profile);
            } catch (parseError) {
              console.error('Error parsing cached profile:', parseError);
              localStorage.removeItem('userProfile');
              // Fetch fresh profile if cache is corrupted
              await fetchUserProfile(session.user.email);
            }
          } else {
            // Fetch user profile from users table
            await fetchUserProfile(session.user.email);
          }
        } else {
          setUser(null);
          setAccessToken(null);
          setUserProfile(null);
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userProfile');
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (userData, token) => {
    try {
      // Use Supabase to sign in with Google
      const { data, error } = await signInWithGoogle(token);
      
      if (error) {
        console.error('Login error:', error);
        return { success: false, error };
      }
      
      // The auth state change listener will handle updating user state
      return { success: true, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      await supabaseSignOut();
      // The auth state change listener will handle clearing user state
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    userProfile,
    accessToken,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Google OAuth Login Component
export const GoogleLoginButton = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      // Use the Google credential directly with Supabase
      const result = await login(null, credentialResponse.credential);
      
      if (result.success) {
        // Navigate to dashboard after successful login
        navigate('/Dashboard');
      } else {
        console.error('Login failed:', result.error);
      }
    } catch (error) {
      console.error('Error during Google login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google login error:', error);
    setIsLoading(false);
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleError}
      render={({ onClick, disabled }) => (
        <button
          onClick={onClick}
          disabled={disabled || isLoading}
          className="flex items-center justify-center gap-3 px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          <span className="text-gray-700 font-medium">
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </span>
        </button>
      )}
    />
  );
};
