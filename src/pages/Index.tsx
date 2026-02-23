import { motion } from 'framer-motion';
import { Languages, BookA, MessageSquare, Headphones, FileText } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { DailyProgress } from '@/components/DailyProgress';
import { ExamCountdown } from '@/components/ExamCountdown';
import { SectionCard } from '@/components/SectionCard';
import { WeeklyChart } from '@/components/WeeklyChart';
import { MotivationalQuote } from '@/components/MotivationalQuote';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import { useStudyProgress } from '@/hooks/useStudyProgress';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';

const sections = [
  { id: 'kanji', title: 'Kanji', titleJp: '漢字', icon: Languages, color: 'hsl(var(--kanji))', unit: 'characters' },
  { id: 'vocabulary', title: 'Vocabulary', titleJp: '語彙', icon: BookA, color: 'hsl(var(--vocabulary))', unit: 'words' },
  { id: 'grammar', title: 'Grammar', titleJp: '文法', icon: MessageSquare, color: 'hsl(var(--grammar))', unit: 'points' },
  { id: 'listening', title: 'Listening', titleJp: '聴解', icon: Headphones, color: 'hsl(var(--listening))', unit: 'minutes' },
  { id: 'reading', title: 'Reading', titleJp: '読解', icon: FileText, color: 'hsl(var(--reading))', unit: 'passages' },
];

const Index = () => {
  const navigate = useNavigate();
  const { getTodayProgress } = useStudyProgress();
  const { profile, badges } = useProfile();
  const todayProgress = getTodayProgress();

  const dailyTarget = {
    kanji: profile?.daily_target_kanji ?? 5,
    vocabulary: profile?.daily_target_vocabulary ?? 20,
    grammar: profile?.daily_target_grammar ?? 3,
    listening: profile?.daily_target_listening_minutes ?? 15,
    reading: profile?.daily_target_reading_passages ?? 2,
  };

  const getSectionData = (sectionId: string) => {
    const target = dailyTarget[sectionId as keyof typeof dailyTarget] || 0;
    let current = 0;
    if (todayProgress) {
      switch (sectionId) {
        case 'kanji': current = todayProgress.kanji ?? 0; break;
        case 'vocabulary': current = todayProgress.vocabulary ?? 0; break;
        case 'grammar': current = todayProgress.grammar ?? 0; break;
        case 'listening': current = todayProgress.listening_minutes ?? 0; break;
        case 'reading': current = todayProgress.reading_passages ?? 0; break;
      }
    }
    const progress = target > 0 ? (current / target) * 100 : 0;
    return { target, current, progress };
  };

  // Show up to 4 most recent badges
  const recentBadges = badges.slice(0, 4);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:block mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground font-display">
            Welcome back! おかえりなさい
          </h1>
          <p className="text-muted-foreground mt-1">
            Let's continue your journey today.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <DailyProgress />

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Study Sections <span className="text-muted-foreground font-normal">学習セクション</span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {sections.map((section, index) => {
                  const data = getSectionData(section.id);
                  return (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <SectionCard
                        title={section.title}
                        titleJp={section.titleJp}
                        icon={section.icon}
                        color={section.color}
                        progress={data.progress}
                        todayCount={data.current}
                        targetCount={data.target}
                        unit={section.unit}
                        onClick={() => navigate(`/${section.id}`)}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <ExamCountdown />
            <WeeklyChart />
            <div className="cursor-pointer" onClick={() => navigate('/badges')}>
              <BadgeDisplay badges={recentBadges} />
              {badges.length > 4 && (
                <p className="text-xs text-center text-primary mt-2 hover:underline">
                  View all {badges.length} badges →
                </p>
              )}
            </div>
            <MotivationalQuote />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
