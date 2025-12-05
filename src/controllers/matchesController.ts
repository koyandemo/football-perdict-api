import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { MatchService } from '../services/MatchService';
import { Match } from '../interfaces';
import { catchAsync } from '../middleware/errorHandler';
import container from '../config/container';

// Get instances from container
const baseController = container.baseController;
const matchService = container.matchService;

// Get all matches with optional filtering
export const getAllMatches = catchAsync(async (req: Request, res: Response) => {
  // Type-safe extraction of query parameters
  const filters: { league_id?: string | number; date?: string; status?: string } = {};
  
  if (req.query.league_id) {
    const leagueId = Array.isArray(req.query.league_id) 
      ? req.query.league_id[0] 
      : req.query.league_id;
    filters.league_id = typeof leagueId === 'string' ? leagueId : String(leagueId);
  }
  
  if (req.query.date) {
    const date = Array.isArray(req.query.date) 
      ? req.query.date[0] 
      : req.query.date;
    filters.date = typeof date === 'string' ? date : String(date);
  }
  
  if (req.query.status) {
    const status = Array.isArray(req.query.status) 
      ? req.query.status[0] 
      : req.query.status;
    filters.status = typeof status === 'string' ? status : String(status);
  }

  const { data, error } = await matchService.getAllMatches(filters);

  if (error) {
    return baseController.sendError(res, 'Failed to fetch matches', error);
  }

  return baseController.sendSuccess(res, data);
});

// Get a specific match by ID with related data
export const getMatchById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await matchService.getMatchById(id);

  if (error) {
    return baseController.sendError(res, 'Failed to fetch match', error);
  }

  if (!data) {
    return baseController.sendNotFound(res, 'Match not found');
  }

  return baseController.sendSuccess(res, data);
});

// Create a new match
export const createMatch = catchAsync(async (req: Request, res: Response) => {
  const { league_id, home_team_id, away_team_id, match_date, match_time, venue, status, allow_draw, home_score, away_score, big_match, derby, match_type, published } = req.body;
  
  // Extract match_timezone separately to avoid schema cache issues
  const match_timezone = req.body.match_timezone;

  // Log the incoming request body for debugging
  console.log('Create match request body:', req.body);

  // Combine date and time into a single string
  let combinedDateTime = match_date;
  if (match_date && match_time) {
    combinedDateTime = `${match_date}T${match_time}`;
  }

  const matchData: Partial<Match> = {
    league_id,
    home_team_id,
    away_team_id,
    match_date,
    venue,
    status: status || 'scheduled',
    allow_draw: allow_draw !== undefined ? allow_draw : true,  // Default to true if not provided
    home_score,
    away_score,
    big_match: big_match !== undefined ? big_match : false,
    derby: derby !== undefined ? derby : false,
    match_type: match_type || 'Normal',
    published: published !== undefined ? published : false
  };

  // Only include match_timezone if it's provided (temporary workaround for schema cache issue)
  if (match_timezone !== undefined) {
    (matchData as any).match_timezone = match_timezone;
  } else {
    // Set default value if not provided
    (matchData as any).match_timezone = 'UTC';
  }

  // Log the constructed matchData for debugging
  console.log('Constructed matchData for create:', matchData);

  return await baseController.create<Match>(res, container.supabase, 'matches', matchData);
});

// Update a match
export const updateMatch = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { league_id, home_team_id, away_team_id, match_date, match_time, venue, status, allow_draw, home_score, away_score, big_match, derby, match_type, published } = req.body;
  
  // Extract match_timezone separately to avoid schema cache issues
  const match_timezone = req.body.match_timezone;

  // Log the incoming request body for debugging
  console.log('Update match request body:', req.body);

  // Combine date and time into a single string
  let combinedDateTime = match_date;
  if (match_date && match_time) {
    combinedDateTime = `${match_date}T${match_time}`;
  }

  const matchData: Partial<Match> = {
    league_id,
    home_team_id,
    away_team_id,
    match_date,
    venue,
    status,
    allow_draw,
    home_score,
    away_score,
    big_match,
    derby,
    match_type,
    published
  };

  // Only include match_timezone if it's provided (temporary workaround for schema cache issue)
  if (match_timezone !== undefined) {
    (matchData as any).match_timezone = match_timezone;
  } else {
    // For updates, we don't set a default value as it might override existing values
    // Only set if explicitly provided
  }

  // Log the constructed matchData for debugging
  console.log('Constructed matchData:', matchData);

  // Remove undefined fields from matchData to prevent overwriting with undefined values
  // Note: We preserve falsy values like false and null as they are valid field values
  Object.keys(matchData).forEach(key => {
    if (matchData[key as keyof Partial<Match>] === undefined) {
      console.log(`Removing undefined field: ${key}`);
      delete matchData[key as keyof Partial<Match>];
    }
  });

  // Log the final matchData after field removal
  console.log('Final matchData after field removal:', matchData);

  return await baseController.update<Match>(res, container.supabase, 'matches', id, matchData, 'match_id');
});

// Delete a match
export const deleteMatch = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  return await baseController.delete(res, container.supabase, 'matches', id, 'match_id');
});