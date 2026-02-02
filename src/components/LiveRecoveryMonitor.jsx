// LiveRecoveryMonitor.jsx - Real-Time Recovery Data Stream v4.0
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecovery } from '../context/RecoveryContext';
import { HudCard } from './HudComponents';
import { getCombinedTimeline } from '../utils/calculations';

// Animated wave component for visual effect
const WaveIndicator = ({ active, color }) => (
    <div className="flex items-center gap-0.5 h-4">
        {[...Array(5)].map((_, i) => (
            <motion.div
                key={i}
                className="w-0.5 rounded-full"
                style={{ backgroundColor: color }}
                animate={active ? {
                    height: ['40%', '100%', '40%'],
                } : { height: '20%' }}
                transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeInOut'
                }}
            />
        ))}
    </div>
);

// Circular mini indicator
const StatusOrb = ({ status, size = 8 }) => {
    const colors = {
        online: '#00FF88',
        warning: '#FFE600',
        offline: '#FF0064',
        processing: '#00F0FF'
    };
    
    return (
        <div className="relative" style={{ width: size, height: size }}>
            <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: colors[status] }}
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            <div 
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: colors[status] }}
            />
        </div>
    );
};

// Animated number ticker
const AnimatedValue = ({ value, prefix = '', suffix = '', decimals = 2, color }) => {
    const [display, setDisplay] = useState(value);
    
    useEffect(() => {
        const duration = 300;
        const start = display;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(start + (value - start) * eased);
            
            if (progress < 1) requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }, [value]);
    
    return (
        <span style={{ color }} className="font-mono font-bold">
            {prefix}{display.toFixed(decimals)}{suffix}
        </span>
    );
};

