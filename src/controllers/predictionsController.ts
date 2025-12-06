import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get all predictions with optional filtering
export const getAllPredictions = async (req: Request, res: Response) => {
  try {
    let query = supabase
      .from('user_predictions')
      .select(`
        *,
        match:matches!user_predictions_match_id_fkey(
          *,
          home_team:teams!matches_home_team_id_fkey(name, short_code),
          away_team:teams!matches_away_team_id_fkey(name, short_code)
        )
      `);

    // Apply filters if provided
    if (req.query.match_id) {
      query = query.eq('match_id', req.query.match_id);
    }

    if (req.query.user_id) {
      query = query.eq('user_id', req.query.user_id);
      // Also filter by user_type to ensure we're getting the right type of predictions
      // For regular users, we don't transform the user_id, so we filter by user_type = 'user'
      // For admin users, they would have negative user_ids, but we still filter by user_type for clarity
      if (!req.query.user_type) {
        query = query.eq('user_type', 'user');
      }
    }

    // Allow explicit filtering by user_type if provided
    if (req.query.user_type) {
      query = query.eq('user_type', req.query.user_type);
    }

    const { data, error } = await query.order('prediction_date', { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Error fetching predictions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch predictions',
      error: error.message
    });
  }
};

// Get a specific prediction by ID
export const getPredictionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('user_predictions')
      .select(`
        *,
        match:matches!user_predictions_match_id_fkey(
          *,
          home_team:teams!matches_home_team_id_fkey(name, short_code),
          away_team:teams!matches_away_team_id_fkey(name, short_code)
        )
      `)
      .eq('prediction_id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Prediction not found'
      });
    }

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Error fetching prediction:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch prediction',
      error: error.message
    });
  }
};

// Get all admin votes (for testing purposes)
export const getAllAdminVotes = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('admin_match_votes')
      .select('*');

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Error fetching admin votes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin votes',
      error: error.message
    });
  }
};

// Create an admin match vote
export const createAdminMatchVote = async (req: Request, res: Response) => {
  try {
    const { admin_id, match_id, predicted_winner } = req.body;

    // Validate predicted_winner value
    const validWinners = ['Home', 'Away', 'Draw'];
    if (!validWinners.includes(predicted_winner)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid predicted_winner value. Must be one of: Home, Away, Draw'
      });
    }

    // Create new admin vote (admins can have multiple votes for the same match)

    const { data, error } = await supabase
      .from('admin_match_votes')
      .insert([{
        admin_id,
        match_id,
        predicted_winner
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update match vote counts based on actual predictions
    try {
      await updateMatchVoteCountsFromPredictions(parseInt(match_id));
    } catch (voteCountError) {
      console.error('Failed to update vote counts:', voteCountError);
      // Don't fail the whole request if vote count update fails
    }

    return res.status(201).json({
      success: true,
      message: 'Admin vote created successfully',
      data: data
    });
  } catch (error: any) {
    console.error('Error creating admin vote:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create admin vote',
      error: error.message
    });
  }
};

// Test function to check if admin_match_votes table exists
export const testAdminTable = async (req: Request, res: Response) => {
  try {
    // Try to insert a test record into admin_match_votes table
    const { data, error } = await supabase
      .from('admin_match_votes')
      .insert([{
        admin_id: 1,
        match_id: 1,
        predicted_winner: 'Home'
      }])
      .select()
      .single();

    if (error) {
      return res.status(200).json({
        success: false,
        message: 'admin_match_votes table does not exist or is not accessible',
        error: error.message
      });
    }

    // If successful, delete the test record and return success
    await supabase
      .from('admin_match_votes')
      .delete()
      .eq('vote_id', data.vote_id);

    return res.status(200).json({
      success: true,
      message: 'admin_match_votes table exists and is accessible'
    });
  } catch (error: any) {
    console.error('Error testing admin table:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to test admin table',
      error: error.message
    });
  }
};

