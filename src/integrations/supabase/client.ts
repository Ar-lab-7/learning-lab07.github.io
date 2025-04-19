
import { createClient } from '@supabase/supabase-js';

// Supabase project credentials
const supabaseUrl = 'https://bolmkvtrtrnvofpwkqnt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbG1rdnRydHJudm9mcHdrcW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NzM0NTksImV4cCI6MjA1OTI0OTQ1OX0.Ef24eDi6anULVy797mfFFro6neCRolrNZ528-J6hv3E';

// Create Supabase client
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

// Function to validate developer login
export const validateDeveloperLogin = async (username: string, password: string): Promise<UserProfile | null> => {
  // Hardcoded developer credentials
  const developerUsername = 'arhub-07-2010';
  const developerPassword = 'a@Rawat2010';

  if (username !== developerUsername || password !== developerPassword) {
    return null;
  }

  // Authenticate with Supabase
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: `${username}@learninglab.dev`,
    password: developerPassword
  });

  if (authError || !authData.user) {
    console.error('Authentication error:', authError);
    
    // If user doesn't exist, create one
    if (authError?.message.includes('Invalid login credentials')) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: `${username}@learninglab.dev`,
        password: developerPassword
      });
      
      if (signUpError) {
        console.error('Sign up error:', signUpError);
        return null;
      }
      
      if (signUpData.user) {
        console.log('New developer account created');
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
    .eq('is_developer', true)
    .single();

  if (error || !data) {
    console.error('Profile fetch error:', error);
    return null;
  }

  return data;
};
