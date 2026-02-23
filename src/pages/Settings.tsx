import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Shield, Moon, Sun, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useProfile } from '@/hooks/useProfile';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const Settings = () => {
  const navigate = useNavigate();
  const { profile, loading, updateProfile } = useProfile();

  const handleNotificationToggle = async (
    key: 'notification_daily_reminder' | 'notification_streak_reminder' | 'notification_exam_reminder',
    value: boolean
  ) => {
    const { error } = await updateProfile({ [key]: value });
    if (error) {
      toast.error('Failed to update setting');
    } else {
      toast.success('Setting updated');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 max-w-lg">
          <Skeleton className="h-10 w-32 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-foreground font-display">
            Settings <span className="text-muted-foreground font-normal">設定</span>
          </h1>
        </motion.div>

        {/* Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 shadow-card border border-border/50 mb-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Notifications</h2>
              <p className="text-xs text-muted-foreground">通知設定</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="daily-reminder" className="text-sm font-medium">
                  Daily Study Reminder
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get reminded to study each day
                </p>
              </div>
              <Switch
                id="daily-reminder"
                checked={profile?.notification_daily_reminder ?? true}
                onCheckedChange={(checked) =>
                  handleNotificationToggle('notification_daily_reminder', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="streak-reminder" className="text-sm font-medium">
                  Streak Reminder
                </Label>
                <p className="text-xs text-muted-foreground">
                  Don't break your streak!
                </p>
              </div>
              <Switch
                id="streak-reminder"
                checked={profile?.notification_streak_reminder ?? true}
                onCheckedChange={(checked) =>
                  handleNotificationToggle('notification_streak_reminder', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="exam-reminder" className="text-sm font-medium">
                  Exam Countdown
                </Label>
                <p className="text-xs text-muted-foreground">
                  Reminders as exam approaches
                </p>
              </div>
              <Switch
                id="exam-reminder"
                checked={profile?.notification_exam_reminder ?? true}
                onCheckedChange={(checked) =>
                  handleNotificationToggle('notification_exam_reminder', checked)
                }
              />
            </div>
          </div>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-5 shadow-card border border-border/50"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">About</h2>
              <p className="text-xs text-muted-foreground">アプリについて</p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>App Name</span>
              <span className="text-foreground">道標 Michi Shirube</span>
            </div>
            <div className="flex justify-between">
              <span>Version</span>
              <span className="text-foreground">1.0.0</span>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Settings;
