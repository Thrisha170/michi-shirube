import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Clock, CheckCircle2, Minus, Undo2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { toast } from 'sonner';
import { useState } from 'react';
import StudyTimer from '@/components/StudyTimer';
import StreakTracker from '@/components/StreakTracker';
import { useStudyProgress, Section } from '@/hooks/useStudyProgress';
import { useProfile } from '@/hooks/useProfile';

const quickActions: { label: string; section: Section; color: string; defaultCount: number; unit: string }[] = [
  { label: 'Kanji', section: 'kanji', color: 'hsl(var(--kanji))', defaultCount: 5, unit: 'characters' },
  { label: 'Vocabulary', section: 'vocabulary', color: 'hsl(var(--vocabulary))', defaultCount: 20, unit: 'words' },
  { label: 'Grammar', section: 'grammar', color: 'hsl(var(--grammar))', defaultCount: 3, unit: 'points' },
  { label: 'Listening', section: 'listening', color: 'hsl(var(--listening))', defaultCount: 15, unit: 'minutes' },
  { label: 'Reading', section: 'reading', color: 'hsl(var(--reading))', defaultCount: 2, unit: 'passages' },
];

const encouragements = [
  "Great work! 頑張った！",
  "Keep it up! 🌸",
  "Progress made! 一歩前進",
  "Well done! すごい！",
  "You're doing great!",
];

