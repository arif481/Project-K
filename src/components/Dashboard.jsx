import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecovery } from '../context/RecoveryContext';
import { HudCard, HudButton, LiveTicker } from './HudComponents';
import CentralMatrix from './CentralMatrix';
import LiveRecoveryMonitor from './LiveRecoveryMonitor';
import EntryForm from './EntryForm';
import SettingsModal from './SettingsModal';
import SubstanceDashboard from './SubstanceDashboard';
import NeuralBodyVisualization from './NeuralBodyVisualization';

// Animated stat card component
function StatCard({ label, value, subValue, color, icon, delay = 0, booted }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={booted ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ delay, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="relative group"
        >
            <div className="hud-card p-4 h-full flex flex-col justify-between bg-gradient-to-br from-[rgba(10,15,25,0.8)] to-[rgba(5,10,18,0.9)] hover:from-[rgba(15,22,35,0.85)] transition-all duration-500">
                {/* Animated corner glow on hover */}
                <div className="absolute top-0 left-0 w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 blur-xl" style={{ background: color, opacity: 0.3 }} />
                </div>
                
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono tracking-[0.2em] text-[var(--text-secondary)] uppercase">{label}</span>
                    <span className="text-lg opacity-60">{icon}</span>
                </div>
                
                <div className="flex items-end justify-between">
                    <motion.div 
                        className="text-3xl font-mono font-black tracking-tight"
                        style={{ color }}
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {value}
                    </motion.div>
                    {subValue && (
                        <span className="text-[10px] font-mono text-[var(--text-dim)] mb-1">{subValue}</span>
                    )}
                </div>
                
                {/* Progress indicator line */}
                <div className="mt-3 h-1 bg-[var(--bg-grid)] rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
                        initial={{ width: 0 }}
                        animate={booted ? { width: '100%' } : {}}
                        transition={{ delay: delay + 0.3, duration: 1.5, ease: "easeOut" }}
                    />
                </div>
            </div>
        </motion.div>
    );
}

// Quick action floating button
function QuickActionButton({ onClick, icon, label, color, delay }) {
    return (
        <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.1, boxShadow: `0 0 30px ${color}40` }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[var(--border-dim)] bg-[var(--bg-glass)] backdrop-blur-xl hover:border-opacity-60 transition-all"
            style={{ borderColor: color }}
        >
            <span className="text-2xl">{icon}</span>
            <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color }}>{label}</span>
        </motion.button>
    );
}

