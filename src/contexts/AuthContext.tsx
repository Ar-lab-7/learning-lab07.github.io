
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  profile: UserProfile | null;
  user: any | null;
  isLoading: boolean;
  isDeveloper: boolean;
  signOut: () => void;
  signIn: (username: string, password: string) => Promise<boolean>; // Added signIn method
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeveloper, setIsDeveloper] = useState(true); // Always true - everyone is a developer
  
  // Create a default user profile on startup
  useEffect(() => {
    const setupDefaultUser = async () => {
      try {
        // Create a default profile for all users
        const defaultProfile: UserProfile = {
          id: 'default-user-id',
          username: 'Guest User',
          is_developer: true
        };
        
        setProfile(defaultProfile);
        setIsDeveloper(true);
      } catch (error) {
        console.error('Error setting up default user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    setupDefaultUser();
  }, []);

  const signOut = async () => {
    try {
      // Just reset to default state since we're not really signing out
      toast.success('Session reset successfully');
    } catch (error) {
      console.error('Reset error:', error);
      toast.error('Failed to reset session');
    }
  };

  // Add a stub signIn method that always succeeds since we're bypassing login
  const signIn = async (username: string, password: string): Promise<boolean> => {
    try {
      // Set the profile with the provided username
      const userProfile: UserProfile = {
        id: 'default-user-id',
        username: username || 'Guest User',
        is_developer: true
      };
      
      setProfile(userProfile);
      setIsDeveloper(true);
      setIsLoading(false);
      toast.success(`Welcome, ${username}!`);
      return true;
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in');
      return false;
    }
  };

  const value = {
    profile,
    user: profile,
    isLoading,
    isDeveloper,
    signOut,
    signIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
