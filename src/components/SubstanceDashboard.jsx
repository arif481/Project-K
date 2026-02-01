// SubstanceDashboard.jsx - Per-Substance Detailed Recovery Card
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRecovery } from '../context/RecoveryContext';
import { HudCard } from './HudComponents';
import { calculateRecoveryProgress, getStreakInfo } from '../utils/calculations';

// Per-substance config for calculations
const SUBSTANCE_CONFIG = {
    cigarettes: {
        label: 'NICOTINE',
        icon: '🚬',
        lifeMinutesPerUnit: 11, // 11 min per cigarette
        usagePerDay: 20, // avg pack per day
        color: 'var(--neon-cyan)'
    },
    cannabis: {
        label: 'CANNABIS',
        icon: '🌿',
        lifeMinutesPerUnit: 5,
        usagePerDay: 3,
        color: 'var(--neon-green)'
    },
    alcohol: {
        label: 'ALCOHOL',
        icon: '🍺',
        lifeMinutesPerUnit: 15,
        usagePerDay: 4,
        color: 'var(--neon-magenta)'
    }
};

export default function SubstanceDashboard({ substance, onLogEntry, onInitialize }) {
    const { progress, quitDates, userSettings, entries, addEntry } = useRecovery();
    const [tickingMoney, setTickingMoney] = useState(0);
    const [tickingLife, setTickingLife] = useState(0);

    const config = SUBSTANCE_CONFIG[substance];
    const isActive = !!quitDates[substance];
    const substanceProgress = progress[substance];
    const costPerDay = userSettings?.costs?.[substance] || 350;

    // Live ticking effect for money and life
    useEffect(() => {
        if (!isActive || !quitDates[substance]) return;

        const updateTickers = () => {
            const quitDate = new Date(quitDates[substance]);
            const now = new Date();
            const msElapsed = now - quitDate;
            const daysElapsed = msElapsed / (1000 * 60 * 60 * 24);

            // Money saved (cost per day * days)
            const moneySaved = daysElapsed * costPerDay;
            setTickingMoney(moneySaved);

            // Life regained (units not consumed * minutes per unit)
            const unitsNotConsumed = daysElapsed * config.usagePerDay;
            const minutesRegained = unitsNotConsumed * config.lifeMinutesPerUnit;
            setTickingLife(minutesRegained);
        };

        updateTickers();
        const interval = setInterval(updateTickers, 1000); // Tick every second

        return () => clearInterval(interval);
    }, [isActive, quitDates, substance, costPerDay, config]);

    // Quick action handlers
    const handleLogCleanDay = () => {
        addEntry({
            type: 'progress',
            substance,
            notes: 'Clean day logged ✓',
            timestamp: Date.now()
        });
    };

    const handleLogRelapse = () => {
        if (onLogEntry) {
            onLogEntry('relapse', substance);
        }
    };

    // Format helpers
    const formatMoney = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatLife = (minutes) => {
        if (minutes < 60) return `${Math.floor(minutes)}m`;
        if (minutes < 1440) return `${(minutes / 60).toFixed(1)}h`;
        return `${(minutes / 1440).toFixed(1)}d`;
    };

    const formatQuitDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // --- INACTIVE STATE ---
    if (!isActive) {
        return (
            <HudCard className="p-4 opacity-50 border-dashed">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{config.icon}</span>
                        <span className="text-sm font-bold uppercase tracking-widest text-white">{config.label}</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                </div>
                <div className="text-center py-4">
                    <p className="text-[var(--text-secondary)] text-xs mb-4">Protocol not initialized</p>
                    <button
                        onClick={() => onInitialize && onInitialize(substance)}
                        className="w-full border border-[var(--text-secondary)] text-[var(--text-secondary)] hover:border-white hover:text-white text-xs py-2 font-mono transition-colors"
                    >
                        INITIALIZE RECOVERY
                    </button>
                </div>
            </HudCard>
        );
    }

    // --- ACTIVE STATE ---
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <HudCard
                className="p-4 border-l-4"
                style={{ borderLeftColor: config.color }}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{config.icon}</span>
                        <span className="text-sm font-bold uppercase tracking-widest text-white">{config.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--neon-green)] animate-pulse" />
                        <span className="text-[10px] text-[var(--neon-green)]">ACTIVE</span>
                    </div>
                </div>

                {/* DAYS CLEAN - HERO STAT */}
                <div className="text-center py-3 border-y border-[var(--border-dim)]">
                    <div className="text-5xl font-mono font-black text-white mb-1">
                        {substanceProgress?.streak?.days || 0}
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] tracking-widest">DAYS CLEAN</div>
                </div>

                {/* STATS GRID */}
                <div className="grid grid-cols-2 gap-3 my-4">
                    {/* Money Saved */}
                    <div className="bg-[var(--bg-grid)] p-3 rounded">
                        <div className="text-[10px] text-[var(--text-secondary)] mb-1">CAPITAL SAVED</div>
                        <div className="text-lg font-mono font-bold text-[var(--neon-green)]">
                            {formatMoney(tickingMoney)}
                        </div>
                    </div>

                    {/* Life Regained */}
                    <div className="bg-[var(--bg-grid)] p-3 rounded">
                        <div className="text-[10px] text-[var(--text-secondary)] mb-1">LIFE REGAINED</div>
                        <div className="text-lg font-mono font-bold text-[var(--neon-cyan)]">
                            {formatLife(tickingLife)}
                        </div>
                    </div>

                    {/* Recovery Progress */}
                    <div className="bg-[var(--bg-grid)] p-3 rounded">
                        <div className="text-[10px] text-[var(--text-secondary)] mb-1">RECOVERY</div>
                        <div className="text-lg font-mono font-bold text-white">
                            {Math.round(substanceProgress?.progress || 0)}%
                        </div>
                    </div>

                    {/* Quit Date */}
                    <div className="bg-[var(--bg-grid)] p-3 rounded">
                        <div className="text-[10px] text-[var(--text-secondary)] mb-1">INITIATED</div>
                        <div className="text-xs font-mono text-white">
                            {formatQuitDate(quitDates[substance])}
                        </div>
                    </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="mb-4">
                    <div className="flex justify-between text-[10px] text-[var(--text-secondary)] mb-1">
                        <span>SYSTEM RECOVERY</span>
                        <span>{Math.round(substanceProgress?.progress || 0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--bg-grid)] rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: config.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${substanceProgress?.progress || 0}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                {/* DAILY CHECK-IN ACTIONS */}
                <div className="flex gap-2">
                    <button
                        onClick={handleLogCleanDay}
                        className="flex-1 bg-[var(--bg-grid)] hover:bg-[var(--neon-green)] hover:text-black text-[var(--neon-green)] text-xs font-mono py-2 border border-[var(--border-dim)] transition-all duration-200"
                    >
                        ✓ CLEAN TODAY
                    </button>
                    <button
                        onClick={handleLogRelapse}
                        className="px-4 bg-[var(--bg-grid)] hover:bg-[var(--neon-magenta)] hover:text-white text-[var(--neon-magenta)] text-xs font-mono py-2 border border-[var(--border-dim)] transition-all duration-200"
                    >
                        ⚠ RELAPSE
                    </button>
                </div>
            </HudCard>
        </motion.div>
    );
}
