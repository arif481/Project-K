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
        { id: 'anxiety', label: 'ANXIETY', color: 'var(--neon-magenta)' },
        { id: 'depression', label: 'DEPRESSION', color: 'var(--neon-cyan)' },
        { id: 'irritability', label: 'IRRITABILITY', color: 'var(--neon-yellow)' },
        { id: 'focus', label: 'FOCUS', color: 'var(--neon-green)' }
    ];

    if (!substance || Object.keys(moodStatus).length === 0) return null;

    return (
        <HudCard title="NEURO-PSYCH LINK">
            <div className="flex flex-col gap-4">
                {indicators.map((indicator, index) => {
                    const status = moodStatus[indicator.id];
                    const severity = status?.severity || 0;

                    return (
                        <motion.div
                            key={indicator.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group"
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-mono text-[var(--text-secondary)]">{indicator.label}</span>
                                <span className="text-[10px] font-mono" style={{ color: indicator.color }}>
                                    {Math.round(100 - severity)}% OPTIMAL
                                </span>
                            </div>

                            <div className="h-2 w-full bg-[var(--bg-grid)] border border-[var(--border-dim)] relative overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${100 - severity}%` }}
                                    transition={{ duration: 1, ease: "circOut" }}
                                    style={{
                                        height: '100%',
                                        background: indicator.color,
                                        boxShadow: `0 0 10px ${indicator.color}`
                                    }}
                                />
                                {/* Tech scanline on bar */}
                                <div className="absolute top-0 bottom-0 w-[2px] bg-white opacity-50 animate-pulse" style={{ left: `${100 - severity}%` }} />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </HudCard>
    );
}
