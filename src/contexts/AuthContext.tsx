
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/integrations/supabase/client';

interface AuthContextType {
  profile: UserProfile | null;
  user: any | null;
  isLoading: boolean;
  isDeveloper: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fix: Ensure AuthProvider is a proper React functional component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Everyone is a developer and "logged in"
    const defaultProfile: UserProfile = {
      id: 'dev-user',
      username: 'Developer',
      is_developer: true,
    };
    
    // Set the profile and loading state
    setProfile(defaultProfile);
    setIsLoading(false);
  }, []);
  
  const signOut = async (): Promise<void> => {
    console.log('Sign out called (no-op since all users are developers)');
    return Promise.resolve();
  };
  
  const value = {
    profile,
    user: profile,
    isLoading,
    isDeveloper: true,
    signOut
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
