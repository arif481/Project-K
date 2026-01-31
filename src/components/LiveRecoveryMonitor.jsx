// LiveRecoveryMonitor.jsx - Real-Time Recovery Data Stream
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecovery } from '../context/RecoveryContext';
import { HudCard } from './HudComponents';
import { getCombinedTimeline } from '../utils/calculations';

export default function LiveRecoveryMonitor() {
    const { advancedStats, progress, userSettings, quitDates, entries } = useRecovery();
    const [hexLines, setHexLines] = useState([]);
    const [isOnline, setIsOnline] = useState(false);

    // Check if any protocol is active
    useEffect(() => {
        const active = Object.values(quitDates).some(date => !!date);
        setIsOnline(active);
    }, [quitDates]);

    // Real-time Ticker Values
    const [displayMoney, setDisplayMoney] = useState(0);
    const [displayLife, setDisplayLife] = useState(0);

    // Sync with global stats and add micro-interpolation for smooth ticking
    useEffect(() => {
        if (!isOnline) return;

        setDisplayMoney(advancedStats.moneySaved);
        setDisplayLife(advancedStats.lifeRegainedMinutes);

        // Calculate per-second gains based on active protocols
        const cigRate = quitDates.cigarettes ? (userSettings?.costs?.cigarettes || 350) : 0;
        const alcRate = quitDates.alcohol ? (userSettings?.costs?.alcohol || 400) : 0;
        const canRate = quitDates.cannabis ? (userSettings?.costs?.cannabis || 500) : 0;

        const totalDailySave = cigRate + alcRate + canRate;
        const savePerSec = totalDailySave / 86400;

        // Life minutes per second (based on cigarettes primarily - 11 min per cig, 20 per day)
        const lifePerSec = (quitDates.cigarettes ? (11 * 20) / 86400 : 0) +
            (quitDates.cannabis ? (5 * 3) / 86400 : 0) +
            (quitDates.alcohol ? (15 * 4) / 86400 : 0);

        const interval = setInterval(() => {
            setDisplayMoney(prev => prev + (savePerSec / 10));
            setDisplayLife(prev => prev + (lifePerSec / 10));
        }, 100);

        return () => clearInterval(interval);
    }, [advancedStats, isOnline, userSettings, quitDates]);

    // Matrix background hex stream (visual only)
    useEffect(() => {
        if (!isOnline) {
            setHexLines([]);
            return;
        }
        const interval = setInterval(() => {
            const newLine = Array(8).fill(0).map(() =>
                Math.floor(Math.random() * 255).toString(16).toUpperCase().padStart(2, '0')
            ).join(' ');
            setHexLines(prev => [newLine, ...prev.slice(0, 15)]);
        }, 150);
        return () => clearInterval(interval);
    }, [isOnline]);

    // Build real stream data from user entries + milestones
    const streamData = useMemo(() => {
        const logs = [];

        // 1. Add recent user entries (last 5)
        const recentEntries = entries.slice(0, 5);
        for (const entry of recentEntries) {
            const type = entry.type === 'relapse' ? 'warning' :
                entry.type === 'quit' ? 'milestone' : 'info';
            const icon = entry.type === 'relapse' ? '⚠' :
                entry.type === 'quit' ? '🚀' : '✓';
            const substance = entry.substance?.toUpperCase() || 'SYSTEM';

            logs.push({
                id: entry.id || entry.timestamp,
                text: `${icon} [${substance}] ${entry.notes || entry.type?.toUpperCase()}`,
                type,
                timestamp: entry.timestamp || Date.now()
            });
        }

        // 2. Add completed milestones from progress
        for (const [substance, data] of Object.entries(progress)) {
            if (data && data.completedMilestones) {
                const recentMilestones = data.completedMilestones.slice(0, 3);
                for (const m of recentMilestones) {
                    logs.push({
                        id: `${substance}-${m.name}`,
                        text: `🏆 [${substance.toUpperCase()}] ${m.name}`,
                        type: 'milestone',
                        timestamp: m.actualTime || Date.now()
                    });
                }
            }
        }

        // Sort by timestamp (newest first) and limit
        return logs
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 8);
    }, [entries, progress]);

    // Get upcoming milestone for display
    const nextMilestone = useMemo(() => {
        const timeline = getCombinedTimeline(quitDates, entries, 10);
        // Find first upcoming (not completed) milestone
        const upcoming = timeline.find(m => !m.isCompleted);
        return upcoming || null;
    }, [quitDates, entries]);

    // --- OFFLINE STATE ---
    if (!isOnline) {
        return (
            <HudCard title="RECOVERY STREAM" className="h-full flex flex-col items-center justify-center bg-black border border-[var(--border-dim)] opacity-50">
                <div className="text-[var(--text-secondary)] font-mono text-center">
                    <div className="text-2xl mb-2">⚠</div>
                    <div>LINK OFFLINE</div>
                    <div className="text-[10px] mt-2">INITIALIZE A PROTOCOL TO BEGIN DATA STREAM</div>
                </div>
            </HudCard>
        );
    }

    // --- ONLINE STATE ---
    return (
        <HudCard title="ACTIVE RECOVERY STREAM" className="h-full flex flex-col bg-black border border-[var(--neon-green)] relative overflow-hidden group">

            {/* Background Matrix Rain Effect */}
            <div className="absolute inset-0 opacity-10 pointer-events-none select-none font-mono text-[10px] leading-tight text-[var(--neon-green)] overflow-hidden p-2">
                {hexLines.map((line, i) => (
                    <div key={i}>{line}</div>
                ))}
            </div>

            {/* Main Content Layer */}
            <div className="relative z-10 flex flex-col h-full gap-4">

                {/* Status Indicators */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[var(--bg-grid)] p-2 border-l border-[var(--neon-green)]">
                        <div className="text-[9px] text-[var(--text-secondary)] font-mono">ACTIVE PROTOCOLS</div>
                        <div className="flex items-end gap-2">
                            <div className="text-xl font-mono font-bold text-[var(--neon-green)]">
                                {Object.values(quitDates).filter(d => !!d).length}
                            </div>
                            <div className="h-4 w-1 bg-[var(--neon-green)] animate-pulse mb-1" />
                        </div>
                    </div>
                    <div className="bg-[var(--bg-grid)] p-2 border-l border-[var(--neon-cyan)]">
                        <div className="text-[9px] text-[var(--text-secondary)] font-mono">STREAM STATUS</div>
                        <div className="flex items-end gap-2">
                            <div className="text-xl font-mono font-bold text-[var(--neon-cyan)]">LIVE</div>
                            <div className="h-4 w-1 bg-[var(--neon-cyan)] animate-pulse mb-1" />
                        </div>
                    </div>
                </div>

                {/* Live Tickers */}
                <div className="flex flex-col gap-1 border-y border-[var(--border-dim)] py-2 bg-black/50">
                    <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-[var(--text-secondary)]">CAPITAL_SAVED:</span>
                        <span className="text-[var(--neon-green)] tracking-wider">₹{displayMoney.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-[var(--text-secondary)]">LIFE_REGAINED:</span>
                        <span className="text-[var(--neon-cyan)] tracking-wider">+{displayLife.toFixed(1)} MIN</span>
                    </div>
                </div>

                {/* Next Milestone Indicator */}
                {nextMilestone && (
                    <div className="bg-[var(--bg-grid)] p-2 border border-[var(--border-dim)]">
                        <div className="text-[9px] text-[var(--text-secondary)] font-mono mb-1">NEXT MILESTONE</div>
                        <div className="text-xs font-mono text-[var(--neon-yellow)] truncate">
                            ⏱ {nextMilestone.name}
                        </div>
                        <div className="text-[10px] text-[var(--text-secondary)] font-mono">
                            {nextMilestone.timeToEventLabel || 'Soon'}
                        </div>
                    </div>
                )}

                {/* Real Log Output */}
                <div className="flex-1 font-mono text-[10px] flex flex-col overflow-hidden">
                    <div className="text-[9px] text-[var(--text-secondary)] mb-1 border-b border-[var(--border-dim)] pb-1">
                        ACTIVITY LOG
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <AnimatePresence initial={false}>
                            {streamData.length > 0 ? (
                                streamData.map((log) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`mb-1 truncate ${log.type === 'milestone' ? 'text-[var(--neon-yellow)]' :
                                            log.type === 'warning' ? 'text-[var(--neon-magenta)]' :
                                                log.type === 'info' ? 'text-[var(--neon-cyan)]' :
                                                    'text-[var(--neon-green)]'
                                            }`}
                                    >
                                        {log.text}
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-[var(--text-secondary)] text-center py-4">
                                    No activity logged yet.<br />
                                    Use the check-in buttons to log your progress.
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* CRT Scanline Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)50%,rgba(0,0,0,0.1)50%)] bg-[length:100%_4px] pointer-events-none z-20" />
        </HudCard>
    );
}
