
import { createClient } from '@supabase/supabase-js';

// Supabase project credentials
const supabaseUrl = 'https://bolmkvtrtrnvofpwkqnt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbG1rdnRydHJudm9mcHdrcW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NzM0NTksImV4cCI6MjA1OTI0OTQ1OX0.Ef24eDi6anULVy797mfFFro6neCRolrNZ528-J6hv3E';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: false,
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

  // Check if developer profile exists in the database
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .eq('is_developer', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
};
