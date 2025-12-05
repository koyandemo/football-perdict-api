/**
 * Entity interfaces for the football prediction API
 * Following SOLID principles:
 * - Interface Segregation Principle: Specific interfaces for each entity
 * - Dependency Inversion Principle: Controllers depend on abstractions
 */

// Base entity interface
export interface BaseEntity {
  created_at?: string;
  updated_at?: string;
}

// League entity
export interface League extends BaseEntity {
  league_id?: number;
  name: string;
  country: string;
  slug: string;
  logo_url?: string;
}

// Team entity
export interface Team extends BaseEntity {
  team_id?: number;
  name: string;
  short_code: string;
  logo_url?: string;
  country: string;
  team_type?: 'club' | 'country';
}

// Match entity
export interface Match extends BaseEntity {
  match_id?: number;
  league_id: number;
  home_team_id: number;
  away_team_id: number;
  match_date: string; // Date part of the match datetime
  match_time?: string; // Time part of the match datetime
  venue: string;
  status: 'scheduled' | 'live' | 'finished' | 'postponed';
  home_score?: number;
  away_score?: number;
  allow_draw?: boolean;
  match_timezone?: string; // Timezone identifier (e.g., America/New_York)
  big_match?: boolean;
  derby?: boolean;
  match_type?: 'Normal' | 'Final' | 'Semi-Final' | 'Quarter-Final';
  published?: boolean;
}

// Match Outcome entity
export interface MatchOutcome extends BaseEntity {
  outcome_id?: number;
  match_id: number;
  home_win_prob: number;
  draw_prob: number;
  away_win_prob: number;
}

// Match Vote Count entity
export interface MatchVoteCount extends BaseEntity {
  vote_id?: number;
  match_id: number;
  home_votes: number;
  draw_votes: number;
  away_votes: number;
  total_votes: number;
}

// User Prediction entity
export interface UserPrediction extends BaseEntity {
  prediction_id?: number;
  user_id: number;
  match_id: number;
  predicted_winner: string;
  user_type?: 'user' | 'admin'; // New field to distinguish between user and admin votes
}

// Score Prediction entity
export interface ScorePrediction extends BaseEntity {
  score_pred_id?: number;
  match_id: number;
  home_score: number;
  away_score: number;
  vote_count: number;
  user_type?: 'user' | 'admin'; // New field to distinguish between user and admin votes
}

// User entity
export interface User extends BaseEntity {
  user_id?: number;
  username: string;
  email: string;
  password_hash: string;
  role: 'user' | 'admin' | 'seed';
  is_active: boolean;
  last_login?: string;
}

// Comment entity
export interface Comment extends BaseEntity {
  comment_id?: number;
  match_id: number;
  user_id: number;
  comment_text: string;
  timestamp: string;
}

// Extended entities with relations
export interface MatchWithDetails extends Match {
  leagues?: League;
  home_team?: Team;
  away_team?: Team;
}

export interface ScorePredictionWithDetails extends ScorePrediction {
  match?: MatchWithDetails;
}