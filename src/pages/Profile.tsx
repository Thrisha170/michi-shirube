import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Award, Calendar, Clock, Camera, Edit2, X, Check, Trash2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useProfile, type Profile as ProfileType } from '@/hooks/useProfile';
import { useStudyProgress } from '@/hooks/useStudyProgress';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, badges, loading: profileLoading, updateProfile, fetchProfile } = useProfile();
  const { studyProgress, loading: progressLoading } = useStudyProgress();
  
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editedLevel, setEditedLevel] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const loading = profileLoading || progressLoading;
  
  const currentStreak = profile?.current_streak || 0;
  const longestStreak = profile?.longest_streak || 0;
  const jlptLevel = profile?.jlpt_level || '--';
  
  const getDaysUntilExam = () => {
    if (!profile?.exam_date) return null;
    const diff = new Date(profile.exam_date).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };
  
  const daysLeft = getDaysUntilExam();
  const totalMinutes = studyProgress.reduce((sum, d) => sum + (d.total_minutes || 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      await updateProfile({ avatar_url: avatarUrl });
      
      toast.success('Profile photo updated!');
      fetchProfile();
    } catch (error) {
      // Upload error handled via toast
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    
    try {
      await supabase.storage
        .from('avatars')
        .remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`, `${user.id}/avatar.webp`]);

      await updateProfile({ avatar_url: null });
      toast.success('Profile photo removed');
      fetchProfile();
    } catch (error) {
      // Remove error handled via toast
      toast.error('Failed to remove photo');
    }
  };

  const handleSaveLevel = async () => {
    if (editedLevel) {
      const { error } = await updateProfile({ jlpt_level: editedLevel });
      if (error) {
        toast.error('Failed to update level');
      } else {
        toast.success('JLPT level updated!');
      }
    }
    setIsEditing(false);
    setEditedLevel(null);
  };

  const handleStartEdit = () => {
    setEditedLevel(profile?.jlpt_level || 'N5');
    setIsEditing(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
          <Skeleton className="h-10 w-48 mb-8" />
          <Skeleton className="h-64 w-full rounded-2xl mb-6" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">
            Profile <span className="text-muted-foreground font-normal">プロフィール</span>
          </h1>
        </motion.div>

        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 shadow-card border border-border/50 mb-6"
        >
          <div className="flex items-center gap-4 mb-6">
            {/* Avatar with upload */}
            <div className="relative group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-primary-foreground" />
                )}
              </div>
              
              {/* Upload overlay */}
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Camera className="w-5 h-5 text-primary-foreground" />
                </button>
                {profile?.avatar_url && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="p-1 hover:scale-110 transition-transform ml-1"
                  >
                    <Trash2 className="w-4 h-4 text-primary-foreground" />
                  </button>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">JLPT Learner</h2>
              
              {/* Editable JLPT Level */}
              <div className="flex items-center gap-2 mt-1">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Select value={editedLevel || 'N5'} onValueChange={setEditedLevel}>
                      <SelectTrigger className="w-20 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {JLPT_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSaveLevel}>
                      <Check className="w-4 h-4 text-secondary" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsEditing(false)}>
                      <X className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground">Level {jlptLevel} Student</p>
                    <button
                      onClick={handleStartEdit}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <Award className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{currentStreak}</p>
              <p className="text-xs text-muted-foreground">Current Streak</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <Award className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{longestStreak}</p>
              <p className="text-xs text-muted-foreground">Longest Streak</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{totalHours}h</p>
              <p className="text-xs text-muted-foreground">Total Study</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{daysLeft ?? '--'}</p>
              <p className="text-xs text-muted-foreground">Days Left</p>
            </div>
          </div>
        </motion.div>

        {/* Badges Section */}
        <div className="mb-6">
          <BadgeDisplay badges={badges} />
          {badges.length > 0 && (
            <Button
              variant="ghost"
              className="w-full mt-2 text-primary hover:text-primary/80"
              onClick={() => navigate('/badges')}
            >
              View All Badges
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>

        {/* Motivation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-accent/20 rounded-2xl p-6 border border-accent/30 text-center"
        >
          <p className="text-2xl font-display text-foreground mb-2">七転び八起き</p>
          <p className="text-muted-foreground italic">Fall seven times, get up eight.</p>
          <p className="text-sm text-muted-foreground mt-4">
            {currentStreak === 0
              ? 'Start your journey today. Log your first study session!'
              : `You're on a ${currentStreak}-day streak. Keep going!`}
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;
