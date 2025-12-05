import { updateMatchVoteCountsFromScorePredictions } from './controllers/predictionsController';
import { supabase } from './config/supabase';

async function testVoteCounts() {
  try {
    // Test the function with match ID 1
    console.log('Testing vote count update for match ID 1...');
    await updateMatchVoteCountsFromScorePredictions(1);
    console.log('Vote count update completed successfully.');
    
    // Check the results
    const { data, error } = await supabase
      .from('match_vote_counts')
      .select('*')
      .eq('match_id', 1)
      .single();
      
    if (error) {
      console.error('Error fetching vote counts:', error);
    } else {
      console.log('Current vote counts:', data);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testVoteCounts();