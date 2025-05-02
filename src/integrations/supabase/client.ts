
import { createClient } from "@supabase/supabase-js";

// Supabase configuration
// Using hardcoded values for the Lovable preview since env variables might not be properly loaded
const SUPABASE_URL = "https://bolmkvtrtrnvofpwkqnt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbG1rdnRydHJudm9mcHdrcW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NzM0NTksImV4cCI6MjA1OTI0OTQ1OX0.Ef24eDi6anULVy797mfFFro6neCRolrNZ528-J6hv3E";

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Types
export interface User {
  id: string;
  email: string;
  role?: string;
  avatar_url?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  is_developer: boolean;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  date: string;
  readTime?: string;
  read_time?: string;
  subject?: string;
  imageUrl?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  type?: 'mcq' | 'truefalse'; // Updated to match the actual usage in components
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  password?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  time_limit?: number;
  passing_score?: number;
  difficulty?: string; // Added missing property used in components
  expires_at?: string; // Added missing property used in components
}

export interface Pageview {
  id: string;
  url: string;
  referrer?: string;
  browser?: string;
  device?: string;
  created_at: string;
  website_id: string;
}

export interface Website {
  id: string;
  name: string;
  domain: string;
  created_at: string;
}

export interface TrafficSummary {
  totalViews: number;
  uniqueVisitors: number;
  topPages: { url: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
}
