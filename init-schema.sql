-- Football Prediction Database Schema
-- Run this SQL directly in your Supabase SQL Editor

-- Create Leagues table
CREATE TABLE IF NOT EXISTS public.leagues (
  league_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500),
  slug VARCHAR UNIQUE
);

-- Create Teams table
CREATE TABLE IF NOT EXISTS public.teams (
  team_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  short_code VARCHAR(10) NOT NULL,
  logo_url VARCHAR(500),
  country VARCHAR(255) NOT NULL,
  slug VARCHAR UNIQUE
);

-- Create Matches table
CREATE TABLE IF NOT EXISTS public.matches (
  match_id SERIAL PRIMARY KEY,
  league_id INTEGER REFERENCES public.leagues(league_id) ON DELETE CASCADE,
  home_team_id INTEGER REFERENCES public.teams(team_id) ON DELETE CASCADE,
  away_team_id INTEGER REFERENCES public.teams(team_id) ON DELETE CASCADE,
  match_date DATE NOT NULL,
  match_time TIME NOT NULL,
  venue VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Upcoming',
  slug VARCHAR UNIQUE,
  allow_draw BOOLEAN DEFAULT true
);

-- Create Match_Outcomes table
CREATE TABLE IF NOT EXISTS public.match_outcomes (
  outcome_id SERIAL PRIMARY KEY,
  match_id INTEGER REFERENCES public.matches(match_id) ON DELETE CASCADE,
  home_win_prob INTEGER CHECK (home_win_prob >= 0 AND home_win_prob <= 100),
  draw_prob INTEGER CHECK (draw_prob >= 0 AND draw_prob <= 100),
  away_win_prob INTEGER CHECK (away_win_prob >= 0 AND away_win_prob <= 100),
  CONSTRAINT unique_match_outcome UNIQUE (match_id)
);

-- Create User Predictions table
CREATE TABLE IF NOT EXISTS public.user_predictions (
  prediction_id SERIAL PRIMARY KEY,
  user_id INTEGER,
  match_id INTEGER REFERENCES public.matches(match_id) ON DELETE CASCADE,
  predicted_winner VARCHAR(50),
  prediction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_type VARCHAR(10) DEFAULT 'user' CHECK (user_type IN ('user', 'admin'))
);

-- Create Score Predictions table
CREATE TABLE IF NOT EXISTS public.score_predictions (
  score_pred_id SERIAL PRIMARY KEY,
  match_id INTEGER REFERENCES public.matches(match_id) ON DELETE CASCADE,
  home_score INTEGER,
  away_score INTEGER,
  vote_count INTEGER DEFAULT 0,
  user_type VARCHAR(10) DEFAULT 'user' CHECK (user_type IN ('user', 'admin'))
);

-- Create Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  comment_id SERIAL PRIMARY KEY,
  match_id INTEGER REFERENCES public.matches(match_id) ON DELETE CASCADE,
  user_id INTEGER,
  comment_text TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security on all tables
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
-- Leagues policies
CREATE POLICY "Anyone can view leagues" ON public.leagues
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert leagues" ON public.leagues
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update leagues" ON public.leagues
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete leagues" ON public.leagues
  FOR DELETE USING (true);

-- Teams policies
CREATE POLICY "Anyone can view teams" ON public.teams
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert teams" ON public.teams
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update teams" ON public.teams
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete teams" ON public.teams
  FOR DELETE USING (true);

-- Matches policies
CREATE POLICY "Anyone can view matches" ON public.matches
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert matches" ON public.matches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update matches" ON public.matches
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete matches" ON public.matches
  FOR DELETE USING (true);

-- Match outcomes policies
CREATE POLICY "Anyone can view match outcomes" ON public.match_outcomes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert match outcomes" ON public.match_outcomes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update match outcomes" ON public.match_outcomes
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete match outcomes" ON public.match_outcomes
  FOR DELETE USING (true);

-- User predictions policies
CREATE POLICY "Anyone can view predictions" ON public.user_predictions
  FOR SELECT USING (true);

-- Score predictions policies
CREATE POLICY "Anyone can view score predictions" ON public.score_predictions
  FOR SELECT USING (true);

-- Comments policies
CREATE POLICY "Anyone can view comments" ON public.comments
  FOR SELECT USING (true);

-- Function to generate slug from text
CREATE OR REPLACE FUNCTION public.slugify(text_input TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(trim(regexp_replace(text_input, '[^a-zA-Z0-9]+', '-', 'g'), '-'));
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- Function to generate league slug
CREATE OR REPLACE FUNCTION public.generate_league_slug()
RETURNS TRIGGER AS $$
BEGIN
  NEW.slug := slugify(NEW.name || '-' || NEW.country);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to generate team slug
CREATE OR REPLACE FUNCTION public.generate_team_slug()
RETURNS TRIGGER AS $$
BEGIN
  NEW.slug := slugify(NEW.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for automatic slug generation
DROP TRIGGER IF EXISTS set_league_slug ON public.leagues;
CREATE TRIGGER set_league_slug
BEFORE INSERT OR UPDATE ON public.leagues
FOR EACH ROW
EXECUTE FUNCTION public.generate_league_slug();

DROP TRIGGER IF EXISTS set_team_slug ON public.teams;
CREATE TRIGGER set_team_slug
BEFORE INSERT OR UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.generate_team_slug();

-- Insert a test league to verify everything works
INSERT INTO public.leagues (name, country, logo_url, slug) 
VALUES ('Premier League', 'England', 'https://example.com/premier-league.png', 'premier-league-england')
ON CONFLICT DO NOTHING;

-- Verify the setup
SELECT 'Database schema initialized successfully!' as message;