import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';

const RoleBasedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = 'Dashboard',
  fallbackComponent = null 
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user profile from the users table
        const profile = await User.getByEmail(user.email);
        setUserProfile(profile);
        
        // Check if user has required role
        const hasRequiredRole = allowedRoles.length === 0 || 
                               allowedRoles.includes(profile.user_role);
        
        setHasAccess(hasRequiredRole);
        
        if (!hasRequiredRole) {
          console.log(`Access denied. User role: ${profile.user_role}, Required roles: ${allowedRoles.join(', ')}`);
          navigate(createPageUrl(redirectTo));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setHasAccess(false);
        navigate(createPageUrl(redirectTo));
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, [isAuthenticated, user, allowedRoles, navigate, redirectTo]);

  // Show loading while checking user role
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // If user doesn't have access, don't render the component
  if (!hasAccess) {
    return fallbackComponent || null;
  }

  // Render the protected component
  return children;
};

export default RoleBasedRoute;
