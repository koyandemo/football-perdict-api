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
  const { league_id, home_team_id, away_team_id, match_date, match_time, venue, status, allow_draw, home_score, away_score, match_timezone } = req.body;

  // Combine date and time into a single ISO 8601 datetime string
  let combinedDateTime = match_date;
  if (match_time) {
    combinedDateTime = `${match_date}T${match_time}`;
    // If timezone is provided, append it to the datetime
    if (match_timezone) {
      combinedDateTime += ` ${match_timezone}`;
    } else {
      combinedDateTime += ' UTC'; // Default to UTC if no timezone specified
    }
  }

  const matchData: Partial<Match> = {
    league_id,
    home_team_id,
    away_team_id,
    match_date: combinedDateTime,
    venue,
    status: status || 'scheduled',
    allow_draw: allow_draw !== undefined ? allow_draw : true,  // Default to true if not provided
    home_score,
    away_score,
    match_timezone: match_timezone || 'UTC'
  };

  return await baseController.create<Match>(res, container.supabase, 'matches', matchData);
});

// Update a match
export const updateMatch = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { league_id, home_team_id, away_team_id, match_date, match_time, venue, status, allow_draw, home_score, away_score, match_timezone } = req.body;

  // Combine date and time into a single ISO 8601 datetime string if both are provided
  let combinedDateTime = match_date;
  if (match_date && match_time) {
    combinedDateTime = `${match_date}T${match_time}`;
    // If timezone is provided, append it to the datetime
    if (match_timezone) {
      combinedDateTime += ` ${match_timezone}`;
    } else {
      combinedDateTime += ' UTC'; // Default to UTC if no timezone specified
    }
  }

  const matchData: Partial<Match> = {
    league_id,
    home_team_id,
    away_team_id,
    match_date: combinedDateTime,
    venue,
    status,
    allow_draw,
    home_score,
    away_score,
    match_timezone
  };

  // Remove undefined fields from matchData to prevent overwriting with undefined values
  Object.keys(matchData).forEach(key => {
    if (matchData[key as keyof Partial<Match>] === undefined) {
      delete matchData[key as keyof Partial<Match>];
    }
  });

  return await baseController.update<Match>(res, container.supabase, 'matches', id, matchData, 'match_id');
});

// Delete a match
export const deleteMatch = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  return await baseController.delete(res, container.supabase, 'matches', id, 'match_id');
});