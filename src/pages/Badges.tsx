import { motion } from 'framer-motion';
import { Award, ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Badges = () => {
  const navigate = useNavigate();
  const { badges, loading } = useProfile();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" />
              Badge Collection
            </h1>
            <p className="text-sm text-muted-foreground">バッジコレクション · All your achievements</p>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <BadgeDisplay badges={badges} />
        )}
      </div>
    </Layout>
  );
};

export default Badges;