// Helper function to update match vote counts based on actual user predictions
export const updateMatchVoteCountsFromPredictions = async (match_id: number) => {
  try {
    // Get all user predictions for this match
    const { data: userPredictions, error: fetchUserPredictionsError } = await supabase
      .from('user_predictions')
      .select('predicted_winner')
      .eq('match_id', match_id);

    if (fetchUserPredictionsError) {
      throw fetchUserPredictionsError;
    }

    // Get all admin votes for this match
    const { data: adminVotes, error: fetchAdminVotesError } = await supabase
      .from('admin_match_votes')
      .select('predicted_winner')
      .eq('match_id', match_id);

    if (fetchAdminVotesError) {
      throw fetchAdminVotesError;
    }

    // Count user votes
    let user_home_votes = 0;
    let user_draw_votes = 0;
    let user_away_votes = 0;

    userPredictions.forEach(prediction => {
      switch (prediction.predicted_winner) {
        case 'Home':
          user_home_votes++;
          break;
        case 'Draw':
          user_draw_votes++;
          break;
        case 'Away':
          user_away_votes++;
          break;
      }
    });

    // Count admin votes
    let admin_home_votes = 0;
    let admin_draw_votes = 0;
    let admin_away_votes = 0;

    adminVotes.forEach(vote => {
      switch (vote.predicted_winner) {
        case 'Home':
          admin_home_votes++;
          break;
        case 'Draw':
          admin_draw_votes++;
          break;
        case 'Away':
          admin_away_votes++;
          break;
      }
    });

    // The displayed votes should be the sum of admin votes (baseline) + user votes
    const total_home_votes = admin_home_votes + user_home_votes;
    const total_draw_votes = admin_draw_votes + user_draw_votes;
    const total_away_votes = admin_away_votes + user_away_votes;
    const total_votes = total_home_votes + total_draw_votes + total_away_votes;

    // Check if vote counts already exist for this match
    const { data: existingVoteRecord, error: checkError } = await supabase
      .from('match_vote_counts')
      .select('vote_id')
      .eq('match_id', match_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingVoteRecord) {
      // Update existing vote counts
      const { data, error } = await supabase
        .from('match_vote_counts')
        .update({
          home_votes: total_home_votes,
          draw_votes: total_draw_votes,
          away_votes: total_away_votes,
          total_votes: total_votes
        })
        .eq('match_id', match_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new vote counts
      const { data, error } = await supabase
        .from('match_vote_counts')
        .insert([{
          match_id,
          home_votes: total_home_votes,
          draw_votes: total_draw_votes,
          away_votes: total_away_votes,
          total_votes: total_votes
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error updating match vote counts from predictions:', error);
    throw error;
  }
};

// Helper function to update match vote counts based on score predictions
export const updateMatchVoteCountsFromScorePredictions = async (match_id: number) => {
  try {
    // Get user score predictions from score_predictions table
    const { data: userScorePredictions, error: fetchUserPredictionsError } = await supabase
      .from('score_predictions')
      .select('home_score, away_score, vote_count')
      .eq('match_id', match_id);

    if (fetchUserPredictionsError) {
      throw fetchUserPredictionsError;
    }

    // Get admin score predictions from admin_score_predictions table
    const { data: adminScorePredictions, error: fetchAdminPredictionsError } = await supabase
      .from('admin_score_predictions')
      .select('home_score, away_score, vote_count')
      .eq('match_id', match_id);

    if (fetchAdminPredictionsError) {
      throw fetchAdminPredictionsError;
    }

    // Count admin votes (baseline set through admin predictions)
    let admin_home_votes = 0;
    let admin_draw_votes = 0;
    let admin_away_votes = 0;

    // Count admin votes from admin_score_predictions table
    (adminScorePredictions || []).forEach(prediction => {
      const predictedWinner = getPredictedWinner(prediction.home_score, prediction.away_score);
      const voteCount = prediction.vote_count || 0;
      switch (predictedWinner) {
        case 'Home':
          admin_home_votes += voteCount;
          break;
        case 'Draw':
          admin_draw_votes += voteCount;
          break;
        case 'Away':
          admin_away_votes += voteCount;
          break;
      }
    });

    // Count user votes
    let user_home_votes = 0;
    let user_draw_votes = 0;
    let user_away_votes = 0;

    // Count user votes from score_predictions table
    (userScorePredictions || []).forEach(prediction => {
      const predictedWinner = getPredictedWinner(prediction.home_score, prediction.away_score);
      const voteCount = prediction.vote_count || 0;
      switch (predictedWinner) {
        case 'Home':
          user_home_votes += voteCount;
          break;
        case 'Draw':
          user_draw_votes += voteCount;
          break;
        case 'Away':
          user_away_votes += voteCount;
          break;
      }
    });

    // The displayed votes should be the sum of admin votes (baseline) + user votes
    const total_home_votes = admin_home_votes + user_home_votes;
    const total_draw_votes = admin_draw_votes + user_draw_votes;
    const total_away_votes = admin_away_votes + user_away_votes;
    const total_votes = total_home_votes + total_draw_votes + total_away_votes;

    // Check if vote counts already exist for this match
    const { data: existingVoteRecord, error: checkError } = await supabase
      .from('match_vote_counts')
      .select('vote_id')
      .eq('match_id', match_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingVoteRecord) {
      // Update existing vote counts
      const { data, error } = await supabase
        .from('match_vote_counts')
        .update({
          home_votes: total_home_votes,
          draw_votes: total_draw_votes,
          away_votes: total_away_votes,
          total_votes: total_votes
        })
        .eq('match_id', match_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new vote counts
      const { data, error } = await supabase
        .from('match_vote_counts')
        .insert([{
          match_id,
          home_votes: total_home_votes,
          draw_votes: total_draw_votes,
          away_votes: total_away_votes,
          total_votes: total_votes
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error updating match vote counts from score predictions:', error);
    throw error;
  }
};

// Helper function to determine predicted winner from scores
const getPredictedWinner = (homeScore: number, awayScore: number): 'Home' | 'Draw' | 'Away' => {
  if (homeScore > awayScore) return 'Home';
  if (awayScore > homeScore) return 'Away';
  return 'Draw';
};

// Create a new prediction
export const createPrediction = async (req: Request, res: Response) => {
  try {
    let { user_id, match_id, predicted_winner, user_type = 'user' } = req.body;

    // For testing purposes, if no user_id is provided, use a default user ID
    if (!user_id) {
      user_id = 999; // Default test user ID
    }

    // Get the authenticated user
    const requestingUser = (req as any).user;
    const requestingUserId = requestingUser?.user_id || user_id; // Use provided user_id if no authenticated user

    // Validate predicted_winner value
    const validWinners = ['Home', 'Away', 'Draw'];
    if (!validWinners.includes(predicted_winner)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid predicted_winner value. Must be one of: Home, Away, Draw'
      });
    }

    // Validate user_type value
    const validUserTypes = ['user', 'admin'];
    if (!validUserTypes.includes(user_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user_type value. Must be one of: user, admin'
      });
    }

    // For user-type predictions, always use the provided user_id for testing
    // For admin-type predictions, use the provided user_id (admins can create predictions for any user)
    const effectiveUserId = user_id;

    // First check if a prediction already exists for this user and match
    let query = supabase
      .from('user_predictions')
      .select('*')
      .eq('match_id', match_id)
      .eq('user_id', effectiveUserId)
      .eq('user_type', user_type);

    const { data: existingPredictions, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

    const existingPrediction = existingPredictions && existingPredictions.length > 0 ? existingPredictions[0] : null;

    let result;
    if (existingPrediction) {
      // Update existing prediction
      const { data, error } = await supabase
        .from('user_predictions')
        .update({ predicted_winner })
        .eq('prediction_id', existingPrediction.prediction_id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      result = data;
    } else {
      // Create new prediction
      const { data, error } = await supabase
        .from('user_predictions')
        .insert([{
          user_id: effectiveUserId,
          match_id,
          predicted_winner,
          user_type
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      result = data;
    }

    // Update match vote counts based on actual predictions
    try {
      await updateMatchVoteCountsFromPredictions(parseInt(match_id));
    } catch (voteCountError) {
      console.error('Failed to update vote counts:', voteCountError);
      // Don't fail the whole request if vote count update fails
    }

    return res.status(201).json({
      success: true,
      message: existingPrediction ? 'Prediction updated successfully' : 'Prediction created successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Error creating/updating prediction:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create/update prediction',
      error: error.message
    });
  }
};

// Update an existing prediction
export const updatePrediction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { predicted_winner } = req.body;

    // Validate predicted_winner value
    const validWinners = ['Home', 'Away', 'Draw'];
    if (!validWinners.includes(predicted_winner)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid predicted_winner value. Must be one of: Home, Away, Draw'
      });
    }

    // Get the existing prediction to get match_id
    const { data: existingPrediction, error: fetchError } = await supabase
      .from('user_predictions')
      .select('match_id, user_id')
      .eq('prediction_id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Prediction not found'
        });
      }
      throw fetchError;
    }

    // For testing purposes, allow updating any prediction
    // In production, you would check if the requesting user owns this prediction
    const requestingUser = (req as any).user;
    const isAuthorized = true; // Allow all updates for testing

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this prediction'
      });
    }

    // Update the prediction
    const { data, error } = await supabase
      .from('user_predictions')
      .update({ predicted_winner })
      .eq('prediction_id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update match vote counts based on actual predictions
    try {
      await updateMatchVoteCountsFromPredictions(existingPrediction.match_id);
    } catch (voteCountError) {
      console.error('Failed to update vote counts:', voteCountError);
      // Don't fail the whole request if vote count update fails
    }

    return res.status(200).json({
      success: true,
      message: 'Prediction updated successfully',
      data: data
    });
  } catch (error: any) {
    console.error('Error updating prediction:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update prediction',
      error: error.message
    });
  }
};

// Delete a prediction
export const deletePrediction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // First get the prediction to get the match_id before deleting
    const { data: predictionToDelete, error: fetchError } = await supabase
      .from('user_predictions')
      .select('match_id')
      .eq('prediction_id', id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!predictionToDelete) {
      return res.status(404).json({
        success: false,
        message: 'Prediction not found'
      });
    }

    const { error } = await supabase
      .from('user_predictions')
      .delete()
      .eq('prediction_id', id);

    if (error) {
      throw error;
    }

    // Update match vote counts based on actual predictions
    try {
      await updateMatchVoteCountsFromPredictions(predictionToDelete.match_id);
    } catch (voteCountError) {
      console.error('Failed to update vote counts:', voteCountError);
      // Don't fail the whole request if vote count update fails
    }

    return res.status(200).json({
      success: true,
      message: 'Prediction deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting prediction:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete prediction',
      error: error.message
    });
  }
};

