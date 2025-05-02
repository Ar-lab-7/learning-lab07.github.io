
import { createClient } from '@supabase/supabase-js';

// Supabase project credentials
const supabaseUrl = 'https://bolmkvtrtrnvofpwkqnt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbG1rdnRydHJudm9mcHdrcW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NzM0NTksImV4cCI6MjA1OTI0OTQ1OX0.Ef24eDi6anULVy797mfFFro6neCRolrNZ528-J6hv3E';

// Create Supabase client with explicit session handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});

// Types for user profile data
export type UserProfile = {
  id: string;
  username: string;
  is_developer: boolean;
};

// Type for blog data
export type Blog = {
  id: string;
  title: string;
  content: string;
  date: string;
  read_time?: string;
  readTime?: string;
  image_url?: string;
  imageUrl?: string;
  subject?: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
  author_id?: string;
};

// Type for quiz data
export type Quiz = {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  difficulty: string;
  created_at: string;
  expires_at: string;
  password?: string | null;
  author_id?: string;
};

export type QuizQuestion = {
  id: string;
  text?: string;
  question?: string;
  type?: 'mcq' | 'truefalse' | 'multiple-choice' | 'true-false';
  options?: string[];
  correctOption?: number;
  correctAnswer?: string | boolean | number;
  explanation?: string;
};

// Simplified developer login function for demo
export const validateDeveloperLogin = async (username: string, password: string): Promise<UserProfile | null> => {
  console.log('Attempting login with:', username);
  
  // Ensure username and password are provided
  if (!username || username.trim() === '') {
    console.error('Username is empty');
    return null;
  }
  
  if (!password || password.trim() === '') {
    console.error('Password is empty');
    return null;
  }

  try {
    // First try to sign in - use a standardized email format
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: `${username.toLowerCase()}@learninglab.dev`,
      password: password
    });

    if (authError) {
      console.log('Sign in error:', authError.message);
      
      // If login fails, create a new account automatically for demo purposes
      console.log('Creating new account for:', username);
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: `${username.toLowerCase()}@learninglab.dev`,
        password: password
      });
      
      if (signUpError) {
        console.error('Sign up error:', signUpError);
        return null;
      }
      
      if (!signUpData.user) {
        console.error('No user data after signup');
        return null;
      }
      
      // Create a developer profile for the new user
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert([{ 
          username: username, 
          is_developer: true,
          id: signUpData.user.id 
        }])
        .select()
        .single();
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
        return null;
      }
      
      return newProfile;
    }

    if (!authData.user) {
      console.error('Authentication successful but no user data returned');
      return null;
    }

    // Check if profile exists
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError || !profileData) {
      // Create profile if it doesn't exist
      const { data: newProfile, error: newProfileError } = await supabase
        .from('profiles')
        .insert([{ 
          username: username, 
          is_developer: true,
          id: authData.user.id 
        }])
        .select()
        .single();
      
      if (newProfileError) {
        console.error('Profile creation error:', newProfileError);
        return null;
      }
      
      return newProfile;
    }
    
    // Ensure developer status is set
    if (!profileData.is_developer) {
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ is_developer: true })
        .eq('id', profileData.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Profile update error:', updateError);
        return null;
      }
      
      return updatedProfile;
    }
    
    return profileData;
  } catch (error) {
    console.error('Unexpected error during login:', error);
    return null;
  }
};
