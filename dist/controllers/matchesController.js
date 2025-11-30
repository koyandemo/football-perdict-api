"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMatch = exports.updateMatch = exports.createMatch = exports.getMatchById = exports.getAllMatches = void 0;
const supabase_1 = require("../config/supabase");
// Get all matches with optional filtering
const getAllMatches = async (req, res) => {
    try {
        let query = supabase_1.supabase
            .from('matches')
            .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(name, short_code),
        away_team:teams!matches_away_team_id_fkey(name, short_code),
        league:leagues!matches_league_id_fkey(name)
      `)
            .order('match_date', { ascending: false });
        // Apply filters if provided
        if (req.query.league_id) {
            query = query.eq('league_id', req.query.league_id);
        }
        if (req.query.date) {
            query = query.eq('match_date', req.query.date);
        }
        if (req.query.status) {
            query = query.eq('status', req.query.status);
        }
        const { data, error } = await query;
        if (error) {
            throw error;
        }
        return res.status(200).json({
            success: true,
            data
        });
    }
    catch (error) {
        console.error('Error fetching matches:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch matches',
            error: error.message
        });
    }
};
exports.getAllMatches = getAllMatches;
// Get a specific match by ID with related data
const getMatchById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase_1.supabase
            .from('matches')
            .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(name, short_code, logo_url),
        away_team:teams!matches_away_team_id_fkey(name, short_code, logo_url),
        league:leagues!matches_league_id_fkey(name, country),
        match_outcomes(*)
      `)
            .eq('match_id', id)
            .single();
        if (error) {
            throw error;
        }
        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Match not found'
            });
        }
        return res.status(200).json({
            success: true,
            data
        });
    }
    catch (error) {
        console.error('Error fetching match:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch match',
            error: error.message
        });
    }
};
exports.getMatchById = getMatchById;
// Create a new match
const createMatch = async (req, res) => {
    try {
        const { league_id, home_team_id, away_team_id, match_date, match_time, venue, status } = req.body;
        const { data, error } = await supabase_1.supabase
            .from('matches')
            .insert([{
                league_id,
                home_team_id,
                away_team_id,
                match_date,
                match_time,
                venue,
                status: status || 'Upcoming'
            }])
            .select()
            .single();
        if (error) {
            throw error;
        }
        return res.status(201).json({
            success: true,
            message: 'Match created successfully',
            data
        });
    }
    catch (error) {
        console.error('Error creating match:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create match',
            error: error.message
        });
    }
};
exports.createMatch = createMatch;
// Update a match
const updateMatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { league_id, home_team_id, away_team_id, match_date, match_time, venue, status } = req.body;
        const { data, error } = await supabase_1.supabase
            .from('matches')
            .update({
            league_id,
            home_team_id,
            away_team_id,
            match_date,
            match_time,
            venue,
            status
        })
            .eq('match_id', id)
            .select()
            .single();
        if (error) {
            throw error;
        }
        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Match not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Match updated successfully',
            data
        });
    }
    catch (error) {
        console.error('Error updating match:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update match',
            error: error.message
        });
    }
};
exports.updateMatch = updateMatch;
// Delete a match
const deleteMatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase_1.supabase
            .from('matches')
            .delete()
            .eq('match_id', id);
        if (error) {
            throw error;
        }
        return res.status(200).json({
            success: true,
            message: 'Match deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting match:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete match',
            error: error.message
        });
    }
};
exports.deleteMatch = deleteMatch;
//# sourceMappingURL=matchesController.js.map