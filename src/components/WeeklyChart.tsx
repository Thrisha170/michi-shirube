import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { useStudyProgress } from '@/hooks/useStudyProgress';
import { useMemo } from 'react';

export const WeeklyChart = () => {
  const { studyProgress } = useStudyProgress();

  const last7Days = useMemo(() => {
    // Build data for the last 7 calendar days
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = studyProgress.find((p) => p.date === dateStr);
      days.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        minutes: entry?.total_minutes ?? 0,
      });
    }
    return days;
  }, [studyProgress]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 rounded-xl shadow-lg border border-border">
          <p className="text-sm font-medium text-foreground mb-1">{label}</p>
          <p className="text-xs text-muted-foreground">
            {payload[0].value} minutes studied
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Weekly Activity</h2>
        <p className="text-sm text-muted-foreground">週間活動</p>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={last7Days} barSize={24}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
            <Bar
              dataKey="minutes"
              fill="hsl(var(--primary))"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center italic">
        "Consistency builds mastery. 継続は力なり。"
      </p>
    </motion.div>
  );
};
