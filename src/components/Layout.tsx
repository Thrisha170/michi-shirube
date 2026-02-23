 import { ReactNode } from 'react';
 import { Header } from './Header';
 import { Sidebar } from './Sidebar';
 import { BottomNav } from './BottomNav';
 
 interface LayoutProps {
   children: ReactNode;
 }
 
 export const Layout = ({ children }: LayoutProps) => {
   return (
     <div className="min-h-screen flex w-full">
       <Sidebar />
       <div className="flex-1 flex flex-col">
         <div className="md:hidden">
           <Header />
         </div>
         <main className="flex-1 pb-20 md:pb-0">
           {children}
         </main>
         <BottomNav />
       </div>
     </div>
   );
 };