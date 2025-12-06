import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { updateMatchVoteCountsFromScorePredictions } from './predictionsController';

// Get match vote counts (combines user and admin votes) with calculated percentages
export const getMatchVoteCounts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Fetch user vote counts
    const { data: userVotes, error: userError } = await supabase
      .from('match_vote_counts')
      .select('*')
      .eq('match_id', id)
      .maybeSingle();

    // Fetch admin vote counts
    const { data: adminVotes, error: adminError } = await supabase
      .from('admin_match_vote_counts')
      .select('*')
      .eq('match_id', id)
      .maybeSingle();

    // Initialize vote counts
    const user_home_votes = userVotes?.home_votes || 0;
    const user_draw_votes = userVotes?.draw_votes || 0;
    const user_away_votes = userVotes?.away_votes || 0;

    const admin_home_votes = adminVotes?.home_votes || 0;
    const admin_draw_votes = adminVotes?.draw_votes || 0;
    const admin_away_votes = adminVotes?.away_votes || 0;

    // Combine user and admin votes
    const home_votes = user_home_votes + admin_home_votes;
    const draw_votes = user_draw_votes + admin_draw_votes;
    const away_votes = user_away_votes + admin_away_votes;
    const total_votes = home_votes + draw_votes + away_votes;

    // Calculate percentages dynamically from combined vote counts
    let home_percentage = 0;
    let draw_percentage = 0;
    let away_percentage = 0;

    if (total_votes > 0) {
      // Calculate raw percentages
      const rawHomePercent = (home_votes / total_votes) * 100;
      const rawDrawPercent = (draw_votes / total_votes) * 100;
      const rawAwayPercent = (away_votes / total_votes) * 100;

      // Round percentages
      home_percentage = Math.round(rawHomePercent);
      draw_percentage = Math.round(rawDrawPercent);
      away_percentage = Math.round(rawAwayPercent);

      // Normalize to ensure they sum to exactly 100
      const percentageSum = home_percentage + draw_percentage + away_percentage;
      if (percentageSum !== 100 && total_votes > 0) {
        // Adjust the largest percentage to make the sum exactly 100
        const diff = 100 - percentageSum;
        if (home_votes >= draw_votes && home_votes >= away_votes) {
          home_percentage += diff;
        } else if (away_votes >= home_votes && away_votes >= draw_votes) {
          away_percentage += diff;
        } else {
          draw_percentage += diff;
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        vote_id: userVotes?.vote_id || 0,
        match_id: parseInt(id),
        home_votes,
        draw_votes,
        away_votes,
        total_votes,
        home_percentage,
        draw_percentage,
        away_percentage,
        // Include breakdown for transparency
        user_votes: {
          home: user_home_votes,
          draw: user_draw_votes,
          away: user_away_votes,
          total: user_home_votes + user_draw_votes + user_away_votes
        },
        admin_votes: {
          home: admin_home_votes,
          draw: admin_draw_votes,
          away: admin_away_votes,
          total: admin_home_votes + admin_draw_votes + admin_away_votes
        }
      }
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

// Update admin match vote counts
export const updateAdminMatchVoteCounts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { home_votes, draw_votes, away_votes } = req.body;
    
    // Calculate total votes
    const total_votes = home_votes + draw_votes + away_votes;

    // Check if vote counts already exist for this match
    const { data: existingVoteCounts, error: fetchError } = await supabase
      .from('admin_match_vote_counts')
      .select('vote_id')
      .eq('match_id', id)
      .maybeSingle();

    let result;
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingVoteCounts) {
      // Update existing vote counts
      const { data, error } = await supabase
        .from('admin_match_vote_counts')
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
        .from('admin_match_vote_counts')
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
      message: 'Admin vote counts updated successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Error updating admin vote counts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update admin vote counts',
      error: error.message
    });
  }
};

