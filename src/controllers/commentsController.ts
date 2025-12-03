import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get all comments with optional filtering
export const getAllComments = async (req: Request, res: Response) => {
  try {
    let query = supabase
      .from('comments')
      .select(`
        *,
        match:matches!comments_match_id_fkey(
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

    const { data, error } = await query.order('timestamp', { ascending: false });

    if (error) {
      throw error;
    }

    // Fetch user data for each comment
    const commentsWithUsers = await Promise.all(data.map(async (comment: any) => {
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
      
      return {
        ...comment,
        user: userData
      };
    }));

    return res.status(200).json({
      success: true,
      data: commentsWithUsers
    });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: error.message
    });
  }
};

// Get a specific comment by ID
export const getCommentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        match:matches!comments_match_id_fkey(
          *,
          home_team:teams!matches_home_team_id_fkey(name, short_code),
          away_team:teams!matches_away_team_id_fkey(name, short_code)
        )
      `)
      .eq('comment_id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Fetch user data for the comment
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

    return res.status(200).json({
      success: true,
      data: commentWithUser
    });
  } catch (error: any) {
    console.error('Error fetching comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch comment',
      error: error.message
    });
  }
};

// Create a new comment
export const createComment = async (req: Request, res: Response) => {
  try {
    const { user_id, match_id, comment_text } = req.body;

    const { data, error } = await supabase
      .from('comments')
      .insert([{
        user_id,
        match_id,
        comment_text
      }])
      .select(`
        *
      `)
      .single();

    if (error) {
      throw error;
    }

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
      message: 'Comment created successfully',
      data: commentWithUser
    });
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create comment',
      error: error.message
    });
  }
};

// Update a comment
export const updateComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { comment_text } = req.body;

    // First get the existing comment to verify ownership
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('comment_id', id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // In a production app, you would verify that the user owns the comment
    // For now, we'll allow the update since we're using service role

    const { data, error } = await supabase
      .from('comments')
      .update({ comment_text })
      .eq('comment_id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data
    });
  } catch (error: any) {
    console.error('Error updating comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update comment',
      error: error.message
    });
  }
};

// Delete a comment
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // First get the existing comment to verify ownership
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('comment_id', id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // In a production app, you would verify that the user owns the comment
    // For now, we'll allow the deletion since we're using service role

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('comment_id', id);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: error.message
    });
  }
};