
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, UserProfile, createDeveloperIfNeeded } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isDeveloper: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeveloper, setIsDeveloper] = useState(false);

  // Fetch user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user ID:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        console.log('Profile data received:', data);
        setProfile(data as UserProfile);
        setIsDeveloper(data.is_developer);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  // Set up auth state listener
  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Try to create the developer user if needed
    createDeveloperIfNeeded();
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event, newSession);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Fetch profile data if user is logged in
        if (newSession?.user) {
          setTimeout(() => {
            fetchUserProfile(newSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setIsDeveloper(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      console.log('Initial session check:', existingSession);
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      if (existingSession?.user) {
        fetchUserProfile(existingSession.user.id);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with username/password - Only for developer user
  const signIn = async (username: string, password: string) => {
    try {
      // Only allow the developer username
      if (username !== 'arhub-07-2010') {
        toast.error('Invalid username. Only developer login is supported.');
        throw new Error('Invalid username');
      }
      
      // Special case for developer - use a hardcoded authentication approach
      if (password !== 'a@Rawat2010') {
        toast.error('Invalid password. Please try again.');
        throw new Error('Invalid password');
      }
      
      // Get developer profile directly from the database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      
      if (profileError || !profileData) {
        console.error('Developer profile lookup error:', profileError);
        toast.error('Developer profile not found. Please try again later.');
        throw profileError || new Error('Developer profile not found');
      }
      
      console.log('Developer profile found:', profileData);
      
      // Set developer state directly without using Supabase Auth
      setProfile(profileData as UserProfile);
      setIsDeveloper(true);
      
      toast.success('Signed in as developer');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setProfile(null);
      setIsDeveloper(false);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signIn,
    signOut,
    isDeveloper,
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
