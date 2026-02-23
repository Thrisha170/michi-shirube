-- Create profiles table for user settings
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  jlpt_level TEXT DEFAULT 'N5' CHECK (jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
  exam_date DATE,
  daily_target_minutes INTEGER DEFAULT 60,
  daily_target_kanji INTEGER DEFAULT 5,
  daily_target_vocabulary INTEGER DEFAULT 20,
  daily_target_grammar INTEGER DEFAULT 3,
  daily_target_listening_minutes INTEGER DEFAULT 15,
  daily_target_reading_passages INTEGER DEFAULT 2,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_study_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create study_progress table for daily tracking
CREATE TABLE public.study_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  kanji INTEGER DEFAULT 0,
  vocabulary INTEGER DEFAULT 0,
  grammar INTEGER DEFAULT 0,
  listening_minutes INTEGER DEFAULT 0,
  reading_passages INTEGER DEFAULT 0,
  total_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create test_scores table
CREATE TABLE public.test_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('kanji', 'vocabulary', 'grammar', 'listening', 'reading')),
  correct INTEGER NOT NULL,
  total INTEGER NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Study progress policies
CREATE POLICY "Users can view their own study progress" 
  ON public.study_progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study progress" 
  ON public.study_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study progress" 
  ON public.study_progress FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study progress" 
  ON public.study_progress FOR DELETE 
  USING (auth.uid() = user_id);

-- Test scores policies
CREATE POLICY "Users can view their own test scores" 
  ON public.test_scores FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test scores" 
  ON public.test_scores FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Badges policies
CREATE POLICY "Users can view their own badges" 
  ON public.badges FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own badges" 
  ON public.badges FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_study_progress_updated_at
  BEFORE UPDATE ON public.study_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update streak when study progress is logged
CREATE OR REPLACE FUNCTION public.update_streak_on_study()
RETURNS TRIGGER AS $$
DECLARE
  last_date DATE;
  current_streak_val INTEGER;
  longest_streak_val INTEGER;
BEGIN
  -- Get current streak info
  SELECT last_study_date, current_streak, longest_streak 
  INTO last_date, current_streak_val, longest_streak_val
  FROM public.profiles 
  WHERE id = NEW.user_id;
  
  -- Update streak based on study date
  IF last_date IS NULL OR NEW.date > last_date THEN
    IF last_date IS NULL OR NEW.date = last_date + INTERVAL '1 day' THEN
      -- Consecutive day
      current_streak_val := COALESCE(current_streak_val, 0) + 1;
    ELSIF NEW.date > last_date + INTERVAL '1 day' THEN
      -- Streak broken
      current_streak_val := 1;
    END IF;
    
    -- Update longest streak if needed
    IF current_streak_val > COALESCE(longest_streak_val, 0) THEN
      longest_streak_val := current_streak_val;
    END IF;
    
    -- Update profile
    UPDATE public.profiles 
    SET 
      last_study_date = NEW.date,
      current_streak = current_streak_val,
      longest_streak = longest_streak_val
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update streak on new study progress
CREATE TRIGGER update_streak_on_study_insert
  AFTER INSERT ON public.study_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_streak_on_study();