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
const updateMatchVoteCountsFromPredictions = async (match_id: number) => {
  try {
    // Get all predictions for this match
    const { data: predictions, error: fetchError } = await supabase
      .from('user_predictions')
      .select('predicted_winner')
      .eq('match_id', match_id);

    if (fetchError) {
      throw fetchError;
    }

    // Count votes for each outcome
    let home_votes = 0;
    let draw_votes = 0;
    let away_votes = 0;

    predictions.forEach(prediction => {
      switch (prediction.predicted_winner) {
        case 'Home':
          home_votes++;
          break;
        case 'Draw':
          draw_votes++;
          break;
        case 'Away':
          away_votes++;
          break;
      }
    });

    const total_votes = home_votes + draw_votes + away_votes;

    // Check if vote counts already exist for this match
    const { data: existingVoteCounts, error: checkError } = await supabase
      .from('match_vote_counts')
      .select('vote_id')
      .eq('match_id', match_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingVoteCounts) {
      // Update existing vote counts
      const { data, error } = await supabase
        .from('match_vote_counts')
        .update({
          home_votes,
          draw_votes,
          away_votes,
          total_votes
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
          home_votes,
          draw_votes,
          away_votes,
          total_votes
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

// Create a new prediction
export const createPrediction = async (req: Request, res: Response) => {
  try {
    const { user_id, match_id, predicted_winner } = req.body;

    // Validate predicted_winner value
    const validWinners = ['Home', 'Away', 'Draw'];
    if (!validWinners.includes(predicted_winner)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid predicted_winner value. Must be one of: Home, Away, Draw'
      });
    }

    // First check if a prediction already exists for this user and match
    const { data: existingPrediction, error: fetchError } = await supabase
      .from('user_predictions')
      .select('*')
      .eq('user_id', user_id)
      .eq('match_id', match_id)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

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
          user_id,
          match_id,
          predicted_winner
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

// Update a prediction
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

    const { data, error } = await supabase
      .from('user_predictions')
      .update({ predicted_winner })
      .eq('prediction_id', id)
      .select()
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