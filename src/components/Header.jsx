import { motion } from 'framer-motion';
import { useRecovery } from '../context/RecoveryContext';

export default function Header() {
    const { currentView, setCurrentView, user, logout, overallHealth } = useRecovery();

    const navItems = [
        { id: 'dashboard', label: 'COMMAND' },
        { id: 'history', label: 'LOGS' },
        { id: 'stats', label: 'ANALYTICS' }
    ];

    return (
        <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-50 w-full border-b border-[var(--border-dim)] bg-[var(--bg-panel)]/80 backdrop-blur-md"
        >
            <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
                {/* LOGO AREA */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-[var(--neon-cyan)] flex items-center justify-center text-black font-bold relative">
                        K
                        {/* Pulse indicator */}
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--neon-green)] rounded-full animate-pulse"></span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-[0.2em] text-white">RECOVERY.OS</span>
                        <span className="text-[9px] text-[var(--neon-cyan)] tracking-widest">V.2.1.0 // UPLINK SECURED</span>
                    </div>
                </div>

                {/* NAVIGATION */}
                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setCurrentView(item.id)}
                            className={`px-4 py-2 text-xs font-mono tracking-wider transition-all relative ${currentView === item.id
                                    ? 'text-[var(--neon-cyan)]'
                                    : 'text-[var(--text-secondary)] hover:text-white'
                                }`}
                        >
                            {item.label}
                            {currentView === item.id && (
                                <motion.div
                                    layoutId="nav-underline"
                                    className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--neon-cyan)] shadow-[0_0_10px_var(--neon-cyan)]"
                                />
                            )}
                        </button>
                    ))}
                </nav>

                {/* STATUS & USER INFO */}
                <div className="flex items-center gap-4">
                    {/* System Health Mini Indicator */}
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider">INTEGRITY</span>
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-1 bg-[var(--bg-grid)] rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-[var(--neon-cyan)] transition-all duration-500"
                                    style={{ width: `${overallHealth}%` }}
                                />
                            </div>
                            <span className="text-[10px] text-[var(--neon-cyan)] font-mono">{Math.round(overallHealth)}%</span>
                        </div>
                    </div>

                    {/* User Info */}
                    {user && (
                        <div className="flex items-center gap-3 border-l border-[var(--border-dim)] pl-4">
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider">OPERATOR</span>
                                <span className="text-xs text-white font-mono truncate max-w-[100px]">
                                    {user.displayName || user.email?.split('@')[0] || 'ANON'}
                                </span>
                            </div>
                            <button
                                onClick={logout}
                                className="text-[var(--text-secondary)] hover:text-[var(--neon-magenta)] transition-colors p-2"
                                title="Terminate Session"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden text-[var(--neon-cyan)]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden border-t border-[var(--border-dim)]">
                <div className="flex justify-around">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setCurrentView(item.id)}
                            className={`flex-1 py-3 text-[10px] font-mono tracking-wider text-center transition-all ${
                                currentView === item.id
                                    ? 'text-[var(--neon-cyan)] bg-[rgba(0,240,255,0.05)] border-b-2 border-[var(--neon-cyan)]'
                                    : 'text-[var(--text-secondary)]'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>
        </motion.header>
    );
}
