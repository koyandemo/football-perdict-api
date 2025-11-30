import { supabase } from '../config/supabase';

// Test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    // Test query to check if we can connect to the database
    const { data, error } = await supabase
      .from('leagues')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }

    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test failed with exception:', error);
    return false;
  }
};