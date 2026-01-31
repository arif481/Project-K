// Recovery Tracker - Brain Visualization Component
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecovery } from '../context/RecoveryContext';
import { NEUROTRANSMITTER_RECOVERY } from '../data/recoveryData';
import { calculateNeurotransmitterProgress } from '../utils/calculations';
import { HudCard } from './HudComponents';

export default function BrainVisualization({ substance }) {
    const { quitDates } = useRecovery();
    const [hoveredRegion, setHoveredRegion] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    const ntStatus = useMemo(() => {
        if (!substance || !quitDates[substance]) return {};
        return Object.entries(NEUROTRANSMITTER_RECOVERY)
            .filter(([_, data]) => data.affectedBy.includes(substance))
            .reduce((acc, [key, data]) => {
                const result = calculateNeurotransmitterProgress(quitDates[substance], substance, key);
                acc[key] = result;
                return acc;
            }, {});
    }, [substance, quitDates]);

    const getRegionColor = (progress) => {
        if (!progress) return 'var(--border-dim)';
        if (progress.progress >= 90) return 'var(--neon-green)';
        if (progress.progress >= 50) return 'var(--neon-cyan)';
        return 'var(--neon-magenta)';
    };

    const handleMouseMove = (e, region) => {
        const rect = e.currentTarget.closest('svg').getBoundingClientRect();
        setTooltipPos({
            x: e.clientX - rect.left + 10,
            y: e.clientY - rect.top - 10
        });
        setHoveredRegion(region);
    };

    if (!substance || Object.keys(ntStatus).length === 0) return null;

    return (
        <HudCard title="NEURAL RESTORATION MATRIX">
            <div className="relative w-full flex justify-center py-4">
                {/* Brain SVG Schematic */}
                <svg viewBox="0 0 200 150" className="h-48">
                    <defs>
                        <filter id="neural-glow">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Wireframe Brain */}
                    <path
                        d="M40 100 Q 20 80 40 40 Q 80 10 120 40 Q 180 30 180 80 Q 180 130 120 120 Q 80 140 40 100"
                        fill="none"
                        stroke="var(--border-bright)"
                        strokeWidth="1"
                        className="opacity-50"
                    />

                    {/* Neurotransmitter Regions */}
                    {Object.entries(ntStatus).map(([key, data]) => {
                        const color = getRegionColor(data);
                        const pathData = key === 'dopamine' ? "M40 100 Q 20 80 40 40 Q 60 30 70 70 Q 50 110 40 100" :
                            key === 'serotonin' ? "M70 70 Q 90 50 110 70 Q 100 90 80 85 Q 70 70 70 70" :
                                "M120 40 Q 160 40 160 80 Q 140 100 120 90 Q 110 60 120 40";

                        return (
                            <motion.g
                                key={key}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onMouseMove={(e) => handleMouseMove(e, key)}
                                onMouseLeave={() => setHoveredRegion(null)}
                                style={{ cursor: 'pointer' }}
                            >
                                <path
                                    d={pathData}
                                    fill={color}
                                    opacity={hoveredRegion === key ? 0.4 : 0.1}
                                    stroke={color}
                                    strokeWidth="0.5"
                                />

                                {/* Active Nodes */}
                                <motion.circle
                                    cx={key === 'dopamine' ? 45 : key === 'serotonin' ? 90 : 140}
                                    cy={key === 'dopamine' ? 70 : key === 'serotonin' ? 70 : 70}
                                    r="2"
                                    fill={color}
                                    filter="url(#neural-glow)"
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ repeat: Infinity, duration: Math.random() * 2 + 1 }}
                                />
                            </motion.g>
                        );
                    })}
                </svg>

                {/* Tech Tooltip */}
                <AnimatePresence>
                    {hoveredRegion && ntStatus[hoveredRegion] && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute z-50 bg-black border border-[var(--neon-green)] p-3 shadow-[0_0_15px_rgba(0,255,159,0.3)] pointer-events-none"
                            style={{
                                left: tooltipPos.x + 20,
                                top: tooltipPos.y,
                                transform: 'translate(-50%, -100%)'
                            }}
                        >
                            <div className="text-[var(--neon-green)] font-mono text-xs font-bold mb-1 border-b border-[var(--border-dim)] pb-1">
                                {ntStatus[hoveredRegion].name.toUpperCase()}
                            </div>
                            <div className="text-white font-mono text-xl font-bold">
                                {Math.round(ntStatus[hoveredRegion].progress)}%
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
                {Object.entries(ntStatus).map(([key, data]) => (
                    <div key={key} className="flex items-center gap-2 bg-[var(--bg-grid)] p-2 border border-[var(--border-dim)]">
                        <span className="w-2 h-2 rounded-full" style={{ background: getRegionColor(data), boxShadow: `0 0 5px ${getRegionColor(data)}` }} />
                        <span className="text-[10px] text-[var(--text-secondary)] font-mono uppercase truncate">{data.name}</span>
                    </div>
                ))}
            </div>
        </HudCard>
    );
}
