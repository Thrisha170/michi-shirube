import { motion } from 'framer-motion';
import { Flame, Trophy, Award, Star, Sparkles, BookOpen, Languages, Headphones, FileText, Pen } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

const badgeIcons: Record<string, React.ReactNode> = {
  // Streak badges
  streak_7: <Star className="w-5 h-5" />,
  streak_14: <Award className="w-5 h-5" />,
  streak_30: <Trophy className="w-5 h-5" />,
  streak_60: <Sparkles className="w-5 h-5" />,
  streak_100: <Flame className="w-5 h-5" />,
  // Kanji badges
  kanji_50: <Pen className="w-5 h-5" />,
  kanji_100: <Pen className="w-5 h-5" />,
  kanji_250: <Pen className="w-5 h-5" />,
  kanji_500: <Pen className="w-5 h-5" />,
  kanji_1000: <Pen className="w-5 h-5" />,
  // Vocabulary badges
  vocab_100: <Languages className="w-5 h-5" />,
  vocab_500: <Languages className="w-5 h-5" />,
  vocab_1000: <Languages className="w-5 h-5" />,
  vocab_2500: <Languages className="w-5 h-5" />,
  vocab_5000: <Languages className="w-5 h-5" />,
  // Grammar badges
  grammar_25: <BookOpen className="w-5 h-5" />,
  grammar_50: <BookOpen className="w-5 h-5" />,
  grammar_100: <BookOpen className="w-5 h-5" />,
  grammar_200: <BookOpen className="w-5 h-5" />,
  // Listening badges
  listening_60: <Headphones className="w-5 h-5" />,
  listening_300: <Headphones className="w-5 h-5" />,
  listening_600: <Headphones className="w-5 h-5" />,
  listening_1500: <Headphones className="w-5 h-5" />,
  // Reading badges
  reading_10: <FileText className="w-5 h-5" />,
  reading_50: <FileText className="w-5 h-5" />,
  reading_100: <FileText className="w-5 h-5" />,
  reading_250: <FileText className="w-5 h-5" />,
};

const badgeColors: Record<string, string> = {
  // Streak badges
  streak_7: 'from-amber-400 to-orange-500',
  streak_14: 'from-emerald-400 to-teal-500',
  streak_30: 'from-blue-400 to-indigo-500',
  streak_60: 'from-purple-400 to-pink-500',
  streak_100: 'from-rose-400 to-red-500',
  // Kanji badges (red tones)
  kanji_50: 'from-red-300 to-red-400',
  kanji_100: 'from-red-400 to-red-500',
  kanji_250: 'from-red-500 to-red-600',
  kanji_500: 'from-red-600 to-red-700',
  kanji_1000: 'from-red-700 to-rose-800',
  // Vocabulary badges (blue tones)
  vocab_100: 'from-sky-300 to-sky-400',
  vocab_500: 'from-sky-400 to-sky-500',
  vocab_1000: 'from-sky-500 to-blue-600',
  vocab_2500: 'from-blue-600 to-blue-700',
  vocab_5000: 'from-blue-700 to-indigo-800',
  // Grammar badges (green tones)
  grammar_25: 'from-emerald-300 to-emerald-400',
  grammar_50: 'from-emerald-400 to-emerald-500',
  grammar_100: 'from-emerald-500 to-green-600',
  grammar_200: 'from-green-600 to-green-700',
  // Listening badges (purple tones)
  listening_60: 'from-violet-300 to-violet-400',
  listening_300: 'from-violet-400 to-violet-500',
  listening_600: 'from-violet-500 to-purple-600',
  listening_1500: 'from-purple-600 to-purple-700',
  // Reading badges (amber tones)
  reading_10: 'from-amber-300 to-amber-400',
  reading_50: 'from-amber-400 to-amber-500',
  reading_100: 'from-amber-500 to-orange-600',
  reading_250: 'from-orange-600 to-orange-700',
};

const StreakTracker = () => {
  const { profile, badges, loading } = useProfile();

  if (loading) {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="h-20 bg-muted rounded" />
      </div>
    );
  }

  const currentStreak = profile?.current_streak || 0;
  const longestStreak = profile?.longest_streak || 0;

  // Calculate next milestone
  const milestones = [7, 14, 30, 60, 100];
  const nextMilestone = milestones.find((m) => m > currentStreak) || 100;
  const progressToNext = (currentStreak / nextMilestone) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
    >
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Flame className="w-5 h-5 text-primary" />
        Study Streak
      </h2>

      {/* Current Streak Display */}
      <div className="flex items-center justify-center mb-6">
        <motion.div
          animate={{
            scale: currentStreak > 0 ? [1, 1.05, 1] : 1,
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <div className="text-center">
              <motion.span
                key={currentStreak}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-bold text-foreground block"
              >
                {currentStreak}
              </motion.span>
              <span className="text-xs text-muted-foreground">days</span>
            </div>
          </div>
          {currentStreak > 0 && (
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              className="absolute -top-2 -right-2"
            >
              <Flame className="w-8 h-8 text-primary" />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Progress to next milestone */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Next badge: {nextMilestone} days</span>
          <span className="font-medium text-foreground">
            {nextMilestone - currentStreak} to go
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, progressToNext)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Streak stats */}
      <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-xl mb-4">
        <div className="text-center">
          <span className="text-xs text-muted-foreground block">Current</span>
          <span className="font-bold text-foreground">{currentStreak}</span>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center">
          <span className="text-xs text-muted-foreground block">Longest</span>
          <span className="font-bold text-foreground">{longestStreak}</span>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center">
          <span className="text-xs text-muted-foreground block">Badges</span>
          <span className="font-bold text-foreground">{badges.length}</span>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Earned Badges</h3>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r ${
                  badgeColors[badge.badge_type] || 'from-gray-400 to-gray-500'
                } text-white text-sm font-medium shadow-md`}
                title={badge.description || ''}
              >
                {badgeIcons[badge.badge_type] || <Award className="w-4 h-4" />}
                <span className="truncate max-w-[120px]">{badge.badge_name.split(' ')[0]}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Encouragement message */}
      <p className="text-sm text-muted-foreground text-center mt-4 italic">
        {currentStreak === 0
          ? 'Start your journey today. 始めましょう。'
          : currentStreak < 7
          ? 'Building momentum! 頑張れ！'
          : currentStreak < 30
          ? 'Consistency is growing. 継続は力なり。'
          : 'You are unstoppable! 素晴らしい！'}
      </p>
    </motion.div>
  );
};

export default StreakTracker;
