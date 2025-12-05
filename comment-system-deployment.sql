-- Complete Comment System Schema for Social Media Style Comments
-- This script should be run directly in the Supabase SQL Editor

-- 1. Add parent_comment_id to comments table for threaded replies
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS parent_comment_id INTEGER REFERENCES public.comments(comment_id) ON DELETE CASCADE;

-- 2. Add user_id foreign key constraint to comments table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'comments_user_id_fkey' 
    AND table_name = 'comments'
  ) THEN
    ALTER TABLE public.comments 
    ADD CONSTRAINT comments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Create comment_reactions table for likes and other reactions
CREATE TABLE IF NOT EXISTS public.comment_reactions (
  reaction_id SERIAL PRIMARY KEY,
  comment_id INTEGER REFERENCES public.comments(comment_id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES public.users(user_id) ON DELETE CASCADE,
  reaction_type VARCHAR(50) DEFAULT 'like', -- 'like', 'dislike', etc.
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, user_id, reaction_type)
);

-- 4. Create function to count replies for a comment
CREATE OR REPLACE FUNCTION public.count_replies_for_comment(comment_id_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
  reply_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO reply_count
  FROM public.comments
  WHERE parent_comment_id = comment_id_param;
  
  RETURN COALESCE(reply_count, 0);
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to count replies for multiple comments
CREATE OR REPLACE FUNCTION public.count_replies_for_comments(comment_ids INTEGER[])
RETURNS TABLE(parent_comment_id INTEGER, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT c.parent_comment_id, COUNT(*) as count
  FROM public.comments c
  WHERE c.parent_comment_id = ANY(comment_ids)
  GROUP BY c.parent_comment_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to count reactions for a comment
CREATE OR REPLACE FUNCTION public.count_reactions_for_comment(comment_id_param INTEGER, reaction_type_param VARCHAR DEFAULT 'like')
RETURNS INTEGER AS $$
DECLARE
  reaction_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO reaction_count
  FROM public.comment_reactions
  WHERE comment_id = comment_id_param 
  AND reaction_type = reaction_type_param;
  
  RETURN COALESCE(reaction_count, 0);
END;
$$ LANGUAGE plpgsql;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_match ON public.comments(match_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_comment ON public.comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON public.comment_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_type ON public.comment_reactions(reaction_type);

-- 8. Update RLS policies for the new columns and tables
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- Comment reactions policies
CREATE POLICY "Anyone can view comment reactions" ON public.comment_reactions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert comment reactions" ON public.comment_reactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update comment reactions" ON public.comment_reactions
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete comment reactions" ON public.comment_reactions
  FOR DELETE USING (true);

-- Update comments policies to include parent_comment_id
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
CREATE POLICY "Anyone can view comments" ON public.comments
  FOR SELECT USING (true);

-- 9. Verification
SELECT 'Comment system schema updated successfully!' as message;