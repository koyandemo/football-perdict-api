import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { Team } from '../interfaces';
import { catchAsync } from '../middleware/errorHandler';
import container from '../config/container';

// Get instance from container
const baseController = container.baseController;

// Get all teams
export const getAllTeams = catchAsync(async (req: Request, res: Response) => {
  return await baseController.getAll<Team>(res, container.supabase, 'teams', 'name');
});

// Get a specific team by ID
export const getTeamById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  return await baseController.getById<Team>(res, container.supabase, 'teams', id, 'team_id');
});

// Create a new team
export const createTeam = catchAsync(async (req: Request, res: Response) => {
  const { name, short_code, logo_url, country, team_type } = req.body;

  const teamData: Partial<Team> = {
    name,
    short_code,
    logo_url,
    country,
    team_type
  };

  return await baseController.create<Team>(res, container.supabase, 'teams', teamData);
});

// Update a team
export const updateTeam = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, short_code, logo_url, country, team_type } = req.body;

  const teamData: Partial<Team> = {
    name,
    short_code,
    logo_url,
    country,
    team_type
  };

  return await baseController.update<Team>(res, container.supabase, 'teams', id, teamData, 'team_id');
});

// Delete a team
export const deleteTeam = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  return await baseController.delete(res, container.supabase, 'teams', id, 'team_id');
});