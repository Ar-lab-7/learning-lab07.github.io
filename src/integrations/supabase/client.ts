
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

// Helper function to create developer user in database directly
export const createDeveloperIfNeeded = async () => {
  try {
    const developerUsername = 'arhub-07-2010';
    
    // First, check if the developer exists in the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', developerUsername)
      .single();
    
    if (!userError && userData) {
      console.log('Developer user exists in the users table');
      return;
    }
    
    // Check if user already exists in auth by trying to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: `${developerUsername}@example.com`,
      password: 'a@Rawat2010'
    });
    
    if (!signInError && signInData) {
      console.log('Developer user exists and can sign in');
      await supabase.auth.signOut();
      return;
    }
    
    // If we got here, either the developer doesn't exist or can't sign in
    // We'll directly insert the user records in the database tables
    
    // First manually create a UUID to use across tables
    const developerId = crypto.randomUUID();
    
    // Insert into profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: developerId,
        username: developerUsername,
        is_developer: true
      });
    
    if (profileError) {
      console.error('Error creating developer profile:', profileError);
    } else {
      console.log('Developer profile created successfully');
    }
    
    // Insert into users table
    const { error: userInsertError } = await supabase
      .from('users')
      .insert({
        id: developerId,
        username: developerUsername,
        email: `${developerUsername}@example.com`
      });
    
    if (userInsertError) {
      console.error('Error creating developer user record:', userInsertError);
    } else {
      console.log('Developer user record created successfully');
    }
    
  } catch (error) {
    console.error('Error in createDeveloperIfNeeded:', error);
  }
};
