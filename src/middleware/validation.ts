import { Request, Response, NextFunction } from 'express';

// Validation middleware for league creation
export const validateLeague = (req: Request, res: Response, next: NextFunction): void | Response => {
  const { name, country } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'League name is required and must be a non-empty string'
    });
  }

  if (!country || typeof country !== 'string' || country.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'League country is required and must be a non-empty string'
    });
  }

  return next();
};

// Validation middleware for team creation
export const validateTeam = (req: Request, res: Response, next: NextFunction): void | Response => {
  const { name, short_code, country } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Team name is required and must be a non-empty string'
    });
  }

  if (!short_code || typeof short_code !== 'string' || short_code.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Team short code is required and must be a non-empty string'
    });
  }

  if (!country || typeof country !== 'string' || country.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Team country is required and must be a non-empty string'
    });
  }

  return next();
};

// Validation middleware for match creation
export const validateMatch = (req: Request, res: Response, next: NextFunction): void | Response => {
  const { league_id, home_team_id, away_team_id, match_date, match_time } = req.body;

  if (!league_id || typeof league_id !== 'number') {
    return res.status(400).json({
      success: false,
      message: 'League ID is required and must be a number'
    });
  }

  if (!home_team_id || typeof home_team_id !== 'number') {
    return res.status(400).json({
      success: false,
      message: 'Home team ID is required and must be a number'
    });
  }

  if (!away_team_id || typeof away_team_id !== 'number') {
    return res.status(400).json({
      success: false,
      message: 'Away team ID is required and must be a number'
    });
  }

  if (!match_date || typeof match_date !== 'string' || isNaN(Date.parse(match_date))) {
    return res.status(400).json({
      success: false,
      message: 'Match date is required and must be a valid date string'
    });
  }

  if (!match_time || typeof match_time !== 'string' || !match_time.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
    return res.status(400).json({
      success: false,
      message: 'Match time is required and must be in HH:MM format'
    });
  }

  return next();
};

// Validation middleware for prediction creation
export const validatePrediction = (req: Request, res: Response, next: NextFunction): void | Response => {
  const { user_id, match_id, predicted_winner } = req.body;

  if (!user_id || typeof user_id !== 'number') {
    return res.status(400).json({
      success: false,
      message: 'User ID is required and must be a number'
    });
  }

  if (!match_id || typeof match_id !== 'number') {
    return res.status(400).json({
      success: false,
      message: 'Match ID is required and must be a number'
    });
  }

  const validWinners = ['Home', 'Away', 'Draw'];
  if (!predicted_winner || typeof predicted_winner !== 'string' || !validWinners.includes(predicted_winner)) {
    return res.status(400).json({
      success: false,
      message: 'Predicted winner is required and must be one of: Home, Away, Draw'
    });
  }

  return next();
};

// Validation middleware for comment creation
export const validateComment = (req: Request, res: Response, next: NextFunction): void | Response => {
  const { user_id, match_id, comment_text } = req.body;

  if (!user_id || typeof user_id !== 'number') {
    return res.status(400).json({
      success: false,
      message: 'User ID is required and must be a number'
    });
  }

  if (!match_id || typeof match_id !== 'number') {
    return res.status(400).json({
      success: false,
      message: 'Match ID is required and must be a number'
    });
  }

  if (!comment_text || typeof comment_text !== 'string' || comment_text.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Comment text is required and must be a non-empty string'
    });
  }

  return next();
};