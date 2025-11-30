"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updateComment = exports.createComment = exports.getCommentById = exports.getAllComments = void 0;
const supabase_1 = require("../config/supabase");
// Get all comments with optional filtering
const getAllComments = async (req, res) => {
    try {
        let query = supabase_1.supabase
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
        return res.status(200).json({
            success: true,
            data
        });
    }
    catch (error) {
        console.error('Error fetching comments:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch comments',
            error: error.message
        });
    }
};
exports.getAllComments = getAllComments;
// Get a specific comment by ID
const getCommentById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase_1.supabase
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
        return res.status(200).json({
            success: true,
            data
        });
    }
    catch (error) {
        console.error('Error fetching comment:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch comment',
            error: error.message
        });
    }
};
exports.getCommentById = getCommentById;
// Create a new comment
const createComment = async (req, res) => {
    try {
        const { user_id, match_id, comment_text } = req.body;
        const { data, error } = await supabase_1.supabase
            .from('comments')
            .insert([{
                user_id,
                match_id,
                comment_text
            }])
            .select()
            .single();
        if (error) {
            throw error;
        }
        return res.status(201).json({
            success: true,
            message: 'Comment created successfully',
            data
        });
    }
    catch (error) {
        console.error('Error creating comment:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create comment',
            error: error.message
        });
    }
};
exports.createComment = createComment;
// Update a comment
const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment_text } = req.body;
        const { data, error } = await supabase_1.supabase
            .from('comments')
            .update({ comment_text })
            .eq('comment_id', id)
            .select()
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
        return res.status(200).json({
            success: true,
            message: 'Comment updated successfully',
            data
        });
    }
    catch (error) {
        console.error('Error updating comment:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update comment',
            error: error.message
        });
    }
};
exports.updateComment = updateComment;
// Delete a comment
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase_1.supabase
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
    }
    catch (error) {
        console.error('Error deleting comment:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete comment',
            error: error.message
        });
    }
};
exports.deleteComment = deleteComment;
//# sourceMappingURL=commentsController.js.map