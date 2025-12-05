import { supabase } from '../config/supabase';

async function testSchema() {
  try {
    // Test if we can query the matches table with the match_timezone column
    const { data, error } = await supabase
      .from('matches')
      .select('match_id, match_timezone')
      .limit(1);

    if (error) {
      console.error('Error querying matches table:', error);
      return;
    }

    console.log('Successfully queried matches table:', data);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testSchema();