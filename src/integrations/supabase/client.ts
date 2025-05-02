
import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || '';

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Types
export interface User {
  id: string;
  email: string;
  role?: string;
  avatar_url?: string;
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
  type?: 'multiple-choice' | 'true-false';
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
  time_limit?: number; // Added this property
  passing_score?: number; // Added this property
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
