import { Request, Response } from 'express';
import { generateLeagueSlug } from '../../utils/slugGenerator';
import { BaseController } from '../../controllers/BaseController';
import { League } from '../../interfaces';
import { catchAsync } from '../../middleware/errorHandler';
import container from '../../config/container';

// Get instance from container
const baseController = container.baseController;

// Get all leagues
export const getAllLeagues = catchAsync(async (req: Request, res: Response) => {
  return await baseController.getAll<League>(res, container.supabase, 'leagues', 'name');
});

// Get a specific league by ID
export const getLeagueById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  return await baseController.getById<League>(res, container.supabase, 'leagues', id, 'league_id');
});

// Create a new league
export const createLeague = catchAsync(async (req: Request, res: Response) => {
  const { name, country, logo_url } = req.body;
  
  // Generate slug automatically
  const slug = generateLeagueSlug(name, country);

  const leagueData: Partial<League> = {
    name,
    country,
    slug,
    logo_url
  };

  return await baseController.create<League>(res, container.supabase, 'leagues', leagueData);
});

// Update a league
export const updateLeague = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, country, logo_url } = req.body;
  
  // Generate slug automatically if name or country is updated
  const slug = generateLeagueSlug(name, country);

  const leagueData: Partial<League> = {
    name,
    country,
    slug,
    logo_url
  };

  return await baseController.update<League>(res, container.supabase, 'leagues', id, leagueData, 'league_id');
});

// Delete a league
export const deleteLeague = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  return await baseController.delete(res, container.supabase, 'leagues', id, 'league_id');
});