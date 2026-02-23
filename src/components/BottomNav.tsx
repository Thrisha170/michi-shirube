import { motion } from 'framer-motion';
import { Home, BookOpen, BarChart3, Target, Settings } from 'lucide-react';
import { NavLink } from '@/components/NavLink';

const navItems = [
  { path: '/', icon: Home, label: 'Home', labelJp: 'ホーム' },
  { path: '/study', icon: BookOpen, label: 'Study', labelJp: '学習' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics', labelJp: '分析' },
  { path: '/targets', icon: Target, label: 'Targets', labelJp: '目標' },
  { path: '/settings', icon: Settings, label: 'Settings', labelJp: '設定' },
];

export const BottomNav = () => {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/50 md:hidden"
    >
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-col items-center py-2 px-3 rounded-xl text-muted-foreground transition-colors"
            activeClassName="text-primary bg-primary/10"
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </motion.nav>
  );
};
