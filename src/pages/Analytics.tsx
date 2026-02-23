import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Target, Lightbulb } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { ProgressRing } from '@/components/ProgressRing';
import { AnalyticsRangeSelector } from '@/components/AnalyticsRangeSelector';
import { useStudyProgress } from '@/hooks/useStudyProgress';
import { useAnalyticsRange } from '@/hooks/useAnalyticsRange';

const Analytics = () => {
  const { studyProgress } = useStudyProgress();
  
  const {
    rangeType,
    customRange,
    setRangeType,
    setCustomRange,
    filterByRange,
    getRangeLabel,
  } = useAnalyticsRange(studyProgress.length > 0, studyProgress.length);

  // Filter progress by selected range
  const filteredProgress = filterByRange(studyProgress);

  // Timeline data for chart
  const timelineData = [...filteredProgress]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((day) => ({
      date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      minutes: day.total_minutes || 0,
    }));

  // Section balance data from filtered progress
  const totalKanji = filteredProgress.reduce((sum, d) => sum + (d.kanji || 0), 0);
  const totalVocab = filteredProgress.reduce((sum, d) => sum + (d.vocabulary || 0), 0);
  const totalGrammar = filteredProgress.reduce((sum, d) => sum + (d.grammar || 0), 0);
  const totalListening = filteredProgress.reduce((sum, d) => sum + (d.listening_minutes || 0), 0);
  const totalReading = filteredProgress.reduce((sum, d) => sum + (d.reading_passages || 0), 0);

  // Dynamic targets based on range
  const daysInRange = Math.max(1, filteredProgress.length);
  const kanjiTarget = daysInRange * 5;
  const vocabTarget = daysInRange * 20;
  const grammarTarget = daysInRange * 3;
  const listeningTarget = daysInRange * 15;
  const readingTarget = daysInRange * 2;

  const radarData = [
    { section: 'Kanji', value: Math.min(100, (totalKanji / kanjiTarget) * 100) },
    { section: 'Vocabulary', value: Math.min(100, (totalVocab / vocabTarget) * 100) },
    { section: 'Grammar', value: Math.min(100, (totalGrammar / grammarTarget) * 100) },
    { section: 'Listening', value: Math.min(100, (totalListening / listeningTarget) * 100) },
    { section: 'Reading', value: Math.min(100, (totalReading / readingTarget) * 100) },
  ];

  const pieData = [
    { name: 'Kanji', value: totalKanji, color: 'hsl(var(--kanji))' },
    { name: 'Vocabulary', value: totalVocab / 4, color: 'hsl(var(--vocabulary))' },
    { name: 'Grammar', value: totalGrammar * 7, color: 'hsl(var(--grammar))' },
    { name: 'Listening', value: totalListening, color: 'hsl(var(--listening))' },
    { name: 'Reading', value: totalReading * 10, color: 'hsl(var(--reading))' },
  ];

  // Overall score
  const avgProgress = radarData.reduce((sum, d) => sum + d.value, 0) / radarData.length;

  // Insight generation
  const weakest = radarData.reduce((min, d) => d.value < min.value ? d : min, radarData[0]);
  const strongest = radarData.reduce((max, d) => d.value > max.value ? d : max, radarData[0]);

  const totalMinutes = filteredProgress.reduce((sum, d) => sum + (d.total_minutes || 0), 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 rounded-xl shadow-lg border border-border">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{payload[0].value} minutes</p>
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
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">
              Analytics <span className="text-muted-foreground font-normal">分析</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Understand your progress deeply.
            </p>
          </div>
          
          <AnalyticsRangeSelector
            rangeType={rangeType}
            customRange={customRange}
            onRangeTypeChange={setRangeType}
            onCustomRangeChange={setCustomRange}
          />
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Overall Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Overall Progress
            </h2>
            <div className="flex justify-center mb-4">
              <ProgressRing progress={avgProgress} size={140} strokeWidth={12}>
                <div className="text-center">
                  <span className="text-3xl font-bold text-foreground">{Math.round(avgProgress)}%</span>
                  <p className="text-xs text-muted-foreground">Complete</p>
                </div>
              </ProgressRing>
            </div>
            <p className="text-sm text-center text-muted-foreground italic">
              "{getRangeLabel()}" progress
            </p>
          </motion.div>

          {/* Section Balance Radar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-6 shadow-card border border-border/50 lg:col-span-2"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Section Balance</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="section"
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Progress"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Study Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-6 shadow-card border border-border/50 lg:col-span-2"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Study Timeline ({getRangeLabel()})
            </h2>
            <div className="h-48">
              {timelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <defs>
                      <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="minutes"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#colorMinutes)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data for selected range
                </div>
              )}
            </div>
          </motion.div>

          {/* Time Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Time Distribution</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
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
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-accent/20 rounded-2xl p-6 border border-accent/30 lg:col-span-3"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent" />
              Insights ({getRangeLabel()})
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-card/50 rounded-xl p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Strongest Area</p>
                <p className="text-lg font-semibold text-foreground">{strongest.section}</p>
                <p className="text-sm text-muted-foreground">Keep building on this strength!</p>
              </div>
              <div className="bg-card/50 rounded-xl p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Needs Attention</p>
                <p className="text-lg font-semibold text-foreground">{weakest.section}</p>
                <p className="text-sm text-muted-foreground">A little focus here will help balance.</p>
              </div>
              <div className="bg-card/50 rounded-xl p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Study Time</p>
                <p className="text-lg font-semibold text-foreground">
                  {Math.round(totalMinutes / 60)} hours
                </p>
                <p className="text-sm text-muted-foreground">Every minute counts. 🌸</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