const Study = () => {
  const { getTodayProgress, logStudy, lastAction, undoLastAction } = useStudyProgress();
  const { profile } = useProfile();
  const todayProgress = getTodayProgress();
  const [amounts, setAmounts] = useState<Record<Section, number>>({
    kanji: 5,
    vocabulary: 20,
    grammar: 3,
    listening: 15,
    reading: 2,
  });

  const handleLog = async (section: Section, amount: number) => {
    if (amount <= 0) return;
    
    await logStudy(section, amount);
    
    const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    const action = quickActions.find(a => a.section === section);
    
    toast.success(`+${amount} ${action?.unit || 'items'} logged!`, {
      description: encouragement,
    });
  };

  const handleUndo = async () => {
    const success = await undoLastAction();
    if (success) {
      toast.success('Last entry undone!', {
        description: 'Your progress has been reverted.',
      });
    } else {
      toast.error('Cannot undo', {
        description: 'Undo is only available within 5 minutes of logging.',
      });
    }
  };

  const adjustAmount = (section: Section, delta: number) => {
    setAmounts(prev => ({
      ...prev,
      [section]: Math.max(1, prev[section] + delta),
    }));
  };

  const getProgress = (section: Section) => {
    if (!todayProgress) return 0;
    switch (section) {
      case 'kanji': return todayProgress.kanji;
      case 'vocabulary': return todayProgress.vocabulary;
      case 'grammar': return todayProgress.grammar;
      case 'listening': return todayProgress.listening_minutes;
      case 'reading': return todayProgress.reading_passages;
    }
  };

  const getTarget = (section: Section) => {
    if (!profile) {
      // Default targets
      switch (section) {
        case 'kanji': return 5;
        case 'vocabulary': return 20;
        case 'grammar': return 3;
        case 'listening': return 15;
        case 'reading': return 2;
      }
    }
    switch (section) {
      case 'kanji': return profile.daily_target_kanji;
      case 'vocabulary': return profile.daily_target_vocabulary;
      case 'grammar': return profile.daily_target_grammar;
      case 'listening': return profile.daily_target_listening_minutes;
      case 'reading': return profile.daily_target_reading_passages;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">
            Study <span className="text-muted-foreground font-normal">学習</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Log your study progress for today.
          </p>
        </motion.div>

        {/* Two column layout on desktop */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Study Timer */}
            <StudyTimer />

            {/* Quick Log */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Quick Log
                </h2>
                {lastAction && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={handleUndo}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  >
                    <Undo2 className="w-4 h-4" />
                    Undo
                  </motion.button>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {quickActions.map((action, index) => {
                  const progress = getProgress(action.section);
                  const target = getTarget(action.section);
                  const isComplete = progress >= target;
                  
                  return (
                    <motion.div
                      key={action.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`rounded-xl border transition-all ${
                        isComplete 
                          ? 'border-secondary/50 bg-secondary/10' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {/* Header */}
                      <div className="p-3 border-b border-border/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-foreground">{action.label}</span>
                          {isComplete && (
                            <CheckCircle2 className="w-4 h-4 text-secondary" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {progress} / {target} {action.unit}
                        </div>
                        {/* Progress bar */}
                        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: action.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (progress / target) * 100)}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                      
                      {/* Amount selector */}
                      <div className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            onClick={() => adjustAmount(action.section, -1)}
                            className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <span className="text-lg font-bold text-foreground min-w-[2rem] text-center">
                            {amounts[action.section]}
                          </span>
                          <button
                            onClick={() => adjustAmount(action.section, 1)}
                            className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleLog(action.section, amounts[action.section])}
                          className="w-full mt-2 py-2 rounded-lg font-medium text-sm transition-all"
                          style={{ 
                            backgroundColor: `${action.color}20`, 
                            color: action.color 
                          }}
                        >
                          + Log
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Today's Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Today's Progress
              </h2>

              <AnimatePresence mode="wait">
                {todayProgress && (todayProgress.kanji > 0 || todayProgress.vocabulary > 0 || 
                  todayProgress.grammar > 0 || todayProgress.listening_minutes > 0 || 
                  todayProgress.reading_passages > 0) ? (
                  <motion.div 
                    key="has-progress"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    {todayProgress.kanji > 0 && (
                      <motion.div 
                        layout
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--kanji) / 0.2)' }}>
                            <CheckCircle2 className="w-4 h-4" style={{ color: 'hsl(var(--kanji))' }} />
                          </div>
                          <span className="text-foreground">Kanji</span>
                        </div>
                        <span className="font-bold text-foreground">{todayProgress.kanji} characters</span>
                      </motion.div>
                    )}
                    {todayProgress.vocabulary > 0 && (
                      <motion.div 
                        layout
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--vocabulary) / 0.2)' }}>
                            <CheckCircle2 className="w-4 h-4" style={{ color: 'hsl(var(--vocabulary))' }} />
                          </div>
                          <span className="text-foreground">Vocabulary</span>
                        </div>
                        <span className="font-bold text-foreground">{todayProgress.vocabulary} words</span>
                      </motion.div>
                    )}
                    {todayProgress.grammar > 0 && (
                      <motion.div 
                        layout
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--grammar) / 0.2)' }}>
                            <CheckCircle2 className="w-4 h-4" style={{ color: 'hsl(var(--grammar))' }} />
                          </div>
                          <span className="text-foreground">Grammar</span>
                        </div>
                        <span className="font-bold text-foreground">{todayProgress.grammar} points</span>
                      </motion.div>
                    )}
                    {todayProgress.listening_minutes > 0 && (
                      <motion.div 
                        layout
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--listening) / 0.2)' }}>
                            <CheckCircle2 className="w-4 h-4" style={{ color: 'hsl(var(--listening))' }} />
                          </div>
                          <span className="text-foreground">Listening</span>
                        </div>
                        <span className="font-bold text-foreground">{todayProgress.listening_minutes} minutes</span>
                      </motion.div>
                    )}
                    {todayProgress.reading_passages > 0 && (
                      <motion.div 
                        layout
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--reading) / 0.2)' }}>
                            <CheckCircle2 className="w-4 h-4" style={{ color: 'hsl(var(--reading))' }} />
                          </div>
                          <span className="text-foreground">Reading</span>
                        </div>
                        <span className="font-bold text-foreground">{todayProgress.reading_passages} passages</span>
                      </motion.div>
                    )}
                    
                    {/* Total time */}
                    <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                      <span className="text-muted-foreground">Total study time</span>
                      <span className="font-bold text-primary">{todayProgress.total_minutes} minutes</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="no-progress"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <p>No study sessions logged today.</p>
                    <p className="text-sm mt-1 italic">Begin your journey. 一歩一歩。</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Sidebar - Streak Tracker */}
          <div className="lg:col-span-1">
            <StreakTracker />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Study;
