import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line,
  PieChart, Pie, Cell,
} from 'recharts';
import { Languages, BookA, MessageSquare, Headphones, FileText, TrendingUp, Target, Zap } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { ProgressRing } from '@/components/ProgressRing';
import { TestLogForm } from '@/components/TestLogForm';
import { RecentTestScores } from '@/components/RecentTestScores';
import { AnalyticsRangeSelector } from '@/components/AnalyticsRangeSelector';
import { useStudyProgress, Section } from '@/hooks/useStudyProgress';
import { useTestScores } from '@/hooks/useTestScores';
import { useProfile } from '@/hooks/useProfile';
import { useAnalyticsRange } from '@/hooks/useAnalyticsRange';

interface SectionPageProps {
  section: Section;
  title: string;
  titleJp: string;
  color: string;
  unit: string;
}

const sectionIcons = {
  kanji: Languages,
  vocabulary: BookA,
  grammar: MessageSquare,
  listening: Headphones,
  reading: FileText,
};

export const SectionPage = ({ section, title, titleJp, color, unit }: SectionPageProps) => {
  const { studyProgress } = useStudyProgress();
  const { getScoresBySection, testScores } = useTestScores();
  const { profile } = useProfile();
  const Icon = sectionIcons[section];

  const {
    rangeType,
    customRange,
    setRangeType,
    setCustomRange,
    filterByRange,
    getRangeLabel,
  } = useAnalyticsRange(studyProgress.length > 0, studyProgress.length);

  // Get progress data for this section
  const getProgressValue = (p: typeof studyProgress[0]) => {
    switch (section) {
      case 'kanji': return p.kanji || 0;
      case 'vocabulary': return p.vocabulary || 0;
      case 'grammar': return p.grammar || 0;
      case 'listening': return p.listening_minutes || 0;
      case 'reading': return p.reading_passages || 0;
    }
  };

  const getTargetValue = () => {
    if (!profile) return 0;
    switch (section) {
      case 'kanji': return profile.daily_target_kanji || 5;
      case 'vocabulary': return profile.daily_target_vocabulary || 20;
      case 'grammar': return profile.daily_target_grammar || 3;
      case 'listening': return profile.daily_target_listening_minutes || 15;
      case 'reading': return profile.daily_target_reading_passages || 2;
    }
  };

  // Filter progress by selected range
  const filteredProgress = filterByRange(studyProgress);

  // Chart data - sorted ascending
  const chartData = [...filteredProgress]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((day) => ({
      name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
      value: getProgressValue(day),
    }));

  // Total and average from filtered data
  const total = filteredProgress.reduce((sum, p) => sum + getProgressValue(p), 0);
  const average = filteredProgress.length > 0 ? Math.round(total / filteredProgress.length) : 0;
  
  // Today's progress (always show regardless of range)
  const today = new Date().toISOString().split('T')[0];
  const todayData = studyProgress.find(p => p.date === today);
  const todayValue = todayData ? getProgressValue(todayData) : 0;
  const targetValue = getTargetValue();
  const todayProgress = targetValue > 0 ? (todayValue / targetValue) * 100 : 0;

  // Test scores for this section - filter by range
  const allSectionScores = getScoresBySection(section);
  const filteredScores = filterByRange(allSectionScores).slice(0, 10);
  const avgScore = filteredScores.length > 0
    ? Math.round(filteredScores.reduce((sum, s) => sum + s.score, 0) / filteredScores.length)
    : 0;

  const scoreData = filteredScores.map((s) => ({
    date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: s.score,
  })).reverse();

  // Donut chart for correct vs incorrect
  const totalCorrect = filteredScores.reduce((sum, s) => sum + s.correct, 0);
  const totalQuestions = filteredScores.reduce((sum, s) => sum + s.total, 0);
  const pieData = [
    { name: 'Correct', value: totalCorrect, color: 'hsl(var(--secondary))' },
    { name: 'Incorrect', value: totalQuestions - totalCorrect, color: 'hsl(var(--muted))' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 rounded-xl shadow-lg border border-border">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{payload[0].value} {unit}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="w-7 h-7" style={{ color }} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">
                {title}
              </h1>
              <p className="text-muted-foreground">{titleJp}</p>
            </div>
          </div>
          
          <AnalyticsRangeSelector
            rangeType={rangeType}
            customRange={customRange}
            onRangeTypeChange={setRangeType}
            onCustomRangeChange={setCustomRange}
          />
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today's Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" style={{ color }} />
              Today's Progress
            </h2>
            <div className="flex justify-center mb-4">
              <ProgressRing progress={todayProgress} size={120} strokeWidth={10} color={color}>
                <div className="text-center">
                  <span className="text-2xl font-bold text-foreground">{todayValue}</span>
                  <p className="text-xs text-muted-foreground">/ {targetValue}</p>
                </div>
              </ProgressRing>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Daily Target</span>
              <span className="font-medium text-foreground">{targetValue} {unit}</span>
            </div>
          </motion.div>

          {/* Study Activity - uses range */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-6 shadow-card border border-border/50 lg:col-span-2"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Study Activity ({getRangeLabel()})
            </h2>
            <div className="h-40">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barSize={32}>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                    <Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data for selected range
                </div>
              )}
            </div>
          </motion.div>

          {/* Statistics - uses range */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color }} />
              Statistics ({getRangeLabel()})
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Studied</span>
                <span className="text-xl font-bold text-foreground">{total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Daily Average</span>
                <span className="text-xl font-bold text-foreground">{average}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Avg Test Score</span>
                <span className="text-xl font-bold text-foreground">{avgScore}%</span>
              </div>
            </div>
          </motion.div>

          {/* Test Score Trend - uses range */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" style={{ color }} />
              Test Accuracy
            </h2>
            {scoreData.length > 0 ? (
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreData}>
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke={color}
                      strokeWidth={2}
                      dot={{ fill: color, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8 text-sm">
                No test data for {getRangeLabel().toLowerCase()}
              </p>
            )}
          </motion.div>

          {/* Correct vs Incorrect - uses range */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Performance</h2>
            {totalQuestions > 0 ? (
              <>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                    <span className="text-muted-foreground">Correct ({totalCorrect})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-muted" />
                    <span className="text-muted-foreground">Incorrect ({totalQuestions - totalCorrect})</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8 text-sm">
                Take a quiz to see your performance
              </p>
            )}
          </motion.div>
        </div>

        {/* Test Logging Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 grid gap-6 lg:grid-cols-2"
        >
          <TestLogForm defaultSection={section} />
          <RecentTestScores section={section} limit={5} />
        </motion.div>

        {/* Encouragement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 bg-accent/20 rounded-2xl p-5 border border-accent/30 text-center"
        >
          <p className="text-foreground">
            {todayProgress >= 100
              ? "Today's goal complete! 🌸 Rest well."
              : todayProgress >= 50
              ? "Great progress! Keep the momentum."
              : "Every step forward counts. 一歩一歩"}
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};
