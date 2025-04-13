
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

// Types for blog data from Supabase
export type Blog = {
  id: string;
  title: string;
  content: string;
  date: string;
  read_time: string;  // Database field
  readTime?: string;  // For compatibility with components
  image_url?: string; // Database field
  imageUrl?: string;  // For compatibility with components
  author_id?: string;
  created_at: string;
  updated_at: string;
};

// Types for user profile data
export type UserProfile = {
  id: string;
  username: string;
  is_developer: boolean;
  created_at: string;
  updated_at: string;
};

// Types for user data
export type UserData = {
  id: string;
  username: string;
  email: string;
  created_at: string;
};

// Helper function to create developer user (only used in development)
export const createDeveloperIfNeeded = async () => {
  try {
    // Check if developer exists by trying to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: 'arhub-07-2010@example.com',
      password: 'a@Rawat2010'
    });
    
    if (!signInError) {
      console.log('Developer user exists');
      // Sign out after checking
      await supabase.auth.signOut();
      return;
    }
    
    // If we got here, the developer doesn't exist, so create them
    const { error: signUpError } = await supabase.auth.signUp({
      email: 'arhub-07-2010@example.com',
      password: 'a@Rawat2010',
      options: {
        data: {
          username: 'arhub-07-2010'
        }
      }
    });
    
    if (signUpError) {
      console.error('Error creating developer user:', signUpError);
    } else {
      console.log('Developer user created successfully');
    }
  } catch (error) {
    console.error('Error in createDeveloperIfNeeded:', error);
  }
};
