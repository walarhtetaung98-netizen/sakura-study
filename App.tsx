import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { QuizCard } from './components/QuizCard';
import { StudyCard } from './components/StudyCard';
import { MockTestCard } from './components/MockTestCard';
import { Button } from './components/Button';
import { JLPTLevel, QuizType, UserStats, AppMode } from './types';
import { GraduationCap, ArrowLeft, BookOpen, PenTool, Timer, Clock } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'practice'>('dashboard');
  const [appMode, setAppMode] = useState<AppMode>('quiz'); // Default to quiz
  const [config, setConfig] = useState<{ level: JLPTLevel; type?: QuizType; mockVariant?: 'quick' | 'full' } | null>(null);
  
  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Persist stats in localStorage
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('sakuraStats');
    return saved ? JSON.parse(saved) : {
      totalAnswered: 0,
      correctAnswers: 0,
      streak: 1,
      levelProgress: { [JLPTLevel.N5]: 10, [JLPTLevel.N4]: 0 },
      dailyActivity: []
    };
  });

  useEffect(() => {
    localStorage.setItem('sakuraStats', JSON.stringify(stats));
  }, [stats]);

  const startPractice = (level: JLPTLevel, type?: QuizType) => {
    setConfig({ level, type });
    setView('practice');
  };

  const startMock = (level: JLPTLevel, variant: 'quick' | 'full') => {
    setConfig({ level, mockVariant: variant });
    setView('practice');
  };

  const handleQuizComplete = (correct: number, total: number) => {
    // Update stats
    setStats(prev => {
      const accuracy = correct / total;
      const levelKey = config!.level;
      const currentLevelScore = prev.levelProgress[levelKey];
      
      const newLevelScore = Math.min(100, currentLevelScore + (accuracy * 5));

      const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
      const activityIndex = prev.dailyActivity.findIndex(d => d.date === today);
      const newActivity = [...prev.dailyActivity];
      
      if (activityIndex >= 0) {
        newActivity[activityIndex].count += total;
      } else {
        newActivity.push({ date: today, count: total });
        if (newActivity.length > 7) newActivity.shift();
      }

      return {
        ...prev,
        totalAnswered: prev.totalAnswered + total,
        correctAnswers: prev.correctAnswers + correct,
        levelProgress: {
          ...prev.levelProgress,
          [levelKey]: newLevelScore
        },
        dailyActivity: newActivity
      };
    });
    
    if (appMode !== 'mock') {
        setConfig(null); // Return to selection only if not mock (Mock has its own results view)
    }
  };

  return (
    <div className="min-h-screen bg-sakura-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Header 
        currentView={view} 
        onNavigate={(v) => { setView(v); setConfig(null); }} 
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      <main className="container mx-auto px-4 py-8">
        {view === 'dashboard' ? (
          <div className="animate-fade-in-up">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 font-japanese">
                こんにちは! Let's study.
              </h2>
              <p className="text-gray-500 dark:text-gray-400">Your daily progress is looking great.</p>
            </div>
            
            <Dashboard stats={stats} isDarkMode={darkMode} />
            
            <div className="mt-8 flex justify-center">
               <Button size="lg" onClick={() => setView('practice')} className="shadow-lg shadow-sakura-200/50 dark:shadow-none">
                 Start Learning
               </Button>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            {!config ? (
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-4">
                     <Button variant="ghost" onClick={() => setView('dashboard')}>
                      <ArrowLeft size={20} /> Back
                    </Button>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Choose your path</h2>
                  </div>

                  {/* Mode Toggle */}
                  <div className="bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-wrap justify-center gap-1">
                    <button
                      onClick={() => setAppMode('study')}
                      className={`px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${appMode === 'study' ? 'bg-sakura-500 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                    >
                      <BookOpen size={16} /> Study
                    </button>
                    <button
                      onClick={() => setAppMode('quiz')}
                      className={`px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${appMode === 'quiz' ? 'bg-sakura-500 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                    >
                      <PenTool size={16} /> Quiz
                    </button>
                    <button
                      onClick={() => setAppMode('mock')}
                      className={`px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${appMode === 'mock' ? 'bg-gray-800 dark:bg-slate-700 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                    >
                      <Timer size={16} /> Mock Test
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* N5 Section */}
                  <div className={`bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border transition-shadow hover:shadow-md ${appMode === 'mock' ? 'border-gray-200 dark:border-slate-700' : 'border-pink-100 dark:border-slate-700'}`}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`p-3 rounded-xl ${appMode === 'mock' ? 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300' : 'bg-bamboo-50 dark:bg-slate-700 text-bamboo-700 dark:text-bamboo-400'}`}>
                        <GraduationCap size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">JLPT N5</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Beginner Level</p>
                      </div>
                    </div>
                    
                    {appMode === 'mock' ? (
                       <div className="flex flex-col gap-3">
                         <Button className="w-full bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700 flex justify-between items-center px-4 py-4" onClick={() => startMock(JLPTLevel.N5, 'quick')}>
                           <span className="font-bold">Quick Mock</span>
                           <span className="text-xs bg-gray-100 dark:bg-slate-900 px-2 py-1 rounded text-gray-500">15 mins</span>
                         </Button>
                         <p className="text-xs text-center text-gray-400 mt-2">Simulates real exam environment</p>
                       </div>
                    ) : (
                      <div className="space-y-3">
                        <Button variant="secondary" className="w-full justify-between group" onClick={() => startPractice(JLPTLevel.N5, QuizType.VOCABULARY)}>
                          Vocabulary <span className="text-gray-300 dark:text-slate-600 group-hover:text-sakura-400">→</span>
                        </Button>
                        <Button variant="secondary" className="w-full justify-between group" onClick={() => startPractice(JLPTLevel.N5, QuizType.KANJI)}>
                          Kanji <span className="text-gray-300 dark:text-slate-600 group-hover:text-sakura-400">→</span>
                        </Button>
                        <Button variant="secondary" className="w-full justify-between group" onClick={() => startPractice(JLPTLevel.N5, QuizType.GRAMMAR)}>
                          Grammar <span className="text-gray-300 dark:text-slate-600 group-hover:text-sakura-400">→</span>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* N4 Section */}
                  <div className={`bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border transition-shadow hover:shadow-md ${appMode === 'mock' ? 'border-gray-200 dark:border-slate-700' : 'border-pink-100 dark:border-slate-700'}`}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`p-3 rounded-xl ${appMode === 'mock' ? 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300' : 'bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400'}`}>
                        <GraduationCap size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">JLPT N4</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Upper Beginner</p>
                      </div>
                    </div>
                    
                    {appMode === 'mock' ? (
                       <div className="flex flex-col gap-3">
                         <Button className="w-full bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700 flex justify-between items-center px-4 py-4" onClick={() => startMock(JLPTLevel.N4, 'quick')}>
                           <span className="font-bold">Quick Mock</span>
                           <span className="text-xs bg-gray-100 dark:bg-slate-900 px-2 py-1 rounded text-gray-500">15 mins</span>
                         </Button>
                         <p className="text-xs text-center text-gray-400 mt-2">Simulates real exam environment</p>
                       </div>
                    ) : (
                      <div className="space-y-3">
                        <Button variant="secondary" className="w-full justify-between group" onClick={() => startPractice(JLPTLevel.N4, QuizType.VOCABULARY)}>
                          Vocabulary <span className="text-gray-300 dark:text-slate-600 group-hover:text-indigo-400">→</span>
                        </Button>
                        <Button variant="secondary" className="w-full justify-between group" onClick={() => startPractice(JLPTLevel.N4, QuizType.KANJI)}>
                          Kanji <span className="text-gray-300 dark:text-slate-600 group-hover:text-indigo-400">→</span>
                        </Button>
                        <Button variant="secondary" className="w-full justify-between group" onClick={() => startPractice(JLPTLevel.N4, QuizType.GRAMMAR)}>
                          Grammar <span className="text-gray-300 dark:text-slate-600 group-hover:text-indigo-400">→</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                 <div className="mb-6 flex justify-between items-center max-w-2xl mx-auto">
                    <Button variant="ghost" onClick={() => setConfig(null)} className="text-gray-500 dark:text-gray-400">
                      <ArrowLeft size={18} className="mr-2"/> End {appMode === 'study' ? 'Session' : appMode === 'mock' ? 'Exam' : 'Quiz'}
                    </Button>
                 </div>
                 
                 {appMode === 'mock' ? (
                    <MockTestCard 
                      level={config.level} 
                      variant={config.mockVariant || 'quick'}
                      onComplete={handleQuizComplete}
                      onExit={() => setConfig(null)}
                    />
                 ) : appMode === 'quiz' ? (
                   <QuizCard 
                      level={config.level} 
                      type={config.type!} 
                      onComplete={handleQuizComplete} 
                    />
                 ) : (
                   <StudyCard 
                      level={config.level} 
                      type={config.type!} 
                      onExit={() => setConfig(null)}
                   />
                 )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;