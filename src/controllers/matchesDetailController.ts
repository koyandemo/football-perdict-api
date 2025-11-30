import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get match outcomes
export const getMatchOutcomes = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('match_outcomes')
      .select('*')
      .eq('match_id', id)
      .single();

    if (error) {
      // If no outcomes found, return default values
      if (error.code === 'PGRST116') {
        return res.status(200).json({
          success: true,
          data: {
            match_id: parseInt(id),
            home_win_prob: 0,
            draw_prob: 0,
            away_win_prob: 0
          }
        });
      }
      throw error;
    }

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Error fetching match outcomes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch match outcomes',
      error: error.message
    });
  }
};

// Update match outcomes
export const updateMatchOutcomes = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { home_win_prob, draw_prob, away_win_prob } = req.body;

    // Check if outcomes already exist for this match
    const { data: existingOutcomes, error: fetchError } = await supabase
      .from('match_outcomes')
      .select('outcome_id')
      .eq('match_id', id)
      .single();

    let result;
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingOutcomes) {
      // Update existing outcomes
      const { data, error } = await supabase
        .from('match_outcomes')
        .update({
          home_win_prob,
          draw_prob,
          away_win_prob
        })
        .eq('match_id', id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new outcomes
      const { data, error } = await supabase
        .from('match_outcomes')
        .insert([{
          match_id: parseInt(id),
          home_win_prob,
          draw_prob,
          away_win_prob
        }])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return res.status(200).json({
      success: true,
      message: 'Match outcomes updated successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Error updating match outcomes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update match outcomes',
      error: error.message
    });
  }
};

// Get match vote counts (actual vote counts)
export const getMatchVoteCounts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('match_vote_counts')
      .select('*')
      .eq('match_id', id)
      .single();

    if (error) {
      // If no vote counts found, return default values
      if (error.code === 'PGRST116') {
        return res.status(200).json({
          success: true,
          data: {
            match_id: parseInt(id),
            home_votes: 0,
            draw_votes: 0,
            away_votes: 0,
            total_votes: 0
          }
        });
      }
      throw error;
    }

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Error fetching match vote counts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch match vote counts',
      error: error.message
    });
  }
};

// Update match vote counts (actual vote counts)
export const updateMatchVoteCounts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { home_votes, draw_votes, away_votes } = req.body;
    
    // Calculate total votes
    const total_votes = home_votes + draw_votes + away_votes;

    // Check if vote counts already exist for this match
    const { data: existingVoteCounts, error: fetchError } = await supabase
      .from('match_vote_counts')
      .select('vote_id')
      .eq('match_id', id)
      .single();

    let result;
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
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
        .eq('match_id', id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new vote counts
      const { data, error } = await supabase
        .from('match_vote_counts')
        .insert([{
          match_id: parseInt(id),
          home_votes,
          draw_votes,
          away_votes,
          total_votes
        }])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return res.status(200).json({
      success: true,
      message: 'Match vote counts updated successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Error updating match vote counts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update match vote counts',
      error: error.message
    });
  }
};

// Get score predictions for a match
export const getScorePredictions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('score_predictions')
      .select('*')
      .eq('match_id', id)
      .order('vote_count', { ascending: false });

    if (error) throw error;

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

// Vote for a score prediction
export const voteScorePrediction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { home_score, away_score } = req.body;

    // Check if this score prediction already exists
    const { data: existingPrediction, error: fetchError } = await supabase
      .from('score_predictions')
      .select('*')
      .eq('match_id', id)
      .eq('home_score', home_score)
      .eq('away_score', away_score)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
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

      if (error) throw error;
      result = data;
    } else {
      // Create new score prediction
      const { data, error } = await supabase
        .from('score_predictions')
        .insert([{
          match_id: parseInt(id),
          home_score,
          away_score,
          vote_count: 1
        }])
        .select()
        .single();

      if (error) throw error;
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

// Update score prediction with specific values and vote count
export const updateScorePredictionVoteCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { score_pred_id, home_score, away_score, vote_count } = req.body;

    let result;
    
    // If score_pred_id is provided, update existing prediction
    if (score_pred_id) {
      const { data, error } = await supabase
        .from('score_predictions')
        .update({ 
          home_score: home_score,
          away_score: away_score,
          vote_count: vote_count 
        })
        .eq('score_pred_id', score_pred_id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Check if this score prediction already exists by matching scores
      const { data: existingPrediction, error: fetchError } = await supabase
        .from('score_predictions')
        .select('*')
        .eq('match_id', id)
        .eq('home_score', home_score)
        .eq('away_score', away_score)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingPrediction) {
        // Update existing prediction with new values and vote count
        const { data, error } = await supabase
          .from('score_predictions')
          .update({ 
            home_score: home_score,
            away_score: away_score,
            vote_count: vote_count 
          })
          .eq('score_pred_id', existingPrediction.score_pred_id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new score prediction
        const { data, error } = await supabase
          .from('score_predictions')
          .insert([{
            match_id: parseInt(id),
            home_score,
            away_score,
            vote_count
          }])
          .select()
          .single();

        if (error) throw error;
        result = data;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Score prediction updated successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Error updating score prediction:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update score prediction',
      error: error.message
    });
  }
};

// Get comments for a match
export const getMatchComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('match_id', id)
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Error fetching match comments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch match comments',
      error: error.message
    });
  }
};

// Create a comment for a match
export const createMatchComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id, comment_text } = req.body;

    const { data, error } = await supabase
      .from('comments')
      .insert([{
        match_id: parseInt(id),
        user_id,
        comment_text
      }])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data
    });
  } catch (error: any) {
    console.error('Error creating match comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create comment',
      error: error.message
    });
  }
};