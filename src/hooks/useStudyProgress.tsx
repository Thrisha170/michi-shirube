import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { toast } from 'sonner';

export type Section = 'kanji' | 'vocabulary' | 'grammar' | 'listening' | 'reading';

export interface StudyProgress {
  id: string;
  user_id: string;
  date: string;
  kanji: number;
  vocabulary: number;
  grammar: number;
  listening_minutes: number;
  reading_passages: number;
  total_minutes: number;
}

export interface LastAction {
  type: 'log';
  section: Section;
  amount: number;
  previousProgress: StudyProgress | null;
  timestamp: number;
}

export const useStudyProgress = () => {
  const { user } = useAuth();
  const { fetchProfile, checkAndAwardBadges, profile } = useProfile();
  const [studyProgress, setStudyProgress] = useState<StudyProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastAction, setLastAction] = useState<LastAction | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setStudyProgress([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('study_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(60);

      if (error) throw error;
      setStudyProgress(data || []);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const getTodayProgress = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return studyProgress.find((p) => p.date === today);
  }, [studyProgress]);

  const logStudy = async (section: Section, amount: number) => {
    if (!user) {
      toast.error('Please sign in to log study progress');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const existingProgress = studyProgress.find((p) => p.date === today);

    // Store previous state for undo
    const previousProgress = existingProgress ? { ...existingProgress } : null;

    // Calculate time contribution
    const timeContribution = section === 'listening' ? amount :
                            section === 'kanji' ? amount * 2 :
                            section === 'vocabulary' ? Math.ceil(amount * 0.5) :
                            section === 'grammar' ? amount * 5 :
                            amount * 10;

    try {
      if (existingProgress) {
        // Update existing entry
        const updates: Partial<StudyProgress> = {
          total_minutes: existingProgress.total_minutes + timeContribution,
        };

        switch (section) {
          case 'kanji':
            updates.kanji = existingProgress.kanji + amount;
            break;
          case 'vocabulary':
            updates.vocabulary = existingProgress.vocabulary + amount;
            break;
          case 'grammar':
            updates.grammar = existingProgress.grammar + amount;
            break;
          case 'listening':
            updates.listening_minutes = existingProgress.listening_minutes + amount;
            break;
          case 'reading':
            updates.reading_passages = existingProgress.reading_passages + amount;
            break;
        }

        const { error } = await supabase
          .from('study_progress')
          .update(updates)
          .eq('id', existingProgress.id);

        if (error) throw error;
      } else {
        // Create new entry for today
        const newProgress = {
          user_id: user.id,
          date: today,
          kanji: section === 'kanji' ? amount : 0,
          vocabulary: section === 'vocabulary' ? amount : 0,
          grammar: section === 'grammar' ? amount : 0,
          listening_minutes: section === 'listening' ? amount : 0,
          reading_passages: section === 'reading' ? amount : 0,
          total_minutes: timeContribution,
        };

        const { error } = await supabase
          .from('study_progress')
          .insert(newProgress);

        if (error) throw error;
      }

      // Store last action for undo
      setLastAction({
        type: 'log',
        section,
        amount,
        previousProgress,
        timestamp: Date.now(),
      });

      // Refresh data
      await fetchProgress();
      await fetchProfile();

      // Calculate cumulative totals for badge checking
      const updatedProgress = await supabase
        .from('study_progress')
        .select('kanji, vocabulary, grammar, listening_minutes, reading_passages')
        .eq('user_id', user.id);
      
      if (updatedProgress.data) {
        const totals = updatedProgress.data.reduce(
          (acc, p) => ({
            kanji: acc.kanji + (p.kanji || 0),
            vocabulary: acc.vocabulary + (p.vocabulary || 0),
            grammar: acc.grammar + (p.grammar || 0),
            listeningMinutes: acc.listeningMinutes + (p.listening_minutes || 0),
            readingPassages: acc.readingPassages + (p.reading_passages || 0),
          }),
          { kanji: 0, vocabulary: 0, grammar: 0, listeningMinutes: 0, readingPassages: 0 }
        );

        // Check for new badges with updated streak
        if (profile) {
          checkAndAwardBadges(profile.current_streak || 0, totals);
        }
      }

    } catch (error) {
      // Error handled via toast
      toast.error('Failed to log study progress');
    }
  };

  const undoLastAction = async () => {
    if (!lastAction || !user) return false;

    // Check if undo is within 5 minutes
    if (Date.now() - lastAction.timestamp > 5 * 60 * 1000) return false;

    const today = new Date().toISOString().split('T')[0];
    const todayProgress = studyProgress.find((p) => p.date === today);

    if (!todayProgress) return false;

    try {
      if (lastAction.previousProgress) {
        // Restore previous state
        const { error } = await supabase
          .from('study_progress')
          .update({
            kanji: lastAction.previousProgress.kanji,
            vocabulary: lastAction.previousProgress.vocabulary,
            grammar: lastAction.previousProgress.grammar,
            listening_minutes: lastAction.previousProgress.listening_minutes,
            reading_passages: lastAction.previousProgress.reading_passages,
            total_minutes: lastAction.previousProgress.total_minutes,
          })
          .eq('id', todayProgress.id);

        if (error) throw error;
      } else {
        // Remove today's entry entirely
        const { error } = await supabase
          .from('study_progress')
          .delete()
          .eq('id', todayProgress.id);

        if (error) throw error;
      }

      setLastAction(null);
      await fetchProgress();
      return true;
    } catch (error) {
      // Error handled via return value
      return false;
    }
  };

  return {
    studyProgress,
    loading,
    getTodayProgress,
    logStudy,
    undoLastAction,
    lastAction,
    fetchProgress,
  };
};
