import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
export type Section = 'kanji' | 'vocabulary' | 'grammar' | 'listening' | 'reading';

export interface DailyTarget {
  studyMinutes: number;
  kanji: number;
  vocabulary: number;
  grammar: number;
  listeningMinutes: number;
  readingPassages: number;
}

export interface StudyProgress {
  date: string;
  kanji: number;
  vocabulary: number;
  grammar: number;
  listeningMinutes: number;
  readingPassages: number;
  totalMinutes: number;
}

export interface TestScore {
  date: string;
  section: Section;
  correct: number;
  total: number;
  score: number;
}

export interface LastAction {
  type: 'log';
  section: Section;
  amount: number;
  previousProgress: StudyProgress | null;
  timestamp: number;
}

export interface AppState {
  // User settings
  selectedLevel: JLPTLevel | null;
  examDate: string | null;
  dailyTarget: DailyTarget;
  
  // Progress data
  studyProgress: StudyProgress[];
  testScores: TestScore[];
  currentStreak: number;
  
  // Undo tracking
  lastAction: LastAction | null;
  
  // Actions
  setLevel: (level: JLPTLevel) => void;
  setExamDate: (date: string) => void;
  setDailyTarget: (target: DailyTarget) => void;
  addStudyProgress: (progress: StudyProgress) => void;
  addTestScore: (score: TestScore) => void;
  getTodayProgress: () => StudyProgress | undefined;
  getDaysUntilExam: () => number | null;
  logStudy: (section: Section, amount: number) => void;
  undoLastAction: () => boolean;
  clearLastAction: () => void;
}
 
 const defaultDailyTarget: DailyTarget = {
   studyMinutes: 60,
   kanji: 5,
   vocabulary: 20,
   grammar: 3,
   listeningMinutes: 15,
   readingPassages: 2,
 };
 
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      selectedLevel: null,
      examDate: null,
      dailyTarget: defaultDailyTarget,
      studyProgress: [],
      testScores: [],
      currentStreak: 0,
      lastAction: null,
       
       setLevel: (level) => set({ selectedLevel: level }),
       setExamDate: (date) => set({ examDate: date }),
       setDailyTarget: (target) => set({ dailyTarget: target }),
       
       addStudyProgress: (progress) => set((state) => ({
         studyProgress: [...state.studyProgress, progress],
       })),
       
       addTestScore: (score) => set((state) => ({
         testScores: [...state.testScores, score],
       })),
       
       getTodayProgress: () => {
         const today = new Date().toISOString().split('T')[0];
         return get().studyProgress.find((p) => p.date === today);
       },
       
       getDaysUntilExam: () => {
         const examDate = get().examDate;
         if (!examDate) return null;
         const diff = new Date(examDate).getTime() - Date.now();
         return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
       },
      
      logStudy: (section: Section, amount: number) => {
        const today = new Date().toISOString().split('T')[0];
        const { studyProgress } = get();
        const todayIndex = studyProgress.findIndex((p) => p.date === today);
        
        // Store previous state for undo
        const previousProgress = todayIndex >= 0 ? { ...studyProgress[todayIndex] } : null;
        
        if (todayIndex >= 0) {
          // Update existing entry
          const updated = [...studyProgress];
          const current = { ...updated[todayIndex] };
          
          switch (section) {
            case 'kanji':
              current.kanji += amount;
              current.totalMinutes += amount * 2;
              break;
            case 'vocabulary':
              current.vocabulary += amount;
              current.totalMinutes += Math.ceil(amount * 0.5);
              break;
            case 'grammar':
              current.grammar += amount;
              current.totalMinutes += amount * 5;
              break;
            case 'listening':
              current.listeningMinutes += amount;
              current.totalMinutes += amount;
              break;
            case 'reading':
              current.readingPassages += amount;
              current.totalMinutes += amount * 10;
              break;
          }
          
          updated[todayIndex] = current;
          set({ 
            studyProgress: updated,
            lastAction: {
              type: 'log',
              section,
              amount,
              previousProgress,
              timestamp: Date.now(),
            },
          });
        } else {
          const newProgress: StudyProgress = {
            date: today,
            kanji: section === 'kanji' ? amount : 0,
            vocabulary: section === 'vocabulary' ? amount : 0,
            grammar: section === 'grammar' ? amount : 0,
            listeningMinutes: section === 'listening' ? amount : 0,
            readingPassages: section === 'reading' ? amount : 0,
            totalMinutes: section === 'listening' ? amount : 
                          section === 'kanji' ? amount * 2 :
                          section === 'vocabulary' ? Math.ceil(amount * 0.5) :
                          section === 'grammar' ? amount * 5 :
                          amount * 10,
          };
          
          set({ 
            studyProgress: [...studyProgress, newProgress],
            lastAction: {
              type: 'log',
              section,
              amount,
              previousProgress: null,
              timestamp: Date.now(),
            },
          });
        }
      },
      
      undoLastAction: () => {
        const { lastAction, studyProgress } = get();
        if (!lastAction || lastAction.type !== 'log') return false;
        
        // Check if undo is within 5 minutes
        if (Date.now() - lastAction.timestamp > 5 * 60 * 1000) return false;
        
        const today = new Date().toISOString().split('T')[0];
        const todayIndex = studyProgress.findIndex((p) => p.date === today);
        
        if (todayIndex < 0) return false;
        
        if (lastAction.previousProgress) {
          // Restore previous state
          const updated = [...studyProgress];
          updated[todayIndex] = lastAction.previousProgress;
          set({ studyProgress: updated, lastAction: null });
        } else {
          // Remove today's entry entirely (it was newly created)
          set({ 
            studyProgress: studyProgress.filter((_, i) => i !== todayIndex),
            lastAction: null,
          });
        }
        
        return true;
      },
      
      clearLastAction: () => set({ lastAction: null }),
    }),
    {
      name: 'michi-shirube-storage',
    }
  )
);