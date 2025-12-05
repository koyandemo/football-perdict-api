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

// Helper function to update match vote counts based on actual user predictions
export const updateMatchVoteCountsFromPredictions = async (match_id: number) => {
  try {
    // Get all user predictions for this match
    const { data: userPredictions, error: fetchPredictionsError } = await supabase
      .from('user_predictions')
      .select('predicted_winner, user_type')
      .eq('match_id', match_id);

    if (fetchPredictionsError) {
      throw fetchPredictionsError;
    }

    // Count admin votes (baseline set through admin predictions)
    let admin_home_votes = 0;
    let admin_draw_votes = 0;
    let admin_away_votes = 0;

    // Count admin votes only
    userPredictions
      .filter(p => p.user_type === 'admin')
      .forEach(prediction => {
        switch (prediction.predicted_winner) {
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

    // Count user votes
    let user_home_votes = 0;
    let user_draw_votes = 0;
    let user_away_votes = 0;

    // Count user votes only
    userPredictions
      .filter(p => p.user_type === 'user')
      .forEach(prediction => {
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
    // Get all score predictions for this match
    const { data: scorePredictions, error: fetchPredictionsError } = await supabase
      .from('score_predictions')
      .select('home_score, away_score, vote_count, user_type')
      .eq('match_id', match_id);

    if (fetchPredictionsError) {
      throw fetchPredictionsError;
    }

    // Count admin votes (baseline set through admin predictions)
    let admin_home_votes = 0;
    let admin_draw_votes = 0;
    let admin_away_votes = 0;

    // Count admin votes only
    scorePredictions
      .filter(p => p.user_type === 'admin')
      .forEach(prediction => {
        const predictedWinner = getPredictedWinner(prediction.home_score, prediction.away_score);
        switch (predictedWinner) {
          case 'Home':
            admin_home_votes += prediction.vote_count;
            break;
          case 'Draw':
            admin_draw_votes += prediction.vote_count;
            break;
          case 'Away':
            admin_away_votes += prediction.vote_count;
            break;
        }
      });

    // Count user votes
    let user_home_votes = 0;
    let user_draw_votes = 0;
    let user_away_votes = 0;

    // Count user votes only
    scorePredictions
      .filter(p => p.user_type === 'user')
      .forEach(prediction => {
        const predictedWinner = getPredictedWinner(prediction.home_score, prediction.away_score);
        switch (predictedWinner) {
          case 'Home':
            user_home_votes += prediction.vote_count;
            break;
          case 'Draw':
            user_draw_votes += prediction.vote_count;
            break;
          case 'Away':
            user_away_votes += prediction.vote_count;
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

// Create a new prediction or update existing one
export const createPrediction = async (req: Request, res: Response) => {
  try {
    let { user_id, match_id, predicted_winner, user_type = 'user' } = req.body;

    // Get the authenticated user
    const requestingUser = (req as any).user;
    const requestingUserId = requestingUser?.user_id;

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

    // For user-type predictions, always use the authenticated user's ID
    // For admin-type predictions, use the provided user_id (admins can create predictions for any user)
    const effectiveUserId = user_type === 'user' ? requestingUserId : user_id;

    // Security check: non-admin users cannot specify a different user_id
    if (user_type === 'user' && user_id && user_id !== requestingUserId) {
      return res.status(403).json({
        success: false,
        message: 'Users cannot create predictions for other users'
      });
    }

    // If this is a user prediction and no user_id was provided, use the authenticated user's ID
    if (user_type === 'user' && !user_id) {
      user_id = requestingUserId;
    }

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
    let wasUpdated = false;
    
    if (existingPrediction) {
      // Update existing prediction
      console.log(`Updating existing prediction ${existingPrediction.prediction_id} for user ${effectiveUserId}, match ${match_id}`);
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
      wasUpdated = true;
    } else {
      // Create new prediction
      console.log(`Creating new prediction for user ${effectiveUserId}, match ${match_id}`);
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
      message: wasUpdated ? 'Prediction updated successfully' : 'Prediction created successfully',
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

// Update a prediction
export const updatePrediction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { predicted_winner, user_type = 'user' } = req.body;
    // Get the user ID from the authenticated user
    const requestingUser = (req as any).user;
    const requestingUserId = requestingUser?.user_id;

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

    // First, get the existing prediction to check permissions
    const { data: existingPrediction, error: fetchError } = await supabase
      .from('user_predictions')
      .select('*')
      .eq('prediction_id', id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!existingPrediction) {
      return res.status(404).json({
        success: false,
        message: 'Prediction not found'
      });
    }

    // Check permissions:
    // 1. Admins can update admin predictions (user_type = 'admin')
    // 2. Users can update their own user predictions (user_type = 'user' and user_id matches)
    // 3. No one can modify predictions of a different type than what they're requesting
    
    const isAdmin = requestingUser?.type === 'admin';
    const isOwnUserPrediction = existingPrediction.user_id === requestingUserId && existingPrediction.user_type === 'user';
    const isAdminUpdatingAdminPrediction = isAdmin && existingPrediction.user_type === 'admin';
    
    // Check if the user is authorized to update this prediction
    if (!(isOwnUserPrediction || isAdminUpdatingAdminPrediction)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this prediction'
      });
    }
    
    // If a user is trying to change the user_type, prevent it
    if (existingPrediction.user_type !== user_type) {
      return res.status(403).json({
        success: false,
        message: 'You cannot change the type of an existing prediction'
      });
    }

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
      await updateMatchVoteCountsFromPredictions(data.match_id);
    } catch (voteCountError) {
      console.error('Failed to update vote counts:', voteCountError);
      // Don't fail the whole request if vote count update fails
    }

    return res.status(200).json({
      success: true,
      message: 'Prediction updated successfully',
      data
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