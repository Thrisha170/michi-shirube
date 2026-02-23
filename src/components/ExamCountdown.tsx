 import { motion } from 'framer-motion';
 import { Calendar, Sparkles } from 'lucide-react';
 import { useStore } from '@/lib/store';
 
 export const ExamCountdown = () => {
   const { examDate, getDaysUntilExam, selectedLevel } = useStore();
   const daysLeft = getDaysUntilExam();
 
   if (!examDate || daysLeft === null) return null;
 
   const getMessage = () => {
     if (daysLeft === 0) return "Today is the day. You are ready. 頑張って！";
     if (daysLeft <= 7) return "The path is almost complete. Trust your journey.";
     if (daysLeft <= 30) return "Every step forward matters. Keep going.";
     return "Steady progress leads to success. 一歩一歩。";
   };
 
   return (
     <motion.div
       initial={{ opacity: 0, scale: 0.95 }}
       animate={{ opacity: 1, scale: 1 }}
       className="bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 rounded-2xl p-6 border border-primary/20"
     >
       <div className="flex items-start justify-between mb-4">
         <div className="flex items-center gap-2">
           <Calendar className="w-5 h-5 text-primary" />
           <span className="text-sm font-medium text-muted-foreground">
             JLPT {selectedLevel} Exam
           </span>
         </div>
         <Sparkles className="w-4 h-4 text-accent animate-pulse-soft" />
       </div>
 
       <div className="mb-3">
         <div className="flex items-baseline gap-2">
           <span className="text-4xl font-bold text-foreground">{daysLeft}</span>
           <span className="text-lg text-muted-foreground">days remaining</span>
         </div>
         <p className="text-xs text-muted-foreground mt-1">
           {new Date(examDate).toLocaleDateString('en-US', {
             weekday: 'long',
             year: 'numeric',
             month: 'long',
             day: 'numeric',
           })}
         </p>
       </div>
 
       <p className="text-sm text-foreground/80 italic">{getMessage()}</p>
     </motion.div>
   );
 };