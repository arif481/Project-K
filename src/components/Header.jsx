import { motion } from 'framer-motion';
import { useRecovery } from '../context/RecoveryContext';

export default function Header() {
    const { currentView, setCurrentView } = useRecovery();

    return (
        <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-50 w-full border-b border-[var(--border-dim)] bg-[var(--bg-panel)]/80 backdrop-blur-md"
        >
            <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
                {/* LOGO AREA */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-[var(--neon-cyan)] flex items-center justify-center text-black font-bold">
                        K
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-[0.2em] text-white">RECOVERY.OS</span>
                        <span className="text-[9px] text-[var(--neon-cyan)] tracking-widest">V.2.0.4 // TERMINAL ACTIVE</span>
                    </div>
                </div>

                {/* NAVIGATION */}
                <nav className="hidden md:flex items-center gap-1">
                    {['dashboard', 'history', 'stats'].map(view => (
                        <button
                            key={view}
                            onClick={() => setCurrentView(view)}
                            className={`px-4 py-2 text-xs font-mono tracking-wider transition-all relative ${currentView === view
                                    ? 'text-[var(--neon-cyan)]'
                                    : 'text-[var(--text-secondary)] hover:text-white'
                                }`}
                        >
                            {view.toUpperCase()}
                            {currentView === view && (
                                <motion.div
                                    layoutId="nav-underline"
                                    className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--neon-cyan)] shadow-[0_0_10px_var(--neon-cyan)]"
                                />
                            )}
                        </button>
                    ))}
                </nav>

                {/* STATUS INDICATORS */}
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-[var(--text-secondary)]">NET STATUS</span>
                        <span className="text-xs text-[var(--neon-green)] flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[var(--neon-green)] animate-pulse" /> ONLINE
                        </span>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
