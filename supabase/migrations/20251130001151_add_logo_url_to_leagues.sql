-- Add logo_url column to leagues table
ALTER TABLE public.leagues ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);

-- Add a comment for documentation
COMMENT ON COLUMN public.leagues.logo_url IS 'URL for the league logo image';