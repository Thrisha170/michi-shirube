-- Add section-specific details column to test_scores table
ALTER TABLE public.test_scores 
ADD COLUMN IF NOT EXISTS time_taken_minutes integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS difficulty_level text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS notes text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS details jsonb DEFAULT NULL;

-- Create index for faster queries on section and date
CREATE INDEX IF NOT EXISTS idx_test_scores_section_date ON public.test_scores(section, date DESC);

-- Add RLS policies for UPDATE and DELETE if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'test_scores' AND policyname = 'Users can update their own test scores'
  ) THEN
    CREATE POLICY "Users can update their own test scores" 
    ON public.test_scores 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'test_scores' AND policyname = 'Users can delete their own test scores'
  ) THEN
    CREATE POLICY "Users can delete their own test scores" 
    ON public.test_scores 
    FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;
END $$;