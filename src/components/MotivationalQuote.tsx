 import { motion } from 'framer-motion';
 import { Sparkles } from 'lucide-react';
 
 const quotes = [
   { jp: '七転び八起き', en: 'Fall seven times, get up eight.' },
   { jp: '一歩一歩', en: 'One step at a time.' },
   { jp: '継続は力なり', en: 'Persistence is power.' },
   { jp: '千里の道も一歩から', en: 'A journey of a thousand miles begins with a single step.' },
   { jp: '努力は必ず報われる', en: 'Effort will always be rewarded.' },
 ];
 
 export const MotivationalQuote = () => {
   const quote = quotes[Math.floor(Math.random() * quotes.length)];
 
   return (
     <motion.div
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       transition={{ delay: 0.3 }}
       className="bg-accent/20 rounded-2xl p-5 text-center border border-accent/30"
     >
       <Sparkles className="w-5 h-5 text-accent mx-auto mb-3" />
       <p className="text-xl font-display text-foreground mb-2">{quote.jp}</p>
       <p className="text-sm text-muted-foreground italic">{quote.en}</p>
     </motion.div>
   );
 };