// Get score predictions for a match with calculated percentages (combines user and admin predictions)
export const getScorePredictions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Fetch user score predictions
    const { data: userPredictions, error: userError } = await supabase
      .from('score_predictions')
      .select('*')
      .eq('match_id', id);

    if (userError) throw userError;

    // Fetch admin score predictions
    const { data: adminPredictions, error: adminError } = await supabase
      .from('admin_score_predictions')
      .select('*')
      .eq('match_id', id);

    if (adminError) throw adminError;

    // Combine predictions by score
    const combinedPredictionsMap = new Map<string, any>();

    // Add user predictions
    userPredictions?.forEach(pred => {
      const key = `${pred.home_score}-${pred.away_score}`;
      const voteCount = pred.vote_count || 0; // Handle null values
      combinedPredictionsMap.set(key, {
        score_pred_id: pred.score_pred_id,
        match_id: pred.match_id,
        home_score: pred.home_score,
        away_score: pred.away_score,
        vote_count: voteCount,
        user_votes: voteCount,
        admin_votes: 0
      });
    });

    // Add or merge admin predictions
    adminPredictions?.forEach(pred => {
      const key = `${pred.home_score}-${pred.away_score}`;
      const voteCount = pred.vote_count || 0; // Handle null values
      if (combinedPredictionsMap.has(key)) {
        const existing = combinedPredictionsMap.get(key);
        existing.vote_count += voteCount;
        existing.admin_votes = voteCount;
      } else {
        combinedPredictionsMap.set(key, {
          score_pred_id: pred.score_pred_id,
          match_id: pred.match_id,
          home_score: pred.home_score,
          away_score: pred.away_score,
          vote_count: voteCount,
          user_votes: 0,
          admin_votes: voteCount
        });
      }
    });

    // Convert map to array
    const combinedPredictions = Array.from(combinedPredictionsMap.values());

    // Calculate total votes (filter out null values)
    const totalVotes = combinedPredictions.reduce((sum, pred) => sum + (pred.vote_count || 0), 0);

    // Add calculated percentages to each prediction and sort by vote count
    const predictionsWithPercentages = combinedPredictions
      .map(pred => {
        const voteCount = pred.vote_count || 0; // Handle null
        const percentage = totalVotes > 0 
          ? Math.round((voteCount / totalVotes) * 100) 
          : 0;
        
        return {
          ...pred,
          vote_count: voteCount, // Ensure vote_count is never null
          percentage
        };
      })
      .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));

    return res.status(200).json({
      success: true,
      data: predictionsWithPercentages,
      total_votes: totalVotes
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

// Vote for a score prediction (user votes only)
export const voteScorePrediction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { home_score, away_score, user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    // Check if user has already voted on any score prediction for this match
    const { data: userPreviousVotes, error: prevVoteError } = await supabase
      .from('user_score_votes')
      .select('*')
      .eq('match_id', id)
      .eq('user_id', user_id)
      .maybeSingle();

    if (prevVoteError && prevVoteError.code !== 'PGRST116') {
      throw prevVoteError;
    }

    const previousVote = userPreviousVotes;
    const newVoteKey = `${home_score}-${away_score}`;
    const previousVoteKey = previousVote ? `${previousVote.home_score}-${previousVote.away_score}` : null;

    // If user is voting for the same score, do nothing
    if (previousVoteKey === newVoteKey) {
      return res.status(200).json({
        success: true,
        message: 'Already voted for this score',
        data: null
      });
    }

    // If user had a previous vote, decrement that prediction's count
    if (previousVote) {
      const { data: oldPrediction } = await supabase
        .from('score_predictions')
        .select('*')
        .eq('match_id', id)
        .eq('home_score', previousVote.home_score)
        .eq('away_score', previousVote.away_score)
        .maybeSingle();

      if (oldPrediction) {
        await supabase
          .from('score_predictions')
          .update({ vote_count: Math.max(0, (oldPrediction.vote_count || 1) - 1) })
          .eq('score_pred_id', oldPrediction.score_pred_id);
      }
    }

    // Check if the new score prediction exists
    const { data: existingPrediction, error: fetchError } = await supabase
      .from('score_predictions')
      .select('*')
      .eq('match_id', id)
      .eq('home_score', home_score)
      .eq('away_score', away_score)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    let result;
    if (existingPrediction) {
      // Increment the new prediction's count
      const { data, error } = await supabase
        .from('score_predictions')
        .update({ 
          vote_count: (existingPrediction.vote_count || 0) + 1
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
          vote_count: 1
        }])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Update or create user's vote record
    if (previousVote) {
      // Update existing vote record
      await supabase
        .from('user_score_votes')
        .update({
          home_score,
          away_score,
          voted_at: new Date().toISOString()
        })
        .eq('vote_id', previousVote.vote_id);
    } else {
      // Create new vote record
      await supabase
        .from('user_score_votes')
        .insert([{
          match_id: parseInt(id),
          user_id,
          home_score,
          away_score
        }]);
    }

    // Update match vote counts based on score predictions
    try {
      await updateMatchVoteCountsFromScorePredictions(parseInt(id));
    } catch (voteCountError) {
      console.error('Failed to update vote counts:', voteCountError);
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

// Update score prediction with specific values and vote count (user predictions)
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
        .maybeSingle();

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

// Update admin score prediction with specific values and vote count
export const updateAdminScorePredictionVoteCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { score_pred_id, home_score, away_score, vote_count } = req.body;

    let result;
    
    // If score_pred_id is provided, update existing prediction
    if (score_pred_id) {
      // First check if the record exists
      const { data: existing, error: checkError } = await supabase
        .from('admin_score_predictions')
        .select('*')
        .eq('score_pred_id', score_pred_id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('admin_score_predictions')
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
        // Record with this ID doesn't exist, check if a record with same scores exists
        const { data: existingByScores, error: scoreCheckError } = await supabase
          .from('admin_score_predictions')
          .select('*')
          .eq('match_id', id)
          .eq('home_score', home_score)
          .eq('away_score', away_score)
          .maybeSingle();

        if (scoreCheckError) throw scoreCheckError;

        if (existingByScores) {
          // Update the existing record with same scores
          const { data, error } = await supabase
            .from('admin_score_predictions')
            .update({ 
              vote_count: vote_count
            })
            .eq('score_pred_id', existingByScores.score_pred_id)
            .select()
            .single();

          if (error) throw error;
          result = data;
        } else {
          // No record exists with these scores, create new one
          const { data, error } = await supabase
            .from('admin_score_predictions')
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
    } else {
      // Check if this score prediction already exists by matching scores
      const { data: existingPredictions, error: fetchError } = await supabase
        .from('admin_score_predictions')
        .select('*')
        .eq('match_id', id)
        .eq('home_score', home_score)
        .eq('away_score', away_score);

      if (fetchError) {
        throw fetchError;
      }

      if (existingPredictions && existingPredictions.length > 0) {
        // If there are duplicates, delete all except the first one
        if (existingPredictions.length > 1) {
          const idsToDelete = existingPredictions.slice(1).map(p => p.score_pred_id);
          await supabase
            .from('admin_score_predictions')
            .delete()
            .in('score_pred_id', idsToDelete);
        }

        // Update the first/remaining prediction
        const existingPrediction = existingPredictions[0];
        const { data, error } = await supabase
          .from('admin_score_predictions')
          .update({ 
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
          .from('admin_score_predictions')
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
      message: 'Admin score prediction updated successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Error updating admin score prediction:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update admin score prediction',
      error: error.message
    });
  }
};

// Get comments for a match with pagination and replies
export const getMatchComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    // First get top-level comments (not replies)
    let { data: topLevelComments, error: commentsError } = await supabase
      .from('comments')
      .select(`
        *
      `)
      .eq('match_id', id)
      .is('parent_comment_id', null) // Only top-level comments
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (commentsError) {
      // Handle case where parent_comment_id column doesn't exist
      if (commentsError.message && commentsError.message.includes('parent_comment_id')) {
        // Try without the parent_comment_id filter
        const { data: allComments, error: allCommentsError } = await supabase
          .from('comments')
          .select(`
            *
          `)
          .eq('match_id', id)
          .order('timestamp', { ascending: false })
          .range(offset, offset + limit - 1);
        
        if (allCommentsError) throw allCommentsError;
        
        // Treat all comments as top-level comments
        topLevelComments = allComments || [];
      } else {
        throw commentsError;
      }
    }
    
    // Ensure topLevelComments is always an array
    topLevelComments = topLevelComments || [];

    // Get reply count for each comment
    const commentIds = topLevelComments.map(comment => comment.comment_id);
    let repliesInfo = [];
    if (commentIds.length > 0) {
      try {
        const { data: replyCounts, error: repliesError } = await supabase.rpc('count_replies_for_comments', { comment_ids: commentIds });
        
        if (repliesError) {
          // Handle case where stored procedure doesn't exist
          // We'll count replies manually below
        } else {
          repliesInfo = replyCounts;
        }
      } catch (error) {
        // Handle case where stored procedure doesn't exist
        // We'll count replies manually below
      }
      
      // If we don't have reply counts from the stored procedure, count manually
      if (repliesInfo.length === 0) {
        // Get all comments for this match
        const { data: allComments, error: allCommentsError } = await supabase
          .from('comments')
          .select('comment_id, parent_comment_id')
          .eq('match_id', id);
        
        if (!allCommentsError && allComments) {
          // Count replies for each top-level comment
          repliesInfo = commentIds.map(commentId => {
            const count = allComments.filter(comment => 
              comment.parent_comment_id === commentId
            ).length;
            return {
              parent_comment_id: commentId,
              count: count
            };
          });
        }
      }
    }

    // Get like and dislike counts for each comment and attach user data
    const formattedComments = await Promise.all(topLevelComments.map(async (comment) => {
      const replyInfo = repliesInfo.find((r: any) => r.parent_comment_id === comment.comment_id);
      
      // Get like count using the new function
      let likeCount = 0;
      try {
        const { data: rpcLikeCount, error: likeCountError } = await supabase.rpc('count_likes_for_comment', { 
          comment_id_param: comment.comment_id
        });
        
        if (likeCountError) {
          // Handle case where stored procedure doesn't exist
          likeCount = 0;
        } else {
          likeCount = rpcLikeCount || 0;
        }
      } catch (error) {
        // Handle case where stored procedure doesn't exist
        likeCount = 0;
      }
      
      // Get dislike count using the new function
      let dislikeCount = 0;
      try {
        const { data: rpcDislikeCount, error: dislikeCountError } = await supabase.rpc('count_dislikes_for_comment', { 
          comment_id_param: comment.comment_id
        });
        
        if (dislikeCountError) {
          // Handle case where stored procedure doesn't exist
          dislikeCount = 0;
        } else {
          dislikeCount = rpcDislikeCount || 0;
        }
      } catch (error) {
        // Handle case where stored procedure doesn't exist
        dislikeCount = 0;
      }
      
      // If we don't have like count from the stored procedure, count manually
      if (likeCount === 0) {
        try {
          const { count: manualLikeCount, error: manualCountError } = await supabase
            .from('comment_reactions')
            .select('*', { count: 'exact', head: true })
            .eq('comment_id', comment.comment_id)
            .eq('reaction_type', 'like');
          
          if (!manualCountError && manualLikeCount !== null) {
            likeCount = manualLikeCount;
          }
        } catch (manualError) {
        }
      }
      
      // If we don't have dislike count from the stored procedure, count manually
      if (dislikeCount === 0) {
        try {
          const { count: manualDislikeCount, error: manualCountError } = await supabase
            .from('comment_reactions')
            .select('*', { count: 'exact', head: true })
            .eq('comment_id', comment.comment_id)
            .eq('reaction_type', 'dislike');
          
          if (!manualCountError && manualDislikeCount !== null) {
            dislikeCount = manualDislikeCount;
          }
        } catch (manualError) {
        }
      }
      
      // Fetch user data for the comment
      let userData = null;
      if (comment.user_id) {
        try {
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('name, email, avatar_url')
            .eq('user_id', comment.user_id)
            .single();
          
          if (!userError && user) {
            userData = user;
          }
        } catch (userError) {
        }
      }
      
      const replyCount = replyInfo ? replyInfo.count : 0;
      return {
        ...comment,
        user: userData,
        reply_count: replyCount,
        like_count: likeCount || 0,
        dislike_count: dislikeCount || 0
      };
    }));

    // Get total count for pagination
    let { count: totalCount, error: countError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('match_id', id)
      .is('parent_comment_id', null);

    if (countError) {
      // Handle case where parent_comment_id column doesn't exist
      if (countError.message && countError.message.includes('parent_comment_id')) {
        // Try without the parent_comment_id filter
        const { count: allCount, error: allCountError } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('match_id', id);
        
        if (allCountError) throw allCountError;
        
        // Use the count without the filter
        totalCount = allCount;
      } else {
        throw countError;
      }
    }

    return res.status(200).json({
      success: true,
      data: formattedComments,
      pagination: {
        current_page: page,
        per_page: limit,
        total: totalCount,
        total_pages: totalCount ? Math.ceil(totalCount / limit) : 0
      }
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
    const { user_id, comment_text, parent_comment_id } = req.body;
    

    let data;
    let error;
    
    // Try to insert with parent_comment_id first
    if (parent_comment_id) {
      const result = await supabase
        .from('comments')
        .insert([{
          match_id: parseInt(id),
          user_id,
          comment_text,
          parent_comment_id
        }])
        .select(`
          *
        `)
        .single();
      
      data = result.data;
      error = result.error;
      
      // Handle case where parent_comment_id column doesn't exist
      if (error && error.message && error.message.includes('parent_comment_id')) {
        // Try without parent_comment_id
        const fallbackResult = await supabase
          .from('comments')
          .insert([{
            match_id: parseInt(id),
            user_id,
            comment_text
          }])
          .select(`
            *
          `)
          .single();
        
        data = fallbackResult.data;
        error = fallbackResult.error;
      }
    } else {
      // No parent_comment_id, insert normally
      const result = await supabase
        .from('comments')
        .insert([{
          match_id: parseInt(id),
          user_id,
          comment_text
        }])
        .select(`
          *
        `)
        .single();
      
      data = result.data;
      error = result.error;
    }
    
    if (error) throw error;

    // Fetch user data for the created comment
    let userData = null;
    if (data.user_id) {
      try {
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('name, email, avatar_url')
          .eq('user_id', data.user_id)
          .single();
        
        if (!userError && user) {
          userData = user;
        }
      } catch (userError) {
      }
    }

    // Attach user data to the response
    const commentWithUser = {
      ...data,
      user: userData
    };

    return res.status(201).json({
      success: true,
      message: parent_comment_id ? 'Reply created successfully' : 'Comment created successfully',
      data: commentWithUser
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

// Get replies for a comment with pagination
export const getCommentReplies = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // comment_id
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 2;
    const offset = (page - 1) * limit;
    
    const { data: replies, error } = await supabase
      .from('comments')
      .select(`
        *
      `)
      .eq('parent_comment_id', id)
      .order('timestamp', { ascending: true }) // Oldest first for replies
      .range(offset, offset + limit - 1);

    if (error) {
      // Handle case where parent_comment_id column doesn't exist
      if (error.message && error.message.includes('parent_comment_id')) {
        return res.status(200).json({
          success: true,
          data: [],
          pagination: {
            current_page: page,
            per_page: limit,
            total: 0,
            total_pages: 0
          }
        });
      }
      throw error;
    }

    // Format replies with like and dislike counts and user data
    const formattedReplies = await Promise.all(replies.map(async (reply: any) => {
      // Get like count using the new function
      let likeCount = 0;
      try {
        const { data: rpcLikeCount, error: likeCountError } = await supabase.rpc('count_likes_for_comment', { 
          comment_id_param: reply.comment_id
        });
        
        if (!likeCountError) {
          likeCount = rpcLikeCount || 0;
        }
      } catch (error) {
        // Handle case where stored procedure doesn't exist
        likeCount = 0;
      }
      
      // Get dislike count using the new function
      let dislikeCount = 0;
      try {
        const { data: rpcDislikeCount, error: dislikeCountError } = await supabase.rpc('count_dislikes_for_comment', { 
          comment_id_param: reply.comment_id
        });
        
        if (!dislikeCountError) {
          dislikeCount = rpcDislikeCount || 0;
        }
      } catch (error) {
        // Handle case where stored procedure doesn't exist
        dislikeCount = 0;
      }
      
      // If we don't have like count from the stored procedure, count manually
      if (likeCount === 0) {
        try {
          const { count: manualLikeCount, error: manualCountError } = await supabase
            .from('comment_reactions')
            .select('*', { count: 'exact', head: true })
            .eq('comment_id', reply.comment_id)
            .eq('reaction_type', 'like');
          
          if (!manualCountError && manualLikeCount !== null) {
            likeCount = manualLikeCount;
          }
        } catch (manualError) {
        }
      }
      
      // If we don't have dislike count from the stored procedure, count manually
      if (dislikeCount === 0) {
        try {
          const { count: manualDislikeCount, error: manualCountError } = await supabase
            .from('comment_reactions')
            .select('*', { count: 'exact', head: true })
            .eq('comment_id', reply.comment_id)
            .eq('reaction_type', 'dislike');
          
          if (!manualCountError && manualDislikeCount !== null) {
            dislikeCount = manualDislikeCount;
          }
        } catch (manualError) {
        }
      }
      
      // Fetch user data for the reply
      let userData = null;
      if (reply.user_id) {
        try {
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('name, email, avatar_url')
            .eq('user_id', reply.user_id)
            .single();
          
          if (!userError && user) {
            userData = user;
          }
        } catch (userError) {
        }
      }
      
      return {
        ...reply,
        user: userData,
        like_count: likeCount || 0,
        dislike_count: dislikeCount || 0
      };
    }));

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('parent_comment_id', id);

    if (countError) {
      // Handle case where parent_comment_id column doesn't exist
      if (countError.message && countError.message.includes('parent_comment_id')) {
        return res.status(200).json({
          success: true,
          data: formattedReplies,
          pagination: {
            current_page: page,
            per_page: limit,
            total: 0,
            total_pages: 0
          }
        });
      }
      throw countError;
    }

    return res.status(200).json({
      success: true,
      data: formattedReplies,
      pagination: {
        current_page: page,
        per_page: limit,
        total: totalCount || 0,
        total_pages: totalCount ? Math.ceil(totalCount / limit) : 0
      }
    });
  } catch (error: any) {
    console.error('Error fetching comment replies:', error);
    
    // Handle case where parent_comment_id column doesn't exist
    if (error.message && error.message.includes('parent_comment_id')) {
      const { id } = req.params; // comment_id
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 2;
      
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          current_page: page,
          per_page: limit,
          total: 0,
          total_pages: 0
        }
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch comment replies',
      error: error.message
    });
  }
};

// Add reaction to a comment
export const addCommentReaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // comment_id
    const { user_id, reaction_type } = req.body;

    // Check if reaction already exists
    const { data: existingReaction, error: fetchError } = await supabase
      .from('comment_reactions')
      .select('*')
      .eq('comment_id', id)
      .eq('user_id', user_id)
      .eq('reaction_type', reaction_type || 'like')
      .maybeSingle();

    // Handle case where comment_reactions table doesn't exist
    if (fetchError) {
      // If table doesn't exist, return a graceful response
      if (fetchError.message && fetchError.message.includes('comment_reactions')) {
        return res.status(200).json({
          success: true,
          message: 'Reaction feature not available',
          data: {
            action: 'added',
            reaction_count: 0
          }
        });
      }
      // For other errors, throw the error
      throw fetchError;
    }

    let result;
    if (existingReaction) {
      // Remove existing reaction (toggle off)
      const { error: deleteError } = await supabase
        .from('comment_reactions')
        .delete()
        .eq('reaction_id', existingReaction.reaction_id);

      if (deleteError) throw deleteError;
      
      result = { action: 'removed' };
    } else {
      // Add new reaction
      const { data, error: insertError } = await supabase
        .from('comment_reactions')
        .insert([{
          comment_id: parseInt(id),
          user_id,
          reaction_type: reaction_type || 'like'
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      
      result = { action: 'added', data };
    }

    // Get updated reaction count
    const { count: reactionCount, error: countError } = await supabase
      .from('comment_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('comment_id', id)
      .eq('reaction_type', reaction_type || 'like');

    // Handle case where comment_reactions table doesn't exist for count query
    if (countError) {
      // If table doesn't exist, return a graceful response
      if (countError.message && countError.message.includes('comment_reactions')) {
        return res.status(200).json({
          success: true,
          message: 'Reaction feature not available',
          data: {
            ...result,
            reaction_count: 0
          }
        });
      }
      // For other errors, throw the error
      throw countError;
    }

    return res.status(200).json({
      success: true,
      message: existingReaction ? 'Reaction removed successfully' : 'Reaction added successfully',
      data: {
        ...result,
        reaction_count: reactionCount || 0
      }
    });
  } catch (error: any) {
    console.error('Error adding comment reaction:', error);
    
    // Handle case where comment_reactions table doesn't exist
    if (error.message && error.message.includes('comment_reactions')) {
      return res.status(200).json({
        success: true,
        message: 'Reaction feature not available',
        data: {
          action: 'added',
          reaction_count: 0
        }
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to add reaction',
      error: error.message
    });
  }
};

// Delete a comment (and its replies)
export const deleteMatchComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // comment_id

    // Delete the comment (and cascade to replies due to foreign key constraint)
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('comment_id', id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting match comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: error.message
    });
  }
};