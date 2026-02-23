import { motion } from 'framer-motion';
import { Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import logo from '@/assets/logo.png';

export const Header = () => {
  const { selectedLevel } = useStore();
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Michi Shirube"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-foreground font-display">道標</h1>
              <p className="text-xs text-muted-foreground">Michi Shirube</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedLevel && (
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                {selectedLevel}
              </span>
            )}
            <button
              onClick={() => navigate('/profile')}
              className="p-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Profile"
            >
              <User className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="p-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
