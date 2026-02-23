import { motion } from 'framer-motion';
import {
  Flame,
  Languages,
  BookA,
  MessageSquare,
  Headphones,
  FileText,
  Award,
} from 'lucide-react';
import type { Badge } from '@/hooks/useProfile';

const BADGE_CATEGORY_CONFIG: Record<
  string,
  { icon: typeof Award; colorClass: string; bgClass: string }
> = {
  streak: { icon: Flame, colorClass: 'text-primary', bgClass: 'bg-primary/10' },
  kanji: { icon: Languages, colorClass: 'text-[hsl(var(--kanji))]', bgClass: 'bg-[hsl(var(--kanji)/0.1)]' },
  vocabulary: { icon: BookA, colorClass: 'text-[hsl(var(--vocabulary))]', bgClass: 'bg-[hsl(var(--vocabulary)/0.1)]' },
  grammar: { icon: MessageSquare, colorClass: 'text-[hsl(var(--grammar))]', bgClass: 'bg-[hsl(var(--grammar)/0.1)]' },
  listening: { icon: Headphones, colorClass: 'text-[hsl(var(--listening))]', bgClass: 'bg-[hsl(var(--listening)/0.1)]' },
  reading: { icon: FileText, colorClass: 'text-[hsl(var(--reading))]', bgClass: 'bg-[hsl(var(--reading)/0.1)]' },
};

function getCategoryFromType(badgeType: string): string {
  if (badgeType.startsWith('streak')) return 'streak';
  if (badgeType.startsWith('kanji')) return 'kanji';
  if (badgeType.startsWith('vocab')) return 'vocabulary';
  if (badgeType.startsWith('grammar')) return 'grammar';
  if (badgeType.startsWith('listening')) return 'listening';
  if (badgeType.startsWith('reading')) return 'reading';
  return 'streak';
}

interface BadgeDisplayProps {
  badges: Badge[];
}

export const BadgeDisplay = ({ badges }: BadgeDisplayProps) => {
  if (badges.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <Award className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Badges</h2>
            <p className="text-xs text-muted-foreground">バッジ</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          No badges earned yet. Keep studying to unlock your first! 🌸
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
          <Award className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Badges</h2>
          <p className="text-xs text-muted-foreground">
            {badges.length} badge{badges.length !== 1 ? 's' : ''} earned · バッジ
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {badges.map((badge, index) => {
          const category = getCategoryFromType(badge.badge_type);
          const config = BADGE_CATEGORY_CONFIG[category] || BADGE_CATEGORY_CONFIG.streak;
          const Icon = config.icon;

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * index }}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className={`w-9 h-9 rounded-lg ${config.bgClass} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4.5 h-4.5 ${config.colorClass}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground leading-tight truncate">
                  {badge.badge_name}
                </p>
                {badge.description && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                    {badge.description}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
