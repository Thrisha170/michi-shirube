import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type TestSection = 'kanji' | 'vocabulary' | 'grammar' | 'listening' | 'reading';

export type ListeningAudioType = 'dialogue' | 'monologue' | 'exam-style';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'exam';

export interface ListeningTestDetails {
  audioType: ListeningAudioType;
  timeTakenMinutes?: number;
  difficultyLevel: DifficultyLevel;
}

export interface KanjiTestDetails {
  wrongKanjiList?: string[];
}

export interface VocabularyTestDetails {
  weakWordsList?: string[];
}

export interface GrammarTestDetails {
  confusingPatterns?: string[];
}

export interface ReadingTestDetails {
  passageCount: number;
  timeTakenMinutes?: number;
}

export type TestDetails = 
  | ListeningTestDetails 
  | KanjiTestDetails 
  | VocabularyTestDetails 
  | GrammarTestDetails 
  | ReadingTestDetails;

export interface TestScore {
  id: string;
  user_id: string;
  date: string;
  section: TestSection;
  correct: number;
  total: number;
  score: number;
  time_taken_minutes?: number | null;
  difficulty_level?: string | null;
  notes?: string | null;
  details?: TestDetails | null;
  created_at: string;
}

export interface LogTestParams {
  section: TestSection;
  correct: number;
  total: number;
  timeTakenMinutes?: number;
  difficultyLevel?: DifficultyLevel;
  notes?: string;
  details?: TestDetails;
}

export const useTestScores = () => {
  const { user } = useAuth();
  const [testScores, setTestScores] = useState<TestScore[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTestScores = useCallback(async () => {
    if (!user) {
      setTestScores([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('test_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(score => ({
        ...score,
        section: score.section as TestSection,
        details: score.details as TestDetails | null,
      }));
      
      setTestScores(transformedData);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTestScores();
  }, [fetchTestScores]);

  const logTest = async (params: LogTestParams): Promise<boolean> => {
    if (!user) {
      toast.error('Please sign in to log test scores');
      return false;
    }

    const { section, correct, total, timeTakenMinutes, difficultyLevel, notes, details } = params;
    const today = new Date().toISOString().split('T')[0];
    const scorePercentage = Math.round((correct / total) * 100);

    try {
      const insertData = {
        user_id: user.id,
        date: today,
        section,
        correct,
        total,
        score: scorePercentage,
        time_taken_minutes: timeTakenMinutes || null,
        difficulty_level: difficultyLevel || null,
        notes: notes || null,
        details: details ? JSON.parse(JSON.stringify(details)) : null,
      };

      const { error } = await supabase
        .from('test_scores')
        .insert(insertData);

      if (error) throw error;

      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} test logged!`, {
        description: `Score: ${scorePercentage}% (${correct}/${total})`,
      });

      await fetchTestScores();
      return true;
    } catch (error) {
      // Error handled via toast
      toast.error('Failed to log test score');
      return false;
    }
  };

  const logListeningTest = async (params: {
    correct: number;
    total: number;
    audioType: ListeningAudioType;
    timeTakenMinutes?: number;
    difficultyLevel: DifficultyLevel;
    notes?: string;
  }): Promise<boolean> => {
    const details: ListeningTestDetails = {
      audioType: params.audioType,
      timeTakenMinutes: params.timeTakenMinutes,
      difficultyLevel: params.difficultyLevel,
    };

    return logTest({
      section: 'listening',
      correct: params.correct,
      total: params.total,
      timeTakenMinutes: params.timeTakenMinutes,
      difficultyLevel: params.difficultyLevel,
      notes: params.notes,
      details,
    });
  };

  const logKanjiTest = async (params: {
    correct: number;
    total: number;
    wrongKanjiList?: string[];
    notes?: string;
  }): Promise<boolean> => {
    const details: KanjiTestDetails = {
      wrongKanjiList: params.wrongKanjiList,
    };

    return logTest({
      section: 'kanji',
      correct: params.correct,
      total: params.total,
      notes: params.notes,
      details,
    });
  };

  const logVocabularyTest = async (params: {
    correct: number;
    total: number;
    weakWordsList?: string[];
    notes?: string;
  }): Promise<boolean> => {
    const details: VocabularyTestDetails = {
      weakWordsList: params.weakWordsList,
    };

    return logTest({
      section: 'vocabulary',
      correct: params.correct,
      total: params.total,
      notes: params.notes,
      details,
    });
  };

  const logGrammarTest = async (params: {
    correct: number;
    total: number;
    confusingPatterns?: string[];
    notes?: string;
  }): Promise<boolean> => {
    const details: GrammarTestDetails = {
      confusingPatterns: params.confusingPatterns,
    };

    return logTest({
      section: 'grammar',
      correct: params.correct,
      total: params.total,
      notes: params.notes,
      details,
    });
  };

  const logReadingTest = async (params: {
    correct: number;
    total: number;
    passageCount: number;
    timeTakenMinutes?: number;
    notes?: string;
  }): Promise<boolean> => {
    const details: ReadingTestDetails = {
      passageCount: params.passageCount,
      timeTakenMinutes: params.timeTakenMinutes,
    };

    return logTest({
      section: 'reading',
      correct: params.correct,
      total: params.total,
      timeTakenMinutes: params.timeTakenMinutes,
      notes: params.notes,
      details,
    });
  };

  const getScoresBySection = useCallback((section: TestSection) => {
    return testScores.filter(score => score.section === section);
  }, [testScores]);

  const getRecentScores = useCallback((limit: number = 10) => {
    return testScores.slice(0, limit);
  }, [testScores]);

  const deleteTestScore = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('test_scores')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Test score deleted');
      await fetchTestScores();
      return true;
    } catch (error) {
      // Error handled via toast
      toast.error('Failed to delete test score');
      return false;
    }
  };

  return {
    testScores,
    loading,
    logTest,
    logListeningTest,
    logKanjiTest,
    logVocabularyTest,
    logGrammarTest,
    logReadingTest,
    getScoresBySection,
    getRecentScores,
    deleteTestScore,
    fetchTestScores,
  };
};
