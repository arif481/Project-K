import { useRecovery } from './context/RecoveryContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import HistoryView from './components/HistoryView';
import EntryForm from './components/EntryForm';
import AuthTerminal from './components/AuthTerminal';
import { useState } from 'react';

export default function App() {
  const { currentView, isLoading, user } = useRecovery();
  const [showQuickLog, setShowQuickLog] = useState(false);

  // Show loading spinner while Auth state initializes
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black text-[var(--neon-cyan)] font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin"></div>
          <div className="text-xs tracking-widest animate-pulse">ESTABLISHING UPLINK...</div>
        </div>
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
      case 'entry': return (
        <div className="dashboard">
          <div className="dashboard__header">
            <h1 className="dashboard__title text-gradient">Quick Log</h1>
            <p className="dashboard__subtitle">Record your progress or a setback</p>
          </div>
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <EntryForm
              initialType="progress"
              onSubmit={() => {
                // Optional: redirect to history or dashboard after logging
              }}
            />
          </div>
        </div>
      );
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app bg-black min-h-screen">
      <Header />
      <main className="main-content fade-in">
        {renderView()}
      </main>

      {/* HUD Floating Command Button */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 bg-black border border-[var(--neon-cyan)] text-[var(--neon-cyan)] flex items-center justify-center hover:bg-[var(--neon-cyan)] hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.3)] z-50 group"
        style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%)' }}
        onClick={() => setShowQuickLog(true)}
      >
        <span className="text-2xl font-bold group-hover:scale-110 transition-transform">＋</span>
      </button>

      {showQuickLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowQuickLog(false); }}
        >
          <div className="w-full max-w-lg m-4">
            <EntryForm onClose={() => setShowQuickLog(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
