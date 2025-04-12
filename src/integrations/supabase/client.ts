
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
  read_time: string;  // This is from the database
  readTime?: string;  // This is for compatibility with components expecting readTime
  image_url?: string;
  imageUrl?: string;  // For compatibility
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
