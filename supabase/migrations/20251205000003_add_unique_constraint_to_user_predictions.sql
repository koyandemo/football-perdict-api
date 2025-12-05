-- Add unique constraint to prevent duplicate votes from the same user for the same match
-- This constraint ensures that each user can only have one prediction per match

-- First, remove any existing duplicate predictions (keep the most recent one)
DELETE FROM public.user_predictions
WHERE prediction_id NOT IN (
  SELECT MAX(prediction_id)
  FROM public.user_predictions
  GROUP BY user_id, match_id, user_type
);

-- Add the unique constraint
ALTER TABLE public.user_predictions
ADD CONSTRAINT unique_user_match_prediction UNIQUE (user_id, match_id, user_type);