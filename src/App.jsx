import { useRecovery } from './context/RecoveryContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import HistoryView from './components/HistoryView';
import EntryForm from './components/EntryForm';
import AuthTerminal from './components/AuthTerminal';
import AnalyticsConsole from './components/AnalyticsConsole';
import UsageAssessmentForm from './components/UsageAssessmentForm';
import { Scene3DBackgroundLite } from './components/Scene3DBackground';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const { currentView, isLoading, user } = useRecovery();
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile for performance optimization
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show loading spinner while Auth state initializes
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-(--bg-void) relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-linear-to-br from-(--bg-void) via-[var(--bg-panel)] to-(--bg-void)" />
        <div className="absolute inset-0 grid-bg" />
        
        <motion.div 
          className="flex flex-col items-center gap-6 relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated Logo */}
          <motion.div
            className="w-20 h-20 flex items-center justify-center relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <div 
              className="absolute inset-0 border-2 border-(--neon-cyan-hex) opacity-50"
              style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
            />
            <div 
              className="w-16 h-16 flex items-center justify-center text-(--neon-cyan-hex) text-2xl font-black"
              style={{ 
                background: 'linear-gradient(135deg, var(--bg-card), var(--bg-void))',
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
              }}
            >
              K
            </div>
          </motion.div>
          
          {/* Loading indicator */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-1 bg-(--bg-muted) overflow-hidden">
              <motion.div
                className="h-full bg-(--neon-cyan-hex)"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: '50%' }}
              />
            </div>
            <motion.span 
              className="hud-label text-(--neon-cyan-hex)"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ESTABLISHING UPLINK...
            </motion.span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Gate access with AuthTerminal
  if (!user) {
    return <AuthTerminal />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'history': return <HistoryView />;
      case 'stats': return (
        <motion.div 
          className="dashboard p-4 md:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="dashboard__header mb-6">
            <h1 className="text-2xl md:text-3xl font-[var(--font-display)] text-white tracking-widest border-l-4 border-(--neon-cyan-hex) pl-4">
              TELEMETRY CONSOLE
            </h1>
            <p className="hud-label text-(--text-secondary) mt-2 pl-4">
              DEEP ANALYSIS // RECOVERY METRICS
            </p>
          </div>
          <AnalyticsConsole />
        </motion.div>
      );
      case 'neural': return (
        <motion.div 
          className="dashboard p-4 md:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <UsageAssessmentForm />
        </motion.div>
      );
      case 'entry': return (
        <motion.div 
          className="dashboard p-4 md:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="dashboard__header mb-6">
            <h1 className="text-2xl md:text-3xl font-[var(--font-display)] text-gradient tracking-widest border-l-4 border-(--neon-cyan-hex) pl-4">
              QUICK LOG
            </h1>
            <p className="hud-label text-(--text-secondary) mt-2 pl-4">
              RECORD PROGRESS // TRACK SETBACKS
            </p>
          </div>
          <div className="hud-card max-w-2xl mx-auto">
            <EntryForm initialType="progress" />
          </div>
        </motion.div>
      );
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app bg-(--bg-void) min-h-screen relative">
      {/* Subtle 3D Background for desktop only */}
      {!isMobile && <Scene3DBackgroundLite />}
      
      <Header />
      
      <main className="main-content relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* HUD Floating Command Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-(--bg-card) border border-(--neon-cyan-hex) text-(--neon-cyan-hex) flex items-center justify-center hover:bg-(--neon-cyan-hex) hover:text-black transition-all duration-300 z-50 group glow-cyan"
        style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%)' }}
        onClick={() => setShowQuickLog(true)}
      >
        <span className="text-2xl font-bold group-hover:rotate-90 transition-transform duration-300">＋</span>
      </motion.button>

      {/* Quick Log Modal */}
      <AnimatePresence>
        {showQuickLog && (
          <motion.div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowQuickLog(false); }}
          >
            <motion.div 
              className="w-full max-w-lg"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <EntryForm onClose={() => setShowQuickLog(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
