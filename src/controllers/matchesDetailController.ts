import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { updateMatchVoteCountsFromScorePredictions } from './predictionsController';

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
    
    // Extract user_type from authenticated user
    const userType = (req as any).user?.type || 'user';
    console.log('User type from token:', (req as any).user?.type);

    // Validate user_type value
    const validUserTypes = ['user', 'admin'];
    if (!validUserTypes.includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user_type value. Must be one of: user, admin'
      });
    }

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
        .update({ 
          vote_count: existingPrediction.vote_count + 1,
          user_type: userType // Preserve the user_type when updating
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
          vote_count: 1,
          user_type: userType
        }])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Update match vote counts based on score predictions
    try {
      await updateMatchVoteCountsFromScorePredictions(parseInt(id));
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

// Update score prediction with specific values and vote count
export const updateScorePredictionVoteCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { score_pred_id, home_score, away_score, vote_count, user_type = 'user' } = req.body;

    // Validate user_type value
    const validUserTypes = ['user', 'admin'];
    if (!validUserTypes.includes(user_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user_type value. Must be one of: user, admin'
      });
    }

    let result;
    
    // If score_pred_id is provided, update existing prediction
    if (score_pred_id) {
      const { data, error } = await supabase
        .from('score_predictions')
        .update({ 
          home_score: home_score,
          away_score: away_score,
          vote_count: vote_count,
          user_type: user_type
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
            vote_count: vote_count,
            user_type: user_type
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
            vote_count,
            user_type
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