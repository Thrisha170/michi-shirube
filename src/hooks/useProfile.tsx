import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Profile {
  id: string;
  jlpt_level: string | null;
  exam_date: string | null;
  daily_target_minutes: number;
  daily_target_kanji: number;
  daily_target_vocabulary: number;
  daily_target_grammar: number;
  daily_target_listening_minutes: number;
  daily_target_reading_passages: number;
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  avatar_url: string | null;
  notification_daily_reminder: boolean;
  notification_streak_reminder: boolean;
  notification_exam_reminder: boolean;
}

export interface Badge {
  id: string;
  badge_type: string;
  badge_name: string;
  description: string | null;
  earned_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchBadges = useCallback(async () => {
    if (!user) {
      setBadges([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      // Error handled silently
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
    fetchBadges();
  }, [fetchProfile, fetchBadges]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      return { error: null };
    } catch (error) {
      // Error handled via return value
      return { error };
    }
  };

  const checkAndAwardBadges = async (
    currentStreak: number,
    totals: { kanji: number; vocabulary: number; grammar: number; listeningMinutes: number; readingPassages: number }
  ) => {
    if (!user) return;

    const allMilestones = [
      // Streak milestones
      { threshold: 7, type: 'streak_7', name: '一週間の道 (Week Warrior)', description: '7 consecutive days of study', category: 'streak', value: currentStreak },
      { threshold: 14, type: 'streak_14', name: '二週間の旅 (Fortnight Journey)', description: '14 consecutive days of study', category: 'streak', value: currentStreak },
      { threshold: 30, type: 'streak_30', name: '月の道 (Moon Path)', description: '30 consecutive days of study', category: 'streak', value: currentStreak },
      { threshold: 60, type: 'streak_60', name: '二月の光 (Two Moon Light)', description: '60 consecutive days of study', category: 'streak', value: currentStreak },
      { threshold: 100, type: 'streak_100', name: '百日の桜 (Hundred Day Sakura)', description: '100 consecutive days of study', category: 'streak', value: currentStreak },
      
      // Kanji milestones
      { threshold: 50, type: 'kanji_50', name: '漢字の芽 (Kanji Seedling)', description: 'Learned 50 kanji', category: 'kanji', value: totals.kanji },
      { threshold: 100, type: 'kanji_100', name: '漢字の木 (Kanji Tree)', description: 'Learned 100 kanji', category: 'kanji', value: totals.kanji },
      { threshold: 250, type: 'kanji_250', name: '漢字の森 (Kanji Forest)', description: 'Learned 250 kanji', category: 'kanji', value: totals.kanji },
      { threshold: 500, type: 'kanji_500', name: '漢字の山 (Kanji Mountain)', description: 'Learned 500 kanji', category: 'kanji', value: totals.kanji },
      { threshold: 1000, type: 'kanji_1000', name: '漢字の達人 (Kanji Master)', description: 'Learned 1000 kanji', category: 'kanji', value: totals.kanji },
      
      // Vocabulary milestones
      { threshold: 100, type: 'vocab_100', name: '言葉の種 (Word Seed)', description: 'Learned 100 vocabulary words', category: 'vocabulary', value: totals.vocabulary },
      { threshold: 500, type: 'vocab_500', name: '言葉の花 (Word Bloom)', description: 'Learned 500 vocabulary words', category: 'vocabulary', value: totals.vocabulary },
      { threshold: 1000, type: 'vocab_1000', name: '言葉の庭 (Word Garden)', description: 'Learned 1000 vocabulary words', category: 'vocabulary', value: totals.vocabulary },
      { threshold: 2500, type: 'vocab_2500', name: '言葉の海 (Word Ocean)', description: 'Learned 2500 vocabulary words', category: 'vocabulary', value: totals.vocabulary },
      { threshold: 5000, type: 'vocab_5000', name: '言葉の宇宙 (Word Universe)', description: 'Learned 5000 vocabulary words', category: 'vocabulary', value: totals.vocabulary },
      
      // Grammar milestones
      { threshold: 25, type: 'grammar_25', name: '文法の基礎 (Grammar Foundation)', description: 'Mastered 25 grammar points', category: 'grammar', value: totals.grammar },
      { threshold: 50, type: 'grammar_50', name: '文法の柱 (Grammar Pillar)', description: 'Mastered 50 grammar points', category: 'grammar', value: totals.grammar },
      { threshold: 100, type: 'grammar_100', name: '文法の城 (Grammar Castle)', description: 'Mastered 100 grammar points', category: 'grammar', value: totals.grammar },
      { threshold: 200, type: 'grammar_200', name: '文法の王国 (Grammar Kingdom)', description: 'Mastered 200 grammar points', category: 'grammar', value: totals.grammar },
      
      // Listening milestones (in minutes)
      { threshold: 60, type: 'listening_60', name: '耳の目覚め (Awakened Ear)', description: '1 hour of listening practice', category: 'listening', value: totals.listeningMinutes },
      { threshold: 300, type: 'listening_300', name: '耳の成長 (Growing Ear)', description: '5 hours of listening practice', category: 'listening', value: totals.listeningMinutes },
      { threshold: 600, type: 'listening_600', name: '耳の力 (Powerful Ear)', description: '10 hours of listening practice', category: 'listening', value: totals.listeningMinutes },
      { threshold: 1500, type: 'listening_1500', name: '耳の達人 (Listening Master)', description: '25 hours of listening practice', category: 'listening', value: totals.listeningMinutes },
      
      // Reading milestones
      { threshold: 10, type: 'reading_10', name: '読書の始まり (Reading Start)', description: 'Read 10 passages', category: 'reading', value: totals.readingPassages },
      { threshold: 50, type: 'reading_50', name: '読書の道 (Reading Path)', description: 'Read 50 passages', category: 'reading', value: totals.readingPassages },
      { threshold: 100, type: 'reading_100', name: '読書の旅 (Reading Journey)', description: 'Read 100 passages', category: 'reading', value: totals.readingPassages },
      { threshold: 250, type: 'reading_250', name: '読書の冒険 (Reading Adventure)', description: 'Read 250 passages', category: 'reading', value: totals.readingPassages },
    ];

    for (const milestone of allMilestones) {
      if (milestone.value >= milestone.threshold) {
        const existingBadge = badges.find((b) => b.badge_type === milestone.type);
        if (!existingBadge) {
          try {
            const { error } = await supabase.from('badges').insert({
              user_id: user.id,
              badge_type: milestone.type,
              badge_name: milestone.name,
              description: milestone.description,
            });

            if (!error) {
              toast.success(`🎖️ Badge earned: ${milestone.name}`, {
                description: milestone.description,
              });
              fetchBadges();
            }
          } catch (err) {
            // Badge award error handled silently
          }
        }
      }
    }
  };

  return {
    profile,
    badges,
    loading,
    updateProfile,
    fetchProfile,
    fetchBadges,
    checkAndAwardBadges,
  };
};
