-- Disable RLS on all tables that might be causing issues
ALTER TABLE public.user_predictions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_predictions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';