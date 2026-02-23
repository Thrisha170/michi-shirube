import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Timer } from 'lucide-react';
import { useStudyProgress, Section } from '@/hooks/useStudyProgress';
import { toast } from 'sonner';

const sections: { label: string; section: Section; color: string }[] = [
  { label: 'Kanji', section: 'kanji', color: 'hsl(var(--kanji))' },
  { label: 'Vocabulary', section: 'vocabulary', color: 'hsl(var(--vocabulary))' },
  { label: 'Grammar', section: 'grammar', color: 'hsl(var(--grammar))' },
  { label: 'Listening', section: 'listening', color: 'hsl(var(--listening))' },
  { label: 'Reading', section: 'reading', color: 'hsl(var(--reading))' },
];

const StudyTimer = () => {
  const { logStudy } = useStudyProgress();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedSection, setSelectedSection] = useState<Section>('listening');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    if (elapsedSeconds < 60) {
      toast.info('Session too short to log', {
        description: 'Study for at least 1 minute to log time.',
      });
      setIsRunning(false);
      setElapsedSeconds(0);
      return;
    }

    const minutes = Math.round(elapsedSeconds / 60);
    logStudy(selectedSection, minutes);
    
    const sectionLabel = sections.find(s => s.section === selectedSection)?.label;
    toast.success(`${minutes} minutes logged to ${sectionLabel}!`, {
      description: 'Great study session! 頑張った！',
    });

    setIsRunning(false);
    setElapsedSeconds(0);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
  };

  const currentSection = sections.find(s => s.section === selectedSection);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
    >
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Timer className="w-5 h-5 text-primary" />
        Study Timer
      </h2>

      {/* Section Selector */}
      <div className="mb-6">
        <label className="text-sm text-muted-foreground mb-2 block">
          What are you studying?
        </label>
        <div className="flex flex-wrap gap-2">
          {sections.map((s) => (
            <button
              key={s.section}
              onClick={() => !isRunning && setSelectedSection(s.section)}
              disabled={isRunning}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedSection === s.section
                  ? 'text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={
                selectedSection === s.section
                  ? { backgroundColor: s.color }
                  : {}
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-6">
        <motion.div
          key={elapsedSeconds}
          initial={{ scale: 1 }}
          animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
          className="text-5xl md:text-6xl font-bold font-mono tracking-tight"
          style={{ color: currentSection?.color }}
        >
          {formatTime(elapsedSeconds)}
        </motion.div>
        <p className="text-sm text-muted-foreground mt-2">
          {isRunning ? 'Session in progress...' : elapsedSeconds > 0 ? 'Paused' : 'Ready to start'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <AnimatePresence mode="wait">
          {!isRunning ? (
            <motion.button
              key="start"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all"
              style={{ backgroundColor: currentSection?.color }}
            >
              <Play className="w-5 h-5" />
              {elapsedSeconds > 0 ? 'Resume' : 'Start'}
            </motion.button>
          ) : (
            <motion.button
              key="pause"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePause}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-muted font-medium text-foreground transition-all hover:bg-muted/80"
            >
              <Pause className="w-5 h-5" />
              Pause
            </motion.button>
          )}
        </AnimatePresence>

        {elapsedSeconds > 0 && (
          <>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStop}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary font-medium text-secondary-foreground transition-all hover:bg-secondary/80"
            >
              <Square className="w-4 h-4" />
              Log & Stop
            </motion.button>
            
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleReset}
              className="px-3 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              title="Reset without logging"
            >
              Reset
            </motion.button>
          </>
        )}
      </div>

      {elapsedSeconds > 0 && elapsedSeconds < 60 && (
        <p className="text-xs text-muted-foreground text-center mt-4">
          Study for at least 1 minute to log time
        </p>
      )}
    </motion.div>
  );
};

export default StudyTimer;
