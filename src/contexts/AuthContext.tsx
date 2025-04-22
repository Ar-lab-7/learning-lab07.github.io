
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, validateDeveloperLogin, supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  profile: UserProfile | null;
  user: any | null;
  isLoading: boolean;
  isDeveloper: boolean;
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeveloper, setIsDeveloper] = useState(false);
  
  // Check for existing session on startup
  useEffect(() => {
    // First set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setIsDeveloper(false);
        } else if (session) {
          // When signed in, fetch the profile data
          setTimeout(async () => {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (data) {
              setProfile(data);
              setIsDeveloper(data.is_developer);
            }
          }, 0);
        }
      }
    );
    
    // Then check for existing session
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
            
          if (profileData) {
            setProfile(profileData);
            setIsDeveloper(profileData.is_developer);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
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
        toast.error('Login failed. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setProfile(null);
      setIsDeveloper(false);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    profile,
    user: profile,
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
