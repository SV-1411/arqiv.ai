import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface SavedResearchRow {
  id: string;
  user_id: string;
  topic: string;
  response: string;
  mode: string;
  depth: string;
  wiki_image: string;
  images: any[];
  suggestions: string[];
  created_at: string;
  updated_at: string;
}