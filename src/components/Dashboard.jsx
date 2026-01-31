import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecovery } from '../context/RecoveryContext';
import { HudCard, HudButton, LiveTicker } from './HudComponents';
import CentralMatrix from './CentralMatrix';
import LiveRecoveryMonitor from './LiveRecoveryMonitor';
import EntryForm from './EntryForm';
import SettingsModal from './SettingsModal';
import SubstanceDashboard from './SubstanceDashboard';

export default function Dashboard() {
    const { progress, advancedStats, overallHealth } = useRecovery();
    const [showEntryModal, setShowEntryModal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [modalType, setModalType] = useState('quit');
    const [activeSubstance, setActiveSubstance] = useState(null);
    const [booted, setBooted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setBooted(true), 800);
        return () => clearTimeout(timer);
    }, []);

    const handleAction = (type, substance = null) => {
        setModalType(type);
        setActiveSubstance(substance);
        setShowEntryModal(true);
    };

    const substances = ['cigarettes', 'cannabis', 'alcohol'];

    return (
        <div className="p-4 max-w-[1800px] mx-auto min-h-screen flex flex-col gap-6 relative">

            {/* CONFIG BUTTON */}
            <div className="absolute top-4 right-4 z-50">
                <button onClick={() => setShowSettings(true)} className="text-[var(--neon-cyan)] hover:text-white border border-[var(--neon-cyan)] px-3 py-1 text-[10px] font-mono bg-black/50 backdrop-blur">
                    SYS.CONFIG
                </button>
            </div>

            {/* 1. TOP TELEMETRY DECK */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-4 gap-4"
            >
                <HudCard className="flex flex-col justify-center items-center py-2" animate={booted}>
                    <div className="text-[10px] text-[var(--text-secondary)] tracking-widest mb-1">SYSTEM INTEGRITY</div>
                    <div className="text-2xl font-mono font-bold text-white">{Math.round(overallHealth)}%</div>
                    <div className="w-full h-1 bg-[var(--bg-grid)] mt-2 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--neon-cyan)] transition-all duration-1000" style={{ width: `${overallHealth}%` }} />
                    </div>
                </HudCard>
                <HudCard className="flex flex-col justify-center items-center py-2" animate={booted}>
                    <div className="text-[10px] text-[var(--text-secondary)] tracking-widest mb-1">CAPITAL RESERVES</div>
                    <div className="text-2xl font-mono font-bold text-[var(--neon-green)]">{advancedStats.moneySavedFormatted}</div>
                </HudCard>
                <HudCard className="flex flex-col justify-center items-center py-2" animate={booted}>
                    <div className="text-[10px] text-[var(--text-secondary)] tracking-widest mb-1">CHRONO GAINS</div>
                    <div className="text-2xl font-mono font-bold text-[var(--neon-cyan)]">{advancedStats.lifeRegainedFormatted.split(' ')[0]} <span className="text-xs">HRS</span></div>
                </HudCard>
                <HudCard className="flex flex-col justify-center items-center py-2 relative overflow-hidden" animate={booted}>
                    <div className="absolute inset-0 bg-[var(--neon-magenta)] opacity-5"></div>
                    <div className="text-[10px] text-[var(--text-secondary)] tracking-widest mb-1">OPERATIVE RANK</div>
                    <div className="text-2xl font-mono font-bold text-[var(--neon-magenta)]">{advancedStats.currentRank || 'NOVICE'}</div>
                </HudCard>
            </motion.div>

            {/* 2. MAIN COCKPIT (3-COLUMN LAYOUT) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT: COMMS & LOGS (3 Cols) */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <LiveRecoveryMonitor />
                </div>

                {/* CENTER: THE MATRIX (6 Cols) */}
                <div className="lg:col-span-6 flex flex-col gap-6">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={booted ? { scale: 1, opacity: 1 } : {}}
                        transition={{ delay: 0.2 }}
                        className="flex-1"
                    >
                        <CentralMatrix />
                    </motion.div>
                </div>

                {/* RIGHT: PROTOCOL MODULES (3 Cols) */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                    <div className="text-[10px] font-mono text-[var(--text-secondary)] border-b border-[var(--border-dim)] pb-2 mb-2">ACTIVE PROTOCOLS</div>
                    {substances.map((sub, idx) => (
                        <motion.div
                            key={sub}
                            initial={{ x: 20, opacity: 0 }}
                            animate={booted ? { x: 0, opacity: 1 } : {}}
                            transition={{ delay: 0.4 + (idx * 0.1) }}
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
                        <HudCard title="DATA ENTRY TERMINAL" className="w-full max-w-lg m-4 border-[var(--neon-cyan)] shadow-[0_0_50px_rgba(0,240,255,0.1)]">
                            <EntryForm
                                initialSubstance={activeSubstance}
                                initialType={modalType}
                                onClose={() => setShowEntryModal(false)}
                            />
                        </HudCard>
                    </div>
                )}
                {showSettings && (
                    <SettingsModal onClose={() => setShowSettings(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}
