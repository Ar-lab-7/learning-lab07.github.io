
import React, { createContext, useContext, useState } from 'react';
import { UserProfile, validateDeveloperLogin } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  isDeveloper: boolean;
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeveloper, setIsDeveloper] = useState(false);

  const signIn = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userProfile = await validateDeveloperLogin(username, password);
      
      if (userProfile) {
        setProfile(userProfile);
        setIsDeveloper(userProfile.is_developer);
        toast.success('Successfully logged in');
        return true;
      } else {
        toast.error('Invalid username or password');
        return false;
      }
    } catch (error) {
      toast.error('Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setProfile(null);
    setIsDeveloper(false);
    toast.success('Signed out successfully');
  };

  const value = {
    profile,
    isLoading,
    isDeveloper,
    signIn,
    signOut,
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
