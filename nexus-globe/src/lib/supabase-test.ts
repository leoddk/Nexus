import { createClient } from '@supabase/supabase-js';

// Temporary test - replace with your actual values
const supabaseUrl = 'https://your-project-ref.supabase.co';
const supabaseKey = 'your-anon-key-here';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count');
    console.log('Supabase connection test:', { data, error });
    return { success: !error, error };
  } catch (err) {
    console.error('Supabase connection failed:', err);
    return { success: false, error: err };
  }
};