
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
  created_at: string;
};

// Helper function to directly create/get the developer user
export const getOrCreateDeveloperProfile = async (): Promise<UserProfile | null> => {
  try {
    const developerUsername = 'arhub-07-2010';
    const developerId = '00000000-0000-0000-0000-000000000000'; // Fixed ID for developer
    
    // First check if the developer exists in the profiles table
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', developerUsername)
      .maybeSingle();
    
    // If developer profile exists, return it
    if (!profileError && existingProfile) {
      console.log('Developer profile found:', existingProfile);
      return existingProfile as UserProfile;
    }
    
    console.log('Developer profile not found, creating...');
    
    // Create the developer profile using direct insert
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: developerId,
        username: developerUsername,
        is_developer: true
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating developer profile:', insertError);
      
      // If insert failed, try one more time with upsert
      const { data: upsertProfile, error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: developerId,
          username: developerUsername,
          is_developer: true
        })
        .select()
        .single();
        
      if (upsertError) {
        console.error('Upsert also failed:', upsertError);
        return null;
      }
      
      return upsertProfile as UserProfile;
    }
    
    return newProfile as UserProfile;
  } catch (error) {
    console.error('Error in getOrCreateDeveloperProfile:', error);
    return null;
  }
};

// For backward compatibility
export const createDeveloperIfNeeded = async () => {
  await getOrCreateDeveloperProfile();
};