export default function Dashboard() {
    const { progress, advancedStats, overallHealth, quitDates, entries, userSettings } = useRecovery();
    const [showEntryModal, setShowEntryModal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [modalType, setModalType] = useState('quit');
    const [activeSubstance, setActiveSubstance] = useState(null);
    const [booted, setBooted] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setBooted(true), 600);
        return () => clearTimeout(timer);
    }, []);

    const handleAction = (type, substance = null) => {
        setModalType(type);
        setActiveSubstance(substance);
        setShowEntryModal(true);
    };

    const substances = ['cigarettes', 'cannabis', 'alcohol'];
    
    // Calculate active protocols count
    const activeProtocols = useMemo(() => {
        return Object.values(quitDates).filter(d => !!d).length;
    }, [quitDates]);
    
    // Calculate total streak days
    const totalStreakDays = useMemo(() => {
        return Object.values(progress).reduce((acc, p) => acc + (p?.streak?.days || 0), 0);
    }, [progress]);

    return (
        <div className="p-4 md:p-6 max-w-[1920px] mx-auto min-h-screen flex flex-col gap-6 relative">
            
            {/* Scanline overlay effect */}
            <div className="scanline-overlay pointer-events-none" />

            {/* CONFIG & QUICK ACTIONS */}
            <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                <motion.button 
                    onClick={() => setShowQuickActions(!showQuickActions)} 
                    className="text-[var(--neon-green)] hover:text-white border border-[var(--neon-green)] px-3 py-1.5 text-[10px] font-mono bg-black/60 backdrop-blur-xl flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <span className="animate-pulse">●</span> QUICK LOG
                </motion.button>
                <motion.button 
                    onClick={() => setShowSettings(true)} 
                    className="text-[var(--neon-cyan)] hover:text-white border border-[var(--neon-cyan)] px-3 py-1.5 text-[10px] font-mono bg-black/60 backdrop-blur-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    ⚙ CONFIG
                </motion.button>
            </div>

            {/* Quick Actions Panel */}
            <AnimatePresence>
                {showQuickActions && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-16 right-4 z-40 flex gap-3 bg-[var(--bg-panel)] p-4 border border-[var(--border-dim)] backdrop-blur-xl"
                    >
                        <QuickActionButton onClick={() => handleAction('log', 'cigarettes')} icon="🚬" label="Log Nicotine" color="var(--neon-cyan)" delay={0.1} />
                        <QuickActionButton onClick={() => handleAction('log', 'cannabis')} icon="🌿" label="Log Cannabis" color="var(--neon-green)" delay={0.15} />
                        <QuickActionButton onClick={() => handleAction('log', 'alcohol')} icon="🍺" label="Log Alcohol" color="var(--neon-magenta)" delay={0.2} />
                        <QuickActionButton onClick={() => handleAction('relapse')} icon="⚠️" label="Report Relapse" color="var(--neon-yellow)" delay={0.25} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 1. TOP TELEMETRY DECK - 5 COLUMN LAYOUT */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                <StatCard 
                    label="System Integrity" 
                    value={`${Math.round(overallHealth)}%`} 
                    subValue="HEALTH SCORE"
                    color="var(--neon-cyan-hex)" 
                    icon="💊"
                    delay={0}
                    booted={booted}
                />
                <StatCard 
                    label="Capital Reserves" 
                    value={advancedStats.moneySavedFormatted} 
                    subValue="SAVED"
                    color="var(--neon-green-hex)" 
                    icon="💰"
                    delay={0.1}
                    booted={booted}
                />
                <StatCard 
                    label="Chrono Gains" 
                    value={advancedStats.lifeRegainedFormatted?.split(' ')[0] || '0'} 
                    subValue={advancedStats.lifeRegainedFormatted?.split(' ')[1] || 'HRS'}
                    color="var(--neon-purple-hex)" 
                    icon="⏱️"
                    delay={0.2}
                    booted={booted}
                />
                <StatCard 
                    label="Total Clean Days" 
                    value={totalStreakDays} 
                    subValue="COMBINED"
                    color="var(--neon-yellow-hex)" 
                    icon="🔥"
                    delay={0.3}
                    booted={booted}
                />
                <StatCard 
                    label="Operative Rank" 
                    value={advancedStats.currentRank || 'INITIATE'} 
                    subValue={`${activeProtocols}/3 ACTIVE`}
                    color="var(--neon-magenta-hex)" 
                    icon="🎖️"
                    delay={0.4}
                    booted={booted}
                />
            </div>

            {/* 2. MAIN COCKPIT (3-COLUMN LAYOUT) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">

                {/* LEFT: LIVE RECOVERY MONITOR (4 Cols) */}
                <motion.div 
                    className="lg:col-span-4 flex flex-col gap-4"
                    initial={{ opacity: 0, x: -30 }}
                    animate={booted ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <LiveRecoveryMonitor />
                    
                    {/* Neural Body Compact Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={booted ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="relative"
                    >
                        <div className="text-[10px] font-mono text-[var(--text-secondary)] border-b border-[var(--border-dim)] pb-2 mb-3 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <span className="text-lg">🧬</span>
                                NEURAL BODY STATUS
                            </span>
                            <span className="text-[var(--neon-cyan)]">LIVE</span>
                        </div>
                        <NeuralBodyVisualization 
                            userProfile={userSettings?.usageProfile} 
                            compact={true} 
                        />
                    </motion.div>
                </motion.div>

                {/* CENTER: THE MATRIX (4 Cols) */}
                <motion.div 
                    className="lg:col-span-4 flex flex-col gap-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={booted ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <CentralMatrix />
                    
                    {/* Mini Stats Row under Matrix */}
                    <div className="grid grid-cols-3 gap-2">
                        {substances.map((sub, idx) => {
                            const isActive = !!quitDates[sub];
                            const days = progress[sub]?.streak?.days || 0;
                            const colors = {
                                cigarettes: 'var(--neon-cyan)',
                                cannabis: 'var(--neon-green)',
                                alcohol: 'var(--neon-magenta)'
                            };
                            const icons = { cigarettes: '🚬', cannabis: '🌿', alcohol: '🍺' };
                            
                            return (
                                <motion.div
                                    key={sub}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={booted ? { opacity: 1, y: 0 } : {}}
                                    transition={{ delay: 0.6 + idx * 0.1 }}
                                    className={`p-3 text-center border ${isActive ? 'border-opacity-100' : 'border-opacity-30 opacity-50'} bg-[var(--bg-grid)]`}
                                    style={{ borderColor: isActive ? colors[sub] : 'var(--border-dim)' }}
                                >
                                    <div className="text-lg mb-1">{icons[sub]}</div>
                                    <div className="text-xl font-mono font-bold" style={{ color: isActive ? colors[sub] : 'var(--text-dim)' }}>
                                        {days}
                                    </div>
                                    <div className="text-[8px] font-mono text-[var(--text-secondary)] uppercase">days</div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* RIGHT: PROTOCOL MODULES (4 Cols) */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <motion.div 
                        className="text-[10px] font-mono text-[var(--text-secondary)] border-b border-[var(--border-dim)] pb-2 flex items-center justify-between"
                        initial={{ opacity: 0 }}
                        animate={booted ? { opacity: 1 } : {}}
                        transition={{ delay: 0.5 }}
                    >
                        <span>ACTIVE PROTOCOLS</span>
                        <span className="text-[var(--neon-cyan)]">{activeProtocols}/3 ONLINE</span>
                    </motion.div>
                    
                    {substances.map((sub, idx) => (
                        <motion.div
                            key={sub}
                            initial={{ opacity: 0, x: 30 }}
                            animate={booted ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 0.5 + (idx * 0.15), duration: 0.5 }}
                        >
                            <SubstanceDashboard
                                substance={sub}
                                onLogEntry={(type, substance) => handleAction(type, substance)}
                                onInitialize={(substance) => handleAction('quit', substance)}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* MODAL OVERLAYS */}
            <AnimatePresence>
                {showEntryModal && (
                    <motion.div 
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                            onClick={() => setShowEntryModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25 }}
                        >
                            <HudCard title="DATA ENTRY TERMINAL" className="w-full max-w-lg relative border-[var(--neon-cyan)] shadow-[0_0_60px_rgba(0,240,255,0.15)]">
                                <EntryForm
                                    initialSubstance={activeSubstance}
                                    initialType={modalType}
                                    onClose={() => setShowEntryModal(false)}
                                />
                            </HudCard>
                        </motion.div>
                    </motion.div>
                )}
                {showSettings && (
                    <SettingsModal onClose={() => setShowSettings(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}
