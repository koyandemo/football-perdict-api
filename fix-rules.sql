-- RLS policies for user_predictions
CREATE POLICY "Anyone can view predictions" ON public.user_predictions
  FOR SELECT USING (true);
  
CREATE POLICY "Anyone can insert predictions" ON public.user_predictions
  FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Anyone can update predictions" ON public.user_predictions
  FOR UPDATE USING (true);
  
CREATE POLICY "Anyone can delete predictions" ON public.user_predictions
  FOR DELETE USING (true);
  
-- RLS policies for score_predictions
CREATE POLICY "Anyone can view score predictions" ON public.score_predictions
  FOR SELECT USING (true);
  
CREATE POLICY "Anyone can insert score predictions" ON public.score_predictions
  FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Anyone can update score predictions" ON public.score_predictions
  FOR UPDATE USING (true);
  
CREATE POLICY "Anyone can delete score predictions" ON public.score_predictions
  FOR DELETE USING (true);
  
-- RLS policies for comments
CREATE POLICY "Anyone can view comments" ON public.comments
  FOR SELECT USING (true);
  
CREATE POLICY "Anyone can insert comments" ON public.comments
  FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Anyone can update comments" ON public.comments
  FOR UPDATE USING (true);
  
CREATE POLICY "Anyone can delete comments" ON public.comments
  FOR DELETE USING (true);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';