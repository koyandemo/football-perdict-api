"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTeam = exports.updateTeam = exports.createTeam = exports.getTeamById = exports.getAllTeams = void 0;
const supabase_1 = require("../config/supabase");
// Get all teams
const getAllTeams = async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('teams')
            .select('*')
            .order('name');
        if (error) {
            throw error;
        }
        return res.status(200).json({
            success: true,
            data
        });
    }
    catch (error) {
        console.error('Error fetching teams:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch teams',
            error: error.message
        });
    }
};
exports.getAllTeams = getAllTeams;
// Get a specific team by ID
const getTeamById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase_1.supabase
            .from('teams')
            .select('*')
            .eq('team_id', id)
            .single();
        if (error) {
            throw error;
        }
        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }
        return res.status(200).json({
            success: true,
            data
        });
    }
    catch (error) {
        console.error('Error fetching team:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch team',
            error: error.message
        });
    }
};
exports.getTeamById = getTeamById;
// Create a new team
const createTeam = async (req, res) => {
    try {
        const { name, short_code, logo_url, country } = req.body;
        const { data, error } = await supabase_1.supabase
            .from('teams')
            .insert([{ name, short_code, logo_url, country }])
            .select()
            .single();
        if (error) {
            throw error;
        }
        return res.status(201).json({
            success: true,
            message: 'Team created successfully',
            data
        });
    }
    catch (error) {
        console.error('Error creating team:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create team',
            error: error.message
        });
    }
};
exports.createTeam = createTeam;
// Update a team
const updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, short_code, logo_url, country } = req.body;
        const { data, error } = await supabase_1.supabase
            .from('teams')
            .update({ name, short_code, logo_url, country })
            .eq('team_id', id)
            .select()
            .single();
        if (error) {
            throw error;
        }
        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Team updated successfully',
            data
        });
    }
    catch (error) {
        console.error('Error updating team:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update team',
            error: error.message
        });
    }
};
exports.updateTeam = updateTeam;
// Delete a team
const deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase_1.supabase
            .from('teams')
            .delete()
            .eq('team_id', id);
        if (error) {
            throw error;
        }
        return res.status(200).json({
            success: true,
            message: 'Team deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting team:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete team',
            error: error.message
        });
    }
};
exports.deleteTeam = deleteTeam;
//# sourceMappingURL=teamsController.js.map