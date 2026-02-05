import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRecovery } from '../context/RecoveryContext';
import { calculateMoodProgress } from '../utils/calculations';
import { MOOD_INDICATORS } from '../data/recoveryData';
import { HudCard } from './HudComponents';

export default function MoodPanel({ substance }) {
    const { quitDates } = useRecovery();

    const moodStatus = useMemo(() => {
        if (!substance || !quitDates[substance]) return {};
        return Object.keys(MOOD_INDICATORS).reduce((acc, indicator) => {
            acc[indicator] = calculateMoodProgress(quitDates[substance], substance, indicator);
            return acc;
        }, {});
    }, [substance, quitDates]);

    const indicators = [
        { id: 'anxiety', label: 'ANXIETY', color: 'var(--neon-magenta)', icon: '😰' },
        { id: 'depression', label: 'DEPRESSION', color: 'var(--neon-cyan)', icon: '😔' },
        { id: 'irritability', label: 'IRRITABILITY', color: 'var(--neon-yellow)', icon: '😤' },
        { id: 'focus', label: 'FOCUS', color: 'var(--neon-green)', icon: '🎯' },
        { id: 'cravings', label: 'CRAVINGS', color: '#FF6B00', icon: '🔥' }
    ];

    const getPhaseLabel = (phase) => {
        switch (phase) {
            case 'building': return 'INTENSIFYING';
            case 'declining': return 'RECOVERING';
            case 'recovered': return 'STABILIZED';
            default: return 'MONITORING';
        }
    };

    if (!substance || Object.keys(moodStatus).length === 0) {
        return (
            <HudCard title="NEURO-PSYCH LINK" className="opacity-50">
                <div className="text-center py-8 text-(--text-secondary) font-mono text-xs">
                    SELECT AN ACTIVE PROTOCOL TO MONITOR
                </div>
            </HudCard>
        );
    }

    return (
        <HudCard title="NEURO-PSYCH LINK">
            <div className="flex flex-col gap-4">
                {indicators.map((indicator, index) => {
                    const status = moodStatus[indicator.id];
                    const severity = status?.severity || 0;
                    const phase = status?.phase || 'unknown';
                    const isPositive = indicator.id === 'focus'; // Focus is inverted (higher = better)

                    return (
                        <motion.div
                            key={indicator.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group"
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-mono text-(--text-secondary) flex items-center gap-1">
                                    <span>{indicator.icon}</span> {indicator.label}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span 
                                        className="text-[8px] font-mono px-1.5 py-0.5 rounded"
                                        style={{ 
                                            color: indicator.color,
                                            backgroundColor: `${indicator.color}20`
                                        }}
                                    >
                                        {getPhaseLabel(phase)}
                                    </span>
                                    <span className="text-[10px] font-mono" style={{ color: indicator.color }}>
                                        {isPositive ? Math.round(100 - severity) : Math.round(severity)}%
                                    </span>
                                </div>
                            </div>

                            <div className="h-2 w-full bg-(--bg-grid) border border-(--border-dim) relative overflow-hidden rounded-sm">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${isPositive ? 100 - severity : severity}%` }}
                                    transition={{ duration: 1, ease: "circOut" }}
                                    style={{
                                        height: '100%',
                                        background: `linear-gradient(90deg, ${indicator.color}40, ${indicator.color})`,
                                        boxShadow: `0 0 10px ${indicator.color}`
                                    }}
                                />
                                {/* Pulse indicator at the end */}
                                <motion.div 
                                    className="absolute top-0 bottom-0 w-1"
                                    style={{ 
                                        left: `${isPositive ? 100 - severity : severity}%`,
                                        background: indicator.color,
                                        boxShadow: `0 0 8px ${indicator.color}`
                                    }}
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                />
                            </div>
                        </motion.div>
                    );
                })}

                {/* Summary */}
                <div className="mt-2 pt-3 border-t border-(--border-dim)">
                    <div className="text-[9px] text-(--text-secondary) font-mono">
                        Withdrawal symptoms typically peak at 2-3 days and gradually improve over weeks.
                        Monitor these metrics and log any significant changes.
                    </div>
                </div>
            </div>
        </HudCard>
    );
}