// Get score predictions for a match
export const getScorePredictions = async (req: Request, res: Response) => {
  try {
    const { match_id } = req.params;

    const { data, error } = await supabase
      .from('score_predictions')
      .select('*')
      .eq('match_id', match_id)
      .order('vote_count', { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Error fetching score predictions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch score predictions',
      error: error.message
    });
  }
};

// Create or update a score prediction (voting)
export const voteScorePrediction = async (req: Request, res: Response) => {
  try {
    const { match_id, home_score, away_score } = req.body;

    // Check if this score prediction already exists
    const { data: existingPrediction, error: fetchError } = await supabase
      .from('score_predictions')
      .select('*')
      .eq('match_id', match_id)
      .eq('home_score', home_score)
      .eq('away_score', away_score)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw fetchError;
    }

    let result;
    if (existingPrediction) {
      // Update existing prediction vote count
      const { data, error } = await supabase
        .from('score_predictions')
        .update({ vote_count: existingPrediction.vote_count + 1 })
        .eq('score_pred_id', existingPrediction.score_pred_id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      result = data;
    } else {
      // Create new score prediction
      const { data, error } = await supabase
        .from('score_predictions')
        .insert([{
          match_id,
          home_score,
          away_score,
          vote_count: 1
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      result = data;
    }

    // Update match vote counts based on score predictions
    try {
      await updateMatchVoteCountsFromScorePredictions(parseInt(match_id));
    } catch (voteCountError) {
      console.error('Failed to update vote counts:', voteCountError);
      // Don't fail the whole request if vote count update fails
    }

    return res.status(200).json({
      success: true,
      message: 'Score prediction voted successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Error voting score prediction:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to vote score prediction',
      error: error.message
    });
  }
};

// Run the final migration to separate admin votes
export const runFinalMigration = async (req: Request, res: Response) => {
  try {
    // 1. Move all existing admin votes from user_predictions to admin_match_votes
    const { data: adminVotesToMove, error: fetchError } = await supabase
      .from('user_predictions')
      .select('user_id, match_id, predicted_winner, prediction_date')
      .eq('user_type', 'admin');

    if (fetchError) {
      throw fetchError;
    }

    if (adminVotesToMove && adminVotesToMove.length > 0) {
      // Transform the data to match the admin_match_votes table structure
      const adminVotesData = adminVotesToMove.map(vote => ({
        admin_id: vote.user_id,
        match_id: vote.match_id,
        predicted_winner: vote.predicted_winner,
        vote_date: vote.prediction_date
      }));

      // Insert into admin_match_votes table
      const { error: insertError } = await supabase
        .from('admin_match_votes')
        .insert(adminVotesData);

      if (insertError) {
        throw insertError;
      }


    }

    // 2. Delete all admin votes from user_predictions table
    const { error: deleteError } = await supabase
      .from('user_predictions')
      .delete()
      .eq('user_type', 'admin');

    if (deleteError) {
      throw deleteError;
    }



    return res.status(200).json({
      success: true,
      message: 'Final migration completed successfully',
      migrated_admin_votes: adminVotesToMove ? adminVotesToMove.length : 0
    });
  } catch (error: any) {
    console.error('Error running final migration:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to run final migration',
      error: error.message
    });
  }
};

// Cleanup duplicate admin votes

// Cleanup duplicate admin votes
export const cleanupDuplicateAdminVotes = async (req: Request, res: Response) => {
  try {
    // For now, we'll just return success without doing anything
    // In a production environment, you would implement the cleanup logic here
    return res.status(200).json({
      success: true,
      message: 'Cleanup function placeholder',
      deleted_count: 0
    });
  } catch (error: any) {
    console.error('Error cleaning up duplicate admin votes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cleanup duplicate admin votes',
      error: error.message
    });
  }
};

// Remove all voting and score prediction votes from the database
export const removeAllVotes = async (req: Request, res: Response) => {
  try {
    // 1. Delete all user predictions
    const { error: userPredError } = await supabase
      .from('user_predictions')
      .delete()
      .neq('prediction_id', 0); // Delete all rows

    if (userPredError) {
      throw new Error(`Failed to delete user_predictions: ${userPredError.message}`);
    }

    // 2. Delete all admin match votes
    const { error: adminVotesError } = await supabase
      .from('admin_match_votes')
      .delete()
      .neq('vote_id', 0); // Delete all rows

    if (adminVotesError) {
      throw new Error(`Failed to delete admin_match_votes: ${adminVotesError.message}`);
    }

    // 3. Delete all score predictions
    const { error: scorePredError } = await supabase
      .from('score_predictions')
      .delete()
      .neq('score_pred_id', 0); // Delete all rows

    if (scorePredError) {
      throw new Error(`Failed to delete score_predictions: ${scorePredError.message}`);
    }

    // 4. Reset all match vote counts to zero
    const { error: voteCountsError } = await supabase
      .from('match_vote_counts')
      .update({
        home_votes: 0,
        draw_votes: 0,
        away_votes: 0,
        total_votes: 0
      })
      .neq('vote_id', 0); // Update all rows

    if (voteCountsError) {
      throw new Error(`Failed to reset match_vote_counts: ${voteCountsError.message}`);
    }

    return res.status(200).json({
      success: true,
      message: 'All votes and score predictions have been removed successfully'
    });
  } catch (error: any) {
    console.error('Error removing all votes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove all votes',
      error: error.message
    });
  }
};
