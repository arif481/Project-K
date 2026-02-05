import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecovery } from '../context/RecoveryContext';
import { HudButton, HudBadge } from './HudComponents';

export default function Header() {
    const { currentView, setCurrentView, user, logout, overallHealth, advancedStats } = useRecovery();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isScrolled, setIsScrolled] = useState(false);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Handle scroll for header background
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { id: 'dashboard', label: 'COMMAND CENTER', icon: '⌘', shortLabel: 'CMD' },
        { id: 'neural', label: 'NEURAL MAP', icon: '🧬', shortLabel: 'NEURAL' },
        { id: 'history', label: 'MISSION LOGS', icon: '📋', shortLabel: 'LOGS' },
        { id: 'stats', label: 'TELEMETRY', icon: '📊', shortLabel: 'STATS' }
    ];

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
                isScrolled 
                    ? 'border-(--border-bright) bg-[rgba(3,5,8,0.95)] backdrop-blur-xl shadow-lg shadow-black/20' 
                    : 'border-(--border-dim) bg-(--bg-panel)/80 backdrop-blur-xl'
            }`}
        >
            <div className="max-w-[1920px] mx-auto px-4 md:px-6">
                <div className="h-16 flex items-center justify-between">
                    
                    {/* LOGO AREA */}
                    <div className="flex items-center gap-4">
                        <motion.div 
                            className="relative w-11 h-11 flex items-center justify-center cursor-pointer group"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCurrentView('dashboard')}
                        >
                            {/* Animated background */}
                            <motion.div
                                className="absolute inset-0 rounded-lg"
                                style={{
                                    background: 'linear-gradient(135deg, var(--neon-cyan-hex), var(--neon-purple-hex))',
                                }}
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            />
                            <div 
                                className="absolute inset-[2px] bg-(--bg-void) rounded-md flex items-center justify-center"
                            >
                                <span className="text-lg font-black text-gradient">K</span>
                            </div>
                            
                            {/* Pulse indicator */}
                            <motion.span 
                                className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-(--neon-green-hex) rounded-full"
                                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </motion.div>
                        
                        <div className="flex flex-col">
                            <span className="text-sm font-bold tracking-[0.25em] text-white">RECOVERY.OS</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] text-(--neon-cyan-hex) tracking-widest font-mono">V.4.0.0</span>
                                <span className="w-1 h-1 bg-(--neon-green-hex) rounded-full animate-pulse" />
                                <span className="text-[9px] text-(--neon-green-hex) font-mono">ONLINE</span>
                            </div>
                        </div>
                    </div>

                    {/* CENTER: NAVIGATION */}
                    <nav className="hidden md:flex items-center bg-(--bg-grid) rounded-lg p-1">
                        {navItems.map((item, idx) => (
                            <motion.button
                                key={item.id}
                                onClick={() => setCurrentView(item.id)}
                                className={`relative px-5 py-2 text-xs font-mono tracking-wider transition-all flex items-center gap-2 rounded-md ${
                                    currentView === item.id
                                        ? 'text-(--bg-void)'
                                        : 'text-(--text-secondary) hover:text-white'
                                }`}
                                whileHover={{ scale: currentView !== item.id ? 1.02 : 1 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {currentView === item.id && (
                                    <motion.div
                                        layoutId="nav-bg"
                                        className="absolute inset-0 bg-linear-to-r from-(--neon-cyan-hex) to-(--neon-green-hex) rounded-md"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 text-sm">{item.icon}</span>
                                <span className="relative z-10 hidden lg:inline">{item.label}</span>
                                <span className="relative z-10 lg:hidden">{item.shortLabel}</span>
                            </motion.button>
                        ))}
                    </nav>

                    {/* RIGHT: STATUS & USER */}
                    <div className="flex items-center gap-3 md:gap-5">
                        
                        {/* Live Clock */}
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-xs font-mono text-(--neon-cyan-hex) tabular-nums tracking-wider">
                                {formatTime(currentTime)}
                            </span>
                            <span className="text-[9px] font-mono text-(--text-dim)">
                                {formatDate(currentTime)}
                            </span>
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block w-px h-8 bg-(--border-dim)" />

                        {/* System Health */}
                        <div className="hidden md:flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono text-(--text-dim) uppercase">SYS</span>
                                <span className="text-xs font-mono font-bold" style={{ 
                                    color: overallHealth > 70 ? 'var(--neon-green-hex)' : overallHealth > 40 ? 'var(--neon-yellow-hex)' : 'var(--neon-magenta-hex)'
                                }}>
                                    {Math.round(overallHealth)}%
                                </span>
                            </div>
                            <div className="w-24 h-1.5 bg-(--bg-muted) overflow-hidden rounded-full">
                                <motion.div 
                                    className="h-full rounded-full"
                                    style={{ 
                                        background: overallHealth > 70 
                                            ? 'linear-gradient(90deg, var(--neon-cyan-hex), var(--neon-green-hex))' 
                                            : overallHealth > 40 
                                                ? 'linear-gradient(90deg, var(--neon-yellow-hex), var(--neon-orange-hex))'
                                                : 'linear-gradient(90deg, var(--neon-magenta-hex), var(--neon-orange-hex))'
                                    }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${overallHealth}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </div>
                        </div>

                        {/* Rank Badge */}
                        {advancedStats?.currentRank && (
                            <motion.div 
                                className="hidden lg:block"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <div className="hud-badge hud-badge--purple">
                                    <span className="text-xs">🎖️</span>
                                    {advancedStats.currentRank}
                                </div>
                            </motion.div>
                        )}

                        {/* Divider */}
                        <div className="hidden md:block w-px h-8 bg-(--border-dim)" />

                        {/* User Info */}
                        {user && (
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-[9px] font-mono text-(--text-dim) uppercase">OPERATOR</span>
                                    <span className="text-xs text-white font-mono truncate max-w-[100px]">
                                        {user.displayName || user.email?.split('@')[0] || 'ANON'}
                                    </span>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, borderColor: 'var(--neon-magenta-hex)' }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={logout}
                                    className="p-2 text-(--text-secondary) hover:text-(--neon-magenta-hex) border border-(--border-dim) hover:border-(--neon-magenta-hex) transition-all rounded"
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
                            className="md:hidden text-(--neon-cyan-hex) p-2 border border-(--border-dim) rounded"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden border-t border-(--border-dim) overflow-hidden bg-(--bg-panel)"
                    >
                        <div className="flex flex-col p-2">
                            {navItems.map((item, idx) => (
                                <motion.button
                                    key={item.id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => {
                                        setCurrentView(item.id);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`py-4 px-4 text-sm font-mono tracking-wider text-left transition-all flex items-center gap-4 rounded-lg ${
                                        currentView === item.id
                                            ? 'text-(--bg-void) bg-linear-to-r from-(--neon-cyan-hex) to-(--neon-green-hex)'
                                            : 'text-(--text-secondary) hover:bg-(--bg-grid)'
                                    }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span>{item.label}</span>
                                </motion.button>
                            ))}
                        </div>
                        
                        {/* Mobile Stats Row */}
                        <div className="border-t border-(--border-dim) p-4 grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-mono text-(--text-dim)">SYSTEM HEALTH</span>
                                <span className="text-lg font-mono font-bold text-(--neon-cyan-hex)">{Math.round(overallHealth)}%</span>
                            </div>
                            {advancedStats?.currentRank && (
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-mono text-(--text-dim)">RANK</span>
                                    <span className="text-lg font-mono font-bold text-(--neon-purple-hex)">{advancedStats.currentRank}</span>
                                </div>
                            )}
                        </div>
                        
                        {/* Mobile User Info */}
                        {user && (
                            <div className="border-t border-(--border-dim) p-4 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-mono text-(--text-dim)">OPERATOR</span>
                                    <span className="text-sm text-white font-mono">
                                        {user.displayName || user.email?.split('@')[0] || 'ANON'}
                                    </span>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={logout}
                                    className="px-4 py-2 text-(--neon-magenta-hex) border border-(--neon-magenta-hex) text-xs font-mono"
                                >
                                    LOGOUT
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
