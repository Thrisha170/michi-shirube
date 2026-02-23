 import { motion } from 'framer-motion';
 import { Home, BookOpen, BarChart3, Target, User, Languages, BookA, MessageSquare, Headphones, FileText } from 'lucide-react';
 import { NavLink } from '@/components/NavLink';
 import { useStore } from '@/lib/store';
 import logo from '@/assets/logo.png';
 
 const mainNav = [
   { path: '/', icon: Home, label: 'Dashboard', labelJp: 'ダッシュボード' },
   { path: '/study', icon: BookOpen, label: 'Study', labelJp: '学習' },
   { path: '/analytics', icon: BarChart3, label: 'Analytics', labelJp: '分析' },
   { path: '/targets', icon: Target, label: 'Targets', labelJp: '目標' },
 ];
 
 const sectionNav = [
   { path: '/kanji', icon: Languages, label: 'Kanji', labelJp: '漢字', color: 'hsl(var(--kanji))' },
   { path: '/vocabulary', icon: BookA, label: 'Vocabulary', labelJp: '語彙', color: 'hsl(var(--vocabulary))' },
   { path: '/grammar', icon: MessageSquare, label: 'Grammar', labelJp: '文法', color: 'hsl(var(--grammar))' },
   { path: '/listening', icon: Headphones, label: 'Listening', labelJp: '聴解', color: 'hsl(var(--listening))' },
   { path: '/reading', icon: FileText, label: 'Reading', labelJp: '読解', color: 'hsl(var(--reading))' },
 ];
 
 export const Sidebar = () => {
   const { selectedLevel } = useStore();
 
   return (
     <motion.aside
       initial={{ x: -100, opacity: 0 }}
       animate={{ x: 0, opacity: 1 }}
       className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-sidebar border-r border-sidebar-border"
     >
       {/* Logo */}
       <div className="p-6 border-b border-sidebar-border">
         <div className="flex items-center gap-3">
           <img src={logo} alt="Michi Shirube" className="w-12 h-12 object-contain" />
           <div>
             <h1 className="text-xl font-bold text-sidebar-foreground font-display">道標</h1>
             <p className="text-xs text-muted-foreground">Michi Shirube</p>
           </div>
         </div>
         {selectedLevel && (
           <div className="mt-4 bg-sidebar-accent rounded-xl p-3 text-center">
             <span className="text-2xl font-bold text-primary">{selectedLevel}</span>
             <p className="text-xs text-muted-foreground">Current Level</p>
           </div>
         )}
       </div>
 
       {/* Main Navigation */}
       <div className="flex-1 overflow-y-auto p-4">
         <div className="mb-6">
           <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">
             Navigation
           </p>
           <nav className="space-y-1">
             {mainNav.map((item) => (
               <NavLink
                 key={item.path}
                 to={item.path}
                 end={item.path === '/'}
                 className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                 activeClassName="bg-sidebar-accent text-primary font-medium"
               >
                 <item.icon className="w-5 h-5" />
                 <div>
                   <span className="text-sm">{item.label}</span>
                   <span className="text-[10px] text-muted-foreground ml-2">{item.labelJp}</span>
                 </div>
               </NavLink>
             ))}
           </nav>
         </div>
 
         {/* Section Navigation */}
         <div>
           <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">
             Sections
           </p>
           <nav className="space-y-1">
             {sectionNav.map((item) => (
               <NavLink
                 key={item.path}
                 to={item.path}
                 className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent transition-colors group"
                 activeClassName="bg-sidebar-accent font-medium"
               >
                 <div
                   className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                   style={{ backgroundColor: `${item.color}20` }}
                 >
                   <item.icon className="w-4 h-4" style={{ color: item.color }} />
                 </div>
                 <div>
                   <span className="text-sm">{item.label}</span>
                   <span className="text-[10px] text-muted-foreground ml-2">{item.labelJp}</span>
                 </div>
               </NavLink>
             ))}
           </nav>
         </div>
       </div>
 
       {/* Footer */}
       <div className="p-4 border-t border-sidebar-border">
         <NavLink
           to="/profile"
           className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
           activeClassName="bg-sidebar-accent text-primary font-medium"
         >
           <User className="w-5 h-5" />
           <span className="text-sm">Profile</span>
         </NavLink>
       </div>
     </motion.aside>
   );
 };