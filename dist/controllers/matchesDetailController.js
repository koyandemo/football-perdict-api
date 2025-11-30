"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMatchComment = exports.getMatchComments = exports.voteScorePrediction = exports.getScorePredictions = exports.updateMatchOutcomes = exports.getMatchOutcomes = void 0;
const supabase_1 = require("../config/supabase");
// Get match outcomes
const getMatchOutcomes = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase_1.supabase
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
    }
    catch (error) {
        console.error('Error fetching match outcomes:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch match outcomes',
            error: error.message
        });
    }
};
exports.getMatchOutcomes = getMatchOutcomes;
// Update match outcomes
const updateMatchOutcomes = async (req, res) => {
    try {
        const { id } = req.params;
        const { home_win_prob, draw_prob, away_win_prob } = req.body;
        // Check if outcomes already exist for this match
        const { data: existingOutcomes, error: fetchError } = await supabase_1.supabase
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
            const { data, error } = await supabase_1.supabase
                .from('match_outcomes')
                .update({
                home_win_prob,
                draw_prob,
                away_win_prob
            })
                .eq('match_id', id)
                .select()
                .single();
            if (error)
                throw error;
            result = data;
        }
        else {
            // Create new outcomes
            const { data, error } = await supabase_1.supabase
                .from('match_outcomes')
                .insert([{
                    match_id: parseInt(id),
                    home_win_prob,
                    draw_prob,
                    away_win_prob
                }])
                .select()
                .single();
            if (error)
                throw error;
            result = data;
        }
        return res.status(200).json({
            success: true,
            message: 'Match outcomes updated successfully',
            data: result
        });
    }
    catch (error) {
        console.error('Error updating match outcomes:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update match outcomes',
            error: error.message
        });
    }
};
exports.updateMatchOutcomes = updateMatchOutcomes;
// Get score predictions for a match
const getScorePredictions = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase_1.supabase
            .from('score_predictions')
            .select('*')
            .eq('match_id', id)
            .order('vote_count', { ascending: false });
        if (error)
            throw error;
        return res.status(200).json({
            success: true,
            data
        });
    }
    catch (error) {
        console.error('Error fetching score predictions:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch score predictions',
            error: error.message
        });
    }
};
exports.getScorePredictions = getScorePredictions;
// Vote for a score prediction
const voteScorePrediction = async (req, res) => {
    try {
        const { id } = req.params;
        const { home_score, away_score } = req.body;
        // Check if this score prediction already exists
        const { data: existingPrediction, error: fetchError } = await supabase_1.supabase
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
            const { data, error } = await supabase_1.supabase
                .from('score_predictions')
                .update({ vote_count: existingPrediction.vote_count + 1 })
                .eq('score_pred_id', existingPrediction.score_pred_id)
                .select()
                .single();
            if (error)
                throw error;
            result = data;
        }
        else {
            // Create new score prediction
            const { data, error } = await supabase_1.supabase
                .from('score_predictions')
                .insert([{
                    match_id: parseInt(id),
                    home_score,
                    away_score,
                    vote_count: 1
                }])
                .select()
                .single();
            if (error)
                throw error;
            result = data;
        }
        return res.status(200).json({
            success: true,
            message: 'Score prediction voted successfully',
            data: result
        });
    }
    catch (error) {
        console.error('Error voting score prediction:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to vote score prediction',
            error: error.message
        });
    }
};
exports.voteScorePrediction = voteScorePrediction;
// Get comments for a match
const getMatchComments = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase_1.supabase
            .from('comments')
            .select('*')
            .eq('match_id', id)
            .order('timestamp', { ascending: false });
        if (error)
            throw error;
        return res.status(200).json({
            success: true,
            data
        });
    }
    catch (error) {
        console.error('Error fetching match comments:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch match comments',
            error: error.message
        });
    }
};
exports.getMatchComments = getMatchComments;
// Create a comment for a match
const createMatchComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, comment_text } = req.body;
        const { data, error } = await supabase_1.supabase
            .from('comments')
            .insert([{
                match_id: parseInt(id),
                user_id,
                comment_text
            }])
            .select()
            .single();
        if (error)
            throw error;
        return res.status(201).json({
            success: true,
            message: 'Comment created successfully',
            data
        });
    }
    catch (error) {
        console.error('Error creating match comment:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create comment',
            error: error.message
        });
    }
};
exports.createMatchComment = createMatchComment;
//# sourceMappingURL=matchesDetailController.js.map