export default function LiveRecoveryMonitor() {
    const { advancedStats, progress, userSettings, quitDates, entries } = useRecovery();
    const [hexLines, setHexLines] = useState([]);
    const [isOnline, setIsOnline] = useState(false);
    const containerRef = useRef(null);
    const [pulsePhase, setPulsePhase] = useState(0);

    // Check if any protocol is active
    useEffect(() => {
        const active = Object.values(quitDates).some(date => !!date);
        setIsOnline(active);
    }, [quitDates]);

    // Real-time Ticker Values
    const [displayMoney, setDisplayMoney] = useState(0);
    const [displayLife, setDisplayLife] = useState(0);

    // Pulse animation for background
    useEffect(() => {
        if (!isOnline) return;
        const interval = setInterval(() => {
            setPulsePhase(p => (p + 1) % 360);
        }, 50);
        return () => clearInterval(interval);
    }, [isOnline]);

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
            setHexLines(prev => [newLine, ...prev.slice(0, 12)]);
        }, 120);
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
        const upcoming = timeline.find(m => !m.isCompleted);
        return upcoming || null;
    }, [quitDates, entries]);

    // Get active protocol count
    const activeProtocols = Object.values(quitDates).filter(d => !!d).length;

    // --- OFFLINE STATE ---
    if (!isOnline) {
        return (
            <HudCard title="RECOVERY STREAM" className="h-full flex flex-col relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,100,0.05)_0%,transparent_50%)]" />
                
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <motion.div
                        className="w-16 h-16 rounded-full border-2 border-dashed border-[var(--border-dim)] flex items-center justify-center mb-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    >
                        <span className="text-2xl opacity-40">📡</span>
                    </motion.div>
                    <div className="text-[var(--text-secondary)] font-mono">
                        <div className="text-sm mb-1">LINK OFFLINE</div>
                        <div className="text-[10px] text-[var(--text-dim)]">
                            Initialize a protocol to begin<br />real-time data streaming
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2 text-[9px] font-mono text-[var(--text-dim)]">
                        <StatusOrb status="offline" />
                        <span>NO SIGNAL</span>
                    </div>
                </div>
            </HudCard>
        );
    }

    // --- ONLINE STATE ---
    return (
        <HudCard 
            title="ACTIVE RECOVERY STREAM" 
            className="h-full flex flex-col relative overflow-hidden"
        >
            {/* Animated gradient background */}
            <div 
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at ${50 + Math.sin(pulsePhase * 0.02) * 20}% ${50 + Math.cos(pulsePhase * 0.02) * 20}%, rgba(0,255,136,0.1) 0%, transparent 50%)`
                }}
            />

            {/* Background Matrix Rain Effect */}
            <div className="absolute inset-0 opacity-5 pointer-events-none select-none font-mono text-[9px] leading-tight text-[var(--neon-green)] overflow-hidden p-2">
                {hexLines.map((line, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 0.2 }}
                        transition={{ duration: 2 }}
                    >
                        {line}
                    </motion.div>
                ))}
            </div>

            {/* Main Content Layer */}
            <div ref={containerRef} className="relative z-10 flex flex-col h-full gap-3">

                {/* Status Header */}
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-dim)]">
                    <div className="flex items-center gap-3">
                        <StatusOrb status="online" size={10} />
                        <span className="text-[10px] font-mono text-[var(--neon-green)]">STREAM ACTIVE</span>
                    </div>
                    <WaveIndicator active={true} color="var(--neon-green)" />
                </div>

                {/* Status Indicators */}
                <div className="grid grid-cols-2 gap-2">
                    <motion.div 
                        className="bg-[rgba(0,255,136,0.05)] p-3 rounded-lg border border-[rgba(0,255,136,0.1)]"
                        whileHover={{ borderColor: 'rgba(0,255,136,0.3)' }}
                    >
                        <div className="text-[9px] text-[var(--text-dim)] font-mono mb-1 flex items-center gap-1">
                            <span>⚡</span> ACTIVE PROTOCOLS
                        </div>
                        <div className="flex items-end gap-2">
                            <div className="text-2xl font-mono font-black text-[var(--neon-green)]">
                                {activeProtocols}
                            </div>
                            <div className="text-[10px] text-[var(--text-dim)] mb-1">/3</div>
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        className="bg-[rgba(0,240,255,0.05)] p-3 rounded-lg border border-[rgba(0,240,255,0.1)]"
                        whileHover={{ borderColor: 'rgba(0,240,255,0.3)' }}
                    >
                        <div className="text-[9px] text-[var(--text-dim)] font-mono mb-1 flex items-center gap-1">
                            <span>📊</span> STREAM STATUS
                        </div>
                        <div className="flex items-end gap-2">
                            <div className="text-xl font-mono font-bold text-[var(--neon-cyan)]">LIVE</div>
                            <motion.div 
                                className="h-4 w-1 bg-[var(--neon-cyan)] mb-1 rounded-full"
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Live Tickers */}
                <div className="bg-[rgba(0,0,0,0.3)] rounded-lg p-3 border border-[var(--border-dim)]">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-[var(--text-dim)] font-mono flex items-center gap-1">
                                <span>💰</span> CAPITAL_SAVED
                            </span>
                            <AnimatedValue 
                                value={displayMoney} 
                                prefix="₹" 
                                color="#00FF88" 
                            />
                        </div>
                        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-dim)] to-transparent" />
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-[var(--text-dim)] font-mono flex items-center gap-1">
                                <span>⏱️</span> LIFE_REGAINED
                            </span>
                            <AnimatedValue 
                                value={displayLife} 
                                prefix="+" 
                                suffix=" MIN" 
                                decimals={1}
                                color="#00F0FF" 
                            />
                        </div>
                    </div>
                </div>

                {/* Next Milestone Indicator */}
                {nextMilestone && (
                    <motion.div 
                        className="bg-[rgba(255,230,0,0.05)] p-3 rounded-lg border border-[rgba(255,230,0,0.15)]"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-[9px] text-[var(--text-dim)] font-mono mb-1 flex items-center gap-1">
                                    <span>🎯</span> NEXT MILESTONE
                                </div>
                                <div className="text-xs font-mono text-[var(--neon-yellow)] truncate max-w-[150px]">
                                    {nextMilestone.name}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[9px] text-[var(--text-dim)] mb-1">ETA</div>
                                <div className="text-sm font-mono text-white">
                                    {nextMilestone.timeToEventLabel || 'Soon'}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Real Log Output */}
                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                    <div className="text-[9px] text-[var(--text-dim)] mb-2 flex items-center gap-2 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-cyan)] animate-pulse" />
                        ACTIVITY LOG
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar bg-[rgba(0,0,0,0.2)] rounded-lg p-2">
                        <AnimatePresence initial={false}>
                            {streamData.length > 0 ? (
                                streamData.map((log, idx) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`mb-1.5 py-1 px-2 rounded text-[10px] font-mono truncate
                                            ${log.type === 'milestone' ? 'bg-[rgba(255,230,0,0.1)] text-[var(--neon-yellow)]' :
                                            log.type === 'warning' ? 'bg-[rgba(255,0,100,0.1)] text-[var(--neon-magenta)]' :
                                            log.type === 'info' ? 'bg-[rgba(0,240,255,0.1)] text-[var(--neon-cyan)]' :
                                            'bg-[rgba(0,255,136,0.1)] text-[var(--neon-green)]'
                                        }`}
                                    >
                                        {log.text}
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-[var(--text-dim)] text-center py-6 text-[10px]">
                                    <span className="text-lg block mb-2">📋</span>
                                    No activity logged yet.<br />
                                    Use check-in buttons to log progress.
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer Status */}
                <div className="flex items-center justify-between text-[9px] font-mono text-[var(--text-dim)] pt-2 border-t border-[var(--border-dim)]">
                    <div className="flex items-center gap-2">
                        <motion.div 
                            className="w-1.5 h-1.5 rounded-full bg-[var(--neon-green)]"
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span>LINK: STABLE</span>
                    </div>
                    <span>LATENCY: 0ms</span>
                </div>
            </div>

            {/* CRT Scanline Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)50%,rgba(0,0,0,0.05)50%)] bg-[length:100%_4px] pointer-events-none z-20" />
        </HudCard>
    );
}
