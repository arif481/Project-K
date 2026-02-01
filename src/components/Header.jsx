import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecovery } from '../context/RecoveryContext';
import { HudButton, HudBadge } from './HudComponents';

export default function Header() {
    const { currentView, setCurrentView, user, logout, overallHealth, rank } = useRecovery();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'COMMAND CENTER', icon: '⌘' },
        { id: 'history', label: 'MISSION LOGS', icon: '📋' },
        { id: 'stats', label: 'TELEMETRY', icon: '📊' }
    ];

    return (
        <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-50 w-full border-b border-[var(--border-dim)] bg-[var(--bg-panel)]/90 backdrop-blur-xl"
        >
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                {/* LOGO AREA */}
                <div className="flex items-center gap-3">
                    <motion.div 
                        className="w-10 h-10 flex items-center justify-center text-black font-bold relative"
                        style={{
                            background: 'linear-gradient(135deg, var(--neon-cyan-hex), var(--neon-green-hex))',
                            clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)"
                        }}
                        whileHover={{ scale: 1.05 }}
                    >
                        <span className="text-lg font-black">K</span>
                        {/* Pulse indicator */}
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[var(--neon-green-hex)] rounded-full animate-pulse shadow-[0_0_10px_var(--neon-green-hex)]"></span>
                    </motion.div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-[0.2em] text-white font-[var(--font-display)]">RECOVERY.OS</span>
                        <span className="text-[9px] text-[var(--neon-cyan-hex)] tracking-widest font-mono">V.3.0.0 // UPLINK ACTIVE</span>
                    </div>
                </div>

                {/* NAVIGATION - Desktop */}
                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setCurrentView(item.id)}
                            className={`px-4 py-2 text-xs font-mono tracking-wider transition-all relative flex items-center gap-2 ${
                                currentView === item.id
                                    ? 'text-[var(--neon-cyan-hex)]'
                                    : 'text-[var(--text-secondary)] hover:text-white'
                            }`}
                        >
                            <span className="text-sm">{item.icon}</span>
                            {item.label}
                            {currentView === item.id && (
                                <motion.div
                                    layoutId="nav-underline"
                                    className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--neon-cyan-hex)]"
                                    style={{ boxShadow: '0 0 10px var(--neon-cyan-hex)' }}
                                />
                            )}
                        </button>
                    ))}
                </nav>

                {/* STATUS & USER INFO */}
                <div className="flex items-center gap-3 md:gap-4">
                    {/* Operator Rank Badge */}
                    {rank && (
                        <HudBadge variant="cyan" className="hidden sm:flex">
                            {rank}
                        </HudBadge>
                    )}

                    {/* System Health Mini Indicator */}
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="hud-label text-[8px]">SYSTEM INTEGRITY</span>
                        <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-[var(--bg-muted)] overflow-hidden" 
                                style={{ clipPath: "polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)" }}
                            >
                                <motion.div 
                                    className="h-full"
                                    style={{ 
                                        background: overallHealth > 70 
                                            ? 'var(--neon-cyan-hex)' 
                                            : overallHealth > 40 
                                                ? 'var(--neon-yellow-hex)' 
                                                : 'var(--neon-magenta-hex)',
                                        boxShadow: `0 0 10px ${overallHealth > 70 
                                            ? 'var(--neon-cyan-hex)' 
                                            : overallHealth > 40 
                                                ? 'var(--neon-yellow-hex)' 
                                                : 'var(--neon-magenta-hex)'}`
                                    }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${overallHealth}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>
                            <span className="text-[10px] text-[var(--neon-cyan-hex)] font-mono font-bold">
                                {Math.round(overallHealth)}%
                            </span>
                        </div>
                    </div>

                    {/* User Info */}
                    {user && (
                        <div className="flex items-center gap-3 border-l border-[var(--border-dim)] pl-3 md:pl-4">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="hud-label text-[8px]">OPERATOR</span>
                                <span className="text-xs text-white font-mono truncate max-w-[80px] md:max-w-[120px]">
                                    {user.displayName || user.email?.split('@')[0] || 'ANON'}
                                </span>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={logout}
                                className="text-[var(--text-secondary)] hover:text-[var(--neon-magenta-hex)] transition-colors p-2 border border-transparent hover:border-[var(--neon-magenta-hex)]/30"
                                title="Terminate Session"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </motion.button>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden text-[var(--neon-cyan-hex)] p-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </motion.button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden border-t border-[var(--border-dim)] overflow-hidden"
                    >
                        <div className="flex flex-col">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setCurrentView(item.id);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`py-4 px-6 text-xs font-mono tracking-wider text-left transition-all flex items-center gap-3 ${
                                        currentView === item.id
                                            ? 'text-[var(--neon-cyan-hex)] bg-[rgba(0,255,255,0.05)] border-l-2 border-[var(--neon-cyan-hex)]'
                                            : 'text-[var(--text-secondary)] border-l-2 border-transparent'
                                    }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                        
                        {/* Mobile User Info */}
                        {user && (
                            <div className="border-t border-[var(--border-dim)] p-4 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="hud-label text-[8px]">OPERATOR</span>
                                    <span className="text-sm text-white font-mono">
                                        {user.displayName || user.email?.split('@')[0] || 'ANON'}
                                    </span>
                                </div>
                                {rank && <HudBadge variant="cyan">{rank}</HudBadge>}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
