 import { motion } from 'framer-motion';
 import { LucideIcon } from 'lucide-react';
 import { ProgressRing } from './ProgressRing';
 
 interface SectionCardProps {
   title: string;
   titleJp: string;
   icon: LucideIcon;
   color: string;
   progress: number;
   todayCount: number;
   targetCount: number;
   unit: string;
   onClick?: () => void;
 }
 
 export const SectionCard = ({
   title,
   titleJp,
   icon: Icon,
   color,
   progress,
   todayCount,
   targetCount,
   unit,
   onClick,
 }: SectionCardProps) => {
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       whileHover={{ y: -4, scale: 1.02 }}
       whileTap={{ scale: 0.98 }}
       onClick={onClick}
       className="bg-card rounded-2xl p-5 shadow-card cursor-pointer transition-shadow hover:shadow-lg border border-border/50"
     >
       <div className="flex items-start justify-between mb-4">
         <div>
           <p className="text-xs text-muted-foreground font-medium mb-0.5">{titleJp}</p>
           <h3 className="text-lg font-semibold text-foreground">{title}</h3>
         </div>
         <div
           className="w-10 h-10 rounded-xl flex items-center justify-center"
           style={{ backgroundColor: `${color}20` }}
         >
           <Icon className="w-5 h-5" style={{ color }} />
         </div>
       </div>
 
       <div className="flex items-center gap-4">
         <ProgressRing
           progress={progress}
           size={64}
           strokeWidth={6}
           color={color}
         >
           <span className="text-sm font-bold text-foreground">{Math.round(progress)}%</span>
         </ProgressRing>
 
         <div className="flex-1">
           <div className="flex items-baseline gap-1 mb-1">
             <span className="text-2xl font-bold text-foreground">{todayCount}</span>
             <span className="text-sm text-muted-foreground">/ {targetCount}</span>
           </div>
           <p className="text-xs text-muted-foreground">{unit} today</p>
         </div>
       </div>
     </motion.div>
   );
 };