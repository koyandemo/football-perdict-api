-- Add columns and tables for comment replies and reactions

-- Add parent_comment_id to comments table for replies
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS parent_comment_id INTEGER REFERENCES public.comments(comment_id) ON DELETE CASCADE;

-- Add foreign key constraint for user_id in comments table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'comments_user_id_fkey' 
    AND table_name = 'comments'
  ) THEN
    ALTER TABLE public.comments 
    ADD CONSTRAINT comments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create comment_reactions table for likes and other reactions
CREATE TABLE IF NOT EXISTS public.comment_reactions (
  reaction_id SERIAL PRIMARY KEY,
  comment_id INTEGER REFERENCES public.comments(comment_id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(50) DEFAULT 'like', -- 'like', 'dislike', etc.
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, user_id, reaction_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_match ON public.comments(match_id);
CREATE INDEX IF NOT EXISTS idx_reactions_comment ON public.comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON public.comment_reactions(user_id);

-- Update RLS policies for the new columns and tables
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