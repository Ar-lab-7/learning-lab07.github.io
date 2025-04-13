
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

  // Sign in directly with username/password without email lookup
  const signIn = async (username: string, password: string) => {
    try {
      // Special case for developer user
      if (username === 'arhub-07-2010') {
        // Try to sign in directly with the known email format
        const { error } = await supabase.auth.signInWithPassword({
          email: 'arhub-07-2010@example.com',
          password,
        });

        if (error) {
          console.error('Developer sign in error:', error);
          toast.error('Developer login failed. Please check your password.');
          throw error;
        }
        return;
      }
      
      // For regular users, look up the email first
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('username', username)
        .single();

      if (userError || !userData) {
        console.error('User lookup error:', userError);
        toast.error('User not found. Please check your username.');
        throw userError || new Error('User not found');
      }

      console.log('Found user email for sign in:', userData.email);

      // Sign in with the email and password
      const { error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        toast.error('Invalid password. Please try again.');
        throw error;
      }

      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
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
