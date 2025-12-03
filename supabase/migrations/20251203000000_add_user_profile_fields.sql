-- Add avatar_url and favorite_team_id columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS favorite_team_id INTEGER REFERENCES public.teams(team_id) ON DELETE SET NULL;

-- Add index on favorite_team_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_favorite_team ON public.users(favorite_team_id);