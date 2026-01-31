// Recovery Tracker - Body Visualization Component
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecovery } from '../context/RecoveryContext';
import { calculateSystemHealth } from '../utils/calculations';
import { BODY_SYSTEMS } from '../data/recoveryData';
import { HudCard } from './HudComponents';

export default function BodyVisualization({ substance = null }) {
    const { quitDates } = useRecovery();
    const [hoveredOrgan, setHoveredOrgan] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    const systemHealth = useMemo(() => {
        const health = {};
        const substances = substance ? [substance] : ['cigarettes', 'cannabis', 'alcohol'];

        Object.keys(BODY_SYSTEMS).forEach(systemId => {
            let totalHealth = 0;
            let count = 0;

            substances.forEach(sub => {
                if (quitDates[sub] && BODY_SYSTEMS[systemId].affectedBy.includes(sub)) {
                    const h = calculateSystemHealth(quitDates, sub, systemId);
                    totalHealth += h.health;
                    count++;
                }
            });

            health[systemId] = count > 0 ? totalHealth / count : 100;
        });

        return health;
    }, [quitDates, substance]);

    const getOrganColor = (health) => {
        if (health >= 90) return 'var(--neon-green)';
        if (health >= 70) return '#00FF9F';
        if (health >= 50) return 'var(--neon-yellow)';
        return 'var(--neon-magenta)';
    };

    const handleMouseMove = (e, organ) => {
        const rect = e.currentTarget.closest('svg').getBoundingClientRect();
        setTooltipPos({
            x: e.clientX - rect.left + 10,
            y: e.clientY - rect.top - 10
        });
        setHoveredOrgan(organ);
    };

    return (
        <HudCard title="BIOLOGICAL OPTIMIZATION MAP">
            <div className="relative w-full flex justify-center py-4" onMouseLeave={() => setHoveredOrgan(null)}>
                <svg viewBox="0 0 100 150" className="h-64 drop-shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                    <defs>
                        <filter id="organ-glow">
                            <feGaussianBlur stdDeviation="1" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <pattern id="grid-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,240,255,0.1)" strokeWidth="0.5" />
                        </pattern>
                    </defs>

                    {/* Tech Grid Background */}
                    <rect width="100%" height="100%" fill="url(#grid-pattern)" opacity="0.5" />

                    {/* Cybernetic Body Outline */}
                    <path
                        d="M50 5 C55 5, 60 10, 60 20 C60 25, 55 30, 50 30 C45 30, 40 25, 40 20 C40 10, 45 5, 50 5"
                        fill="none" stroke="var(--border-bright)" strokeWidth="0.5"
                    />
                    <path
                        d="M35 30 L65 30 L70 70 L70 140 L60 140 L60 90 L40 90 L40 140 L30 140 L30 70 Z"
                        fill="rgba(0,0,0,0.5)" stroke="var(--border-bright)" strokeWidth="0.5"
                    />

                    {/* Active Organs */}
                    {Object.entries(BODY_SYSTEMS).map(([id, organ]) => {
                        const health = systemHealth[id] || 100;
                        const color = getOrganColor(health);
                        const isAffected = organ.affectedBy.some(sub => quitDates[sub]);
                        if (!isAffected && !substance) return null;

                        return (
                            <motion.g
                                key={id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                whileHover={{ scale: 1.2 }}
                                onMouseMove={(e) => handleMouseMove(e, id)}
                                style={{ cursor: 'pointer' }}
                            >
                                {/* Connecting Line */}
                                <line
                                    x1={50} y1={organ.position.y}
                                    x2={organ.position.x} y2={organ.position.y}
                                    stroke="var(--border-bright)"
                                    strokeWidth="0.2"
                                    strokeDasharray="2 2"
                                />

                                <circle
                                    cx={organ.position.x}
                                    cy={organ.position.y}
                                    r={hoveredOrgan === id ? 4 : 3}
                                    fill={color}
                                    filter="url(#organ-glow)"
                                />

                                {/* Pulse Ring for Healing Organs */}
                                {health < 100 && (
                                    <motion.circle
                                        cx={organ.position.x}
                                        cy={organ.position.y}
                                        r={3}
                                        stroke={color}
                                        strokeWidth="0.5"
                                        fill="none"
                                        animate={{ r: [3, 8], opacity: [0.8, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    />
                                )}
                            </motion.g>
                        );
                    })}
                </svg>

                <AnimatePresence>
                    {hoveredOrgan && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: 10 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute z-50 bg-black border border-[var(--neon-cyan)] p-3 rounded-none shadow-[0_0_15px_rgba(0,240,255,0.3)] pointer-events-none"
                            style={{ left: tooltipPos.x + 20, top: tooltipPos.y }}
                        >
                            <div className="text-[var(--neon-cyan)] font-mono text-xs font-bold mb-1">
                                {BODY_SYSTEMS[hoveredOrgan].name.toUpperCase()}
                            </div>
                            <div className="text-white font-mono text-xl font-bold">
                                {Math.round(systemHealth[hoveredOrgan])}%
                            </div>
                            <div className="text-[var(--text-secondary)] text-[9px] uppercase tracking-wider mt-1">
                                STATUS: {systemHealth[hoveredOrgan] === 100 ? 'OPTIMIZED' : 'RESTORING'}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </HudCard>
    );
}
