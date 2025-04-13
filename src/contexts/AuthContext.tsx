
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/integrations/supabase/client';
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

  // Sign in with username and password
  const signIn = async (username: string, password: string) => {
    try {
      console.log('Attempting to sign in with username:', username);
      
      // Find the email associated with this username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('username', username)
        .single();

      if (userError || !userData) {
        console.error('User lookup error:', userError);
        toast.error('Invalid username or password');
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
        toast.error(error.message);
        throw error;
      }

      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in');
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
