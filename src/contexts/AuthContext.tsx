
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/integrations/supabase/client';

interface AuthContextType {
  profile: UserProfile | null;
  user: any | null;
  isLoading: boolean;
  isDeveloper: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    setProfile(defaultProfile);
    setIsLoading(false);
  }, []);
  
  const value = {
    profile,
    user: profile,
    isLoading,
    isDeveloper: true
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
