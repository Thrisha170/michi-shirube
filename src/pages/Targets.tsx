 import { useState } from 'react';
 import { motion } from 'framer-motion';
 import { Target, Calendar, Save } from 'lucide-react';
 import { Layout } from '@/components/Layout';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { useStore } from '@/lib/store';
 import { toast } from 'sonner';
 
 const levels = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
 
 const Targets = () => {
   const { selectedLevel, setLevel, examDate, setExamDate, dailyTarget, setDailyTarget } = useStore();
   const [localTarget, setLocalTarget] = useState(dailyTarget);
   const [localExamDate, setLocalExamDate] = useState(examDate || '');
 
   const handleSave = () => {
     setDailyTarget(localTarget);
     if (localExamDate) setExamDate(localExamDate);
     toast.success('Targets saved successfully!', {
       description: 'Your study goals have been updated. 頑張って！',
     });
   };
 
   return (
     <Layout>
       <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
         <motion.div
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-8"
         >
           <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">
             Targets <span className="text-muted-foreground font-normal">目標</span>
           </h1>
           <p className="text-muted-foreground mt-1">
             Set your daily goals and exam date.
           </p>
         </motion.div>
 
         {/* JLPT Level Selection */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-card rounded-2xl p-6 shadow-card border border-border/50 mb-6"
         >
           <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
             <Target className="w-5 h-5 text-primary" />
             JLPT Level
           </h2>
           <div className="flex flex-wrap gap-3">
             {levels.map((level) => (
               <button
                 key={level}
                 onClick={() => setLevel(level)}
                 className={`px-6 py-3 rounded-xl font-bold text-lg transition-all ${
                   selectedLevel === level
                     ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                     : 'bg-muted text-muted-foreground hover:bg-muted/80'
                 }`}
               >
                 {level}
               </button>
             ))}
           </div>
         </motion.div>
 
         {/* Exam Date */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="bg-card rounded-2xl p-6 shadow-card border border-border/50 mb-6"
         >
           <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
             <Calendar className="w-5 h-5 text-primary" />
             Exam Date
           </h2>
           <Input
             type="date"
             value={localExamDate}
             onChange={(e) => setLocalExamDate(e.target.value)}
             className="max-w-xs"
           />
           <p className="text-sm text-muted-foreground mt-2">
             JLPT exams are held in July and December each year.
           </p>
         </motion.div>
 
         {/* Daily Targets */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="bg-card rounded-2xl p-6 shadow-card border border-border/50 mb-6"
         >
           <h2 className="text-lg font-semibold text-foreground mb-4">Daily Targets</h2>
           <div className="grid gap-4 sm:grid-cols-2">
             <div className="space-y-2">
               <Label htmlFor="studyMinutes">Study Minutes</Label>
               <Input
                 id="studyMinutes"
                 type="number"
                 value={localTarget.studyMinutes}
                 onChange={(e) => setLocalTarget({ ...localTarget, studyMinutes: Number(e.target.value) })}
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="kanji">Kanji Count</Label>
               <Input
                 id="kanji"
                 type="number"
                 value={localTarget.kanji}
                 onChange={(e) => setLocalTarget({ ...localTarget, kanji: Number(e.target.value) })}
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="vocabulary">Vocabulary Count</Label>
               <Input
                 id="vocabulary"
                 type="number"
                 value={localTarget.vocabulary}
                 onChange={(e) => setLocalTarget({ ...localTarget, vocabulary: Number(e.target.value) })}
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="grammar">Grammar Points</Label>
               <Input
                 id="grammar"
                 type="number"
                 value={localTarget.grammar}
                 onChange={(e) => setLocalTarget({ ...localTarget, grammar: Number(e.target.value) })}
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="listeningMinutes">Listening Minutes</Label>
               <Input
                 id="listeningMinutes"
                 type="number"
                 value={localTarget.listeningMinutes}
                 onChange={(e) => setLocalTarget({ ...localTarget, listeningMinutes: Number(e.target.value) })}
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="readingPassages">Reading Passages</Label>
               <Input
                 id="readingPassages"
                 type="number"
                 value={localTarget.readingPassages}
                 onChange={(e) => setLocalTarget({ ...localTarget, readingPassages: Number(e.target.value) })}
               />
             </div>
           </div>
         </motion.div>
 
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
         >
           <Button onClick={handleSave} size="lg" className="w-full">
             <Save className="w-4 h-4 mr-2" />
             Save Targets
           </Button>
         </motion.div>
       </div>
     </Layout>
   );
 };
 
 export default Targets;