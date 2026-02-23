import { motion } from 'framer-motion';
import { Flame, TrendingUp } from 'lucide-react';
import { ProgressRing } from './ProgressRing';
import { useStudyProgress } from '@/hooks/useStudyProgress';
import { useProfile } from '@/hooks/useProfile';

export const DailyProgress = () => {
  const { getTodayProgress } = useStudyProgress();
  const { profile } = useProfile();
  const todayProgress = getTodayProgress();

  const dailyTarget = {
    kanji: profile?.daily_target_kanji ?? 5,
    vocabulary: profile?.daily_target_vocabulary ?? 20,
    grammar: profile?.daily_target_grammar ?? 3,
    listeningMinutes: profile?.daily_target_listening_minutes ?? 15,
    readingPassages: profile?.daily_target_reading_passages ?? 2,
    studyMinutes: profile?.daily_target_minutes ?? 60,
  };

  const totalTarget =
    dailyTarget.kanji +
    dailyTarget.vocabulary +
    dailyTarget.grammar +
    dailyTarget.listeningMinutes +
    dailyTarget.readingPassages;

  const todayTotal = todayProgress
    ? (todayProgress.kanji ?? 0) +
      (todayProgress.vocabulary ?? 0) +
      (todayProgress.grammar ?? 0) +
      (todayProgress.listening_minutes ?? 0) +
      (todayProgress.reading_passages ?? 0)
    : 0;

  const overallProgress = totalTarget > 0 ? (todayTotal / totalTarget) * 100 : 0;
  const currentStreak = profile?.current_streak ?? 0;

  const getMessage = () => {
    if (overallProgress >= 100) return "Today's journey is complete. Well done! 🌸";
    if (overallProgress >= 75) return "Almost there. Keep the momentum going.";
    if (overallProgress >= 50) return "Halfway through. You're doing great!";
    if (overallProgress >= 25) return "Good start. Every step counts.";
    return "Begin your study journey for today.";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Today's Progress</h2>
          <p className="text-sm text-muted-foreground">今日の進捗</p>
        </div>
        <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full">
          <Flame className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-primary">{currentStreak}</span>
          <span className="text-xs text-primary/80">day streak</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <ProgressRing
          progress={overallProgress}
          size={100}
          strokeWidth={10}
          color="hsl(var(--primary))"
        >
          <div className="text-center">
            <span className="text-xl font-bold text-foreground">
              {Math.round(overallProgress)}%
            </span>
          </div>
        </ProgressRing>

        <div className="flex-1">
          <p className="text-sm text-foreground mb-3">{getMessage()}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>
              {todayProgress?.total_minutes || 0} / {dailyTarget.studyMinutes} minutes studied
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
