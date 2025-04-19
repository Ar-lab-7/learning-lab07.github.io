
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, validateDeveloperLogin, supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  profile: UserProfile | null;
  user: any | null; // Add user property to fix the type error
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
  
  // Check for existing session on startup
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Session exists, try to get the developer profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_developer', true)
          .maybeSingle();
          
        if (profileData) {
          setProfile(profileData);
          setIsDeveloper(true);
        }
      }
    };
    
    checkSession();
    
    // Setup auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setIsDeveloper(false);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
      console.error('Login error:', error);
      toast.error('Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      setIsDeveloper(false);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const value = {
    profile,
    user: profile, // Set user to be the same as profile to fix the error
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
