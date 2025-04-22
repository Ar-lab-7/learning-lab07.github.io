
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
  created_at?: string;
  updated_at?: string;
  author_id?: string;
};

// Function to validate developer login - simplified for demo
export const validateDeveloperLogin = async (username: string, password: string): Promise<UserProfile | null> => {
  console.log('Attempting login with:', username);
  
  // Accept any non-empty password for simplified testing
  if (!password || password.trim() === '') {
    console.error('Password is empty');
    return null;
  }

  try {
    // Try to authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: `${username}@learninglab.dev`,
      password: password
    });

    if (authError) {
      console.error('Authentication error:', authError);
      
      // If user doesn't exist, create one automatically
      if (authError.message.includes('Invalid login credentials')) {
        console.log('Creating new user account');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: `${username}@learninglab.dev`,
          password: password
        });
        
        if (signUpError) {
          console.error('Sign up error:', signUpError);
          return null;
        }
        
        if (signUpData.user) {
          console.log('New user account created');
        }
      } else {
        return null;
      }
    }

    // Check if developer profile exists in the database
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) {
      console.log('Creating new developer profile');
      
      // Create a developer profile if it doesn't exist
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert([{ 
          username: username, 
          is_developer: true,
          id: authData?.user?.id || username
        }])
        .select()
        .single();
        
      if (profileError || !newProfile) {
        console.error('Profile creation error:', profileError);
        return null;
      }
      
      return newProfile;
    }

    // Ensure the profile has developer privileges
    if (!data.is_developer) {
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ is_developer: true })
        .eq('id', data.id)
        .select()
        .single();
        
      if (updateError) {
        console.error('Profile update error:', updateError);
        return null;
      }
      
      return updatedProfile;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error during login:', error);
    return null;
  }
};
