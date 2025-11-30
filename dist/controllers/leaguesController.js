"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLeague = exports.updateLeague = exports.createLeague = exports.getLeagueById = exports.getAllLeagues = void 0;
const supabase_1 = require("../config/supabase");
const slugGenerator_1 = require("../utils/slugGenerator");
// Get all leagues
const getAllLeagues = async (req, res) => {
    try {
        console.log('Fetching all leagues from database...');
        const { data, error } = await supabase_1.supabase
            .from('leagues')
            .select('*')
            .order('name');
        if (error) {
            console.error('Supabase error when fetching leagues:', error);
            throw error;
        }
        console.log('Successfully fetched leagues:', data?.length || 0);
        return res.status(200).json({
            success: true,
            data
        });
    }
    catch (error) {
        console.error('Error fetching leagues:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch leagues',
            error: error.message
        });
    }
};
exports.getAllLeagues = getAllLeagues;
// Get a specific league by ID
const getLeagueById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Fetching league with ID: ${id}`);
        const { data, error } = await supabase_1.supabase
            .from('leagues')
            .select('*')
            .eq('league_id', id)
            .single();
        if (error) {
            console.error(`Supabase error when fetching league ${id}:`, error);
            throw error;
        }
        if (!data) {
            console.log(`League with ID ${id} not found`);
            return res.status(404).json({
                success: false,
                message: 'League not found'
            });
        }
        console.log(`Successfully fetched league ${id}:`, data);
        return res.status(200).json({
            success: true,
            data
        });
    }
    catch (error) {
        console.error('Error fetching league:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch league',
            error: error.message
        });
    }
};
exports.getLeagueById = getLeagueById;
// Create a new league
const createLeague = async (req, res) => {
    try {
        const { name, country, logo_url } = req.body;
        console.log('Creating new league with data:', { name, country, logo_url });
        // Generate slug automatically
        const slug = (0, slugGenerator_1.generateLeagueSlug)(name, country);
        console.log('Generated slug:', slug);
        const { data, error } = await supabase_1.supabase
            .from('leagues')
            .insert([{ name, country, slug, logo_url }])
            .select()
            .single();
        if (error) {
            console.error('Supabase error when creating league:', error);
            throw error;
        }
        console.log('Successfully created league:', data);
        return res.status(201).json({
            success: true,
            message: 'League created successfully',
            data
        });
    }
    catch (error) {
        console.error('Error creating league:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create league',
            error: error.message
        });
    }
};
exports.createLeague = createLeague;
// Update a league
const updateLeague = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, country, logo_url } = req.body;
        console.log(`Updating league ${id} with data:`, { name, country, logo_url });
        // Generate slug automatically if name or country is updated
        const slug = (0, slugGenerator_1.generateLeagueSlug)(name, country);
        console.log(`Generated slug for league ${id}:`, slug);
        const { data, error } = await supabase_1.supabase
            .from('leagues')
            .update({ name, country, slug, logo_url })
            .eq('league_id', id)
            .select()
            .single();
        if (error) {
            console.error(`Supabase error when updating league ${id}:`, error);
            throw error;
        }
        if (!data) {
            console.log(`League with ID ${id} not found for update`);
            return res.status(404).json({
                success: false,
                message: 'League not found'
            });
        }
        console.log(`Successfully updated league ${id}:`, data);
        return res.status(200).json({
            success: true,
            message: 'League updated successfully',
            data
        });
    }
    catch (error) {
        console.error('Error updating league:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update league',
            error: error.message
        });
    }
};
exports.updateLeague = updateLeague;
// Delete a league
const deleteLeague = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Deleting league with ID: ${id}`);
        const { error } = await supabase_1.supabase
            .from('leagues')
            .delete()
            .eq('league_id', id);
        if (error) {
            console.error(`Supabase error when deleting league ${id}:`, error);
            throw error;
        }
        console.log(`Successfully deleted league ${id}`);
        return res.status(200).json({
            success: true,
            message: 'League deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting league:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete league',
            error: error.message
        });
    }
};
exports.deleteLeague = deleteLeague;
//# sourceMappingURL=leaguesController.js.map