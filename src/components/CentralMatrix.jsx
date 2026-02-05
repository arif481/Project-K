import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HudCard } from './HudComponents';
import { useRecovery } from '../context/RecoveryContext';

// Circular Progress Ring Component
function ProgressRing({ value, max = 100, size = 120, strokeWidth = 8, color, label, icon, delay = 0 }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = Math.min(value / max, 1);
    const offset = circumference - progress * circumference;
    
    return (
        <motion.div 
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.5 }}
        >
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background ring */}
                <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress ring */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, delay: delay + 0.2, ease: "easeOut" }}
                        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                    />
                </svg>
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl mb-1">{icon}</span>
                    <span className="text-xl font-mono font-black" style={{ color }}>
                        {Math.round(value)}%
                    </span>
                </div>
            </div>
            <span className="mt-2 text-[10px] font-mono text-white/60 tracking-wider">{label}</span>
        </motion.div>
    );
}

// Stat Bar Component
function StatBar({ label, value, maxValue, color, icon, unit = '', delay = 0 }) {
    const percentage = Math.min((value / maxValue) * 100, 100);
    
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className="space-y-1.5"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-base">{icon}</span>
                    <span className="text-[11px] font-mono text-white/70">{label}</span>
                </div>
                <span className="text-sm font-mono font-bold" style={{ color }}>
                    {typeof value === 'number' ? value.toLocaleString() : value}{unit}
                </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
                />
            </div>
        </motion.div>
    );
}

// Main Health Score Display
function MainHealthDisplay({ health }) {
    const getHealthStatus = (h) => {
        if (h >= 90) return { text: 'EXCELLENT', color: '#00FF88', emoji: '🌟' };
        if (h >= 70) return { text: 'GOOD', color: '#00F0FF', emoji: '💪' };
        if (h >= 50) return { text: 'IMPROVING', color: '#FFE600', emoji: '📈' };
        if (h >= 30) return { text: 'RECOVERING', color: '#FF8800', emoji: '🔄' };
        return { text: 'STARTING', color: '#FF0044', emoji: '🌱' };
    };
    
    const status = getHealthStatus(health);
    const circumference = 2 * Math.PI * 70;
    const offset = circumference - (health / 100) * circumference;
    
    return (
        <motion.div 
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="relative w-44 h-44">
                {/* Outer glow */}
                <div 
                    className="absolute inset-0 rounded-full blur-xl opacity-30"
                    style={{ background: status.color }}
                />
                
                {/* Background ring */}
                <svg className="absolute inset-0 -rotate-90" width="176" height="176">
                    <circle
                        cx="88"
                        cy="88"
                        r="70"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="12"
                    />
                    {/* Progress ring */}
                    <motion.circle
                        cx="88"
                        cy="88"
                        r="70"
                        fill="none"
                        stroke={status.color}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        style={{ filter: `drop-shadow(0 0 10px ${status.color})` }}
                    />
                </svg>
                
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl mb-1">{status.emoji}</span>
                    <motion.span 
                        className="text-4xl font-mono font-black"
                        style={{ color: status.color }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                    >
                        {Math.round(health)}%
                    </motion.span>
                    <span className="text-[10px] font-mono text-white/50 mt-1">OVERALL HEALTH</span>
                </div>
            </div>
            
            {/* Status badge */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-3 px-4 py-1.5 rounded-full border"
                style={{ borderColor: status.color, background: `${status.color}15` }}
            >
                <span className="text-xs font-mono font-bold tracking-wider" style={{ color: status.color }}>
                    {status.text}
                </span>
            </motion.div>
        </motion.div>
    );
}

export default function CentralMatrix() {
    const { overallHealth, advancedStats, progress, quitDates, entries } = useRecovery();

    // Calculate meaningful metrics
    const metrics = useMemo(() => {
        const totalStreakDays = Object.values(progress).reduce((acc, p) => acc + (p?.streak?.days || 0), 0);
        const activeProtocols = Object.values(quitDates).filter(d => !!d).length;
        const moneySaved = advancedStats.moneySaved || 0;
        const totalEntries = entries?.length || 0;
        
        // Calculate body recovery percentage (simplified)
        const bodyRecovery = Math.min(100, (totalStreakDays / 30) * 25 + 25);
        
        // Calculate mental clarity based on streak and entries
        const mentalClarity = Math.min(100, activeProtocols * 20 + (totalStreakDays / 7) * 10);
        
        // Calculate momentum (recent activity)
        const recentEntries = entries?.filter(e => 
            Date.now() - e.timestamp < 7 * 24 * 60 * 60 * 1000
        ).length || 0;
        const momentum = Math.min(100, recentEntries * 15 + activeProtocols * 25);
        
        return {
            totalStreakDays,
            activeProtocols,
            moneySaved,
            totalEntries,
            bodyRecovery,
            mentalClarity,
            momentum,
            longestStreak: Math.max(...Object.values(progress).map(p => p?.streak?.days || 0), 0)
        };
    }, [progress, quitDates, advancedStats, entries]);

    return (
        <HudCard 
            title="RECOVERY COMMAND CENTER" 
            className="h-full flex flex-col relative overflow-hidden"
        >
            {/* Background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.03)_0%,transparent_70%)]" />
            
            <div className="flex-1 flex flex-col relative z-10 py-2">
                {/* Main Health Display */}
                <div className="flex justify-center mb-4">
                    <MainHealthDisplay health={overallHealth} />
                </div>
                
                {/* Secondary Metrics - 3 Progress Rings */}
                <div className="flex justify-around mb-4 px-2">
                    <ProgressRing 
                        value={metrics.bodyRecovery} 
                        size={80} 
                        strokeWidth={6}
                        color="#00FF88" 
                        label="BODY" 
                        icon="💚"
                        delay={0.2}
                    />
                    <ProgressRing 
                        value={metrics.mentalClarity} 
                        size={80} 
                        strokeWidth={6}
                        color="#00F0FF" 
                        label="MIND" 
                        icon="🧠"
                        delay={0.3}
                    />
                    <ProgressRing 
                        value={metrics.momentum} 
                        size={80} 
                        strokeWidth={6}
                        color="#A855F7" 
                        label="MOMENTUM" 
                        icon="🚀"
                        delay={0.4}
                    />
                </div>
                
                {/* Stats Bars */}
                <div className="space-y-3 px-1">
                    <StatBar 
                        label="Days Clean" 
                        value={metrics.totalStreakDays}
                        maxValue={90}
                        color="#00FF88"
                        icon="📅"
                        delay={0.5}
                    />
                    <StatBar 
                        label="Money Saved" 
                        value={metrics.moneySaved}
                        maxValue={5000}
                        color="#FFE600"
                        icon="💰"
                        unit="$"
                        delay={0.6}
                    />
                    <StatBar 
                        label="Journal Entries" 
                        value={metrics.totalEntries}
                        maxValue={50}
                        color="#00F0FF"
                        icon="📝"
                        delay={0.7}
                    />
                </div>
            </div>

            {/* Bottom Quick Stats */}
            <div className="relative z-10 grid grid-cols-3 gap-3 pt-3 border-t border-white/10">
                <div className="text-center">
                    <div className="text-lg font-mono font-bold text-[#00FF88]">
                        {metrics.activeProtocols}/3
                    </div>
                    <div className="text-[9px] font-mono text-white/50">PROTOCOLS</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-mono font-bold text-[#FFE600]">
                        {metrics.longestStreak}d
                    </div>
                    <div className="text-[9px] font-mono text-white/50">BEST STREAK</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-mono font-bold text-[#A855F7]">
                        {advancedStats.currentRank || 'N/A'}
                    </div>
                    <div className="text-[9px] font-mono text-white/50">RANK</div>
                </div>
            </div>

            {/* Status Footer */}
            <div className="relative z-10 flex justify-between items-center mt-2 pt-2 border-t border-white/10 text-[9px] font-mono text-white/40">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse" />
                    <span>LIVE TRACKING</span>
                </div>
                <span>Updated just now</span>
            </div>
        </HudCard>
    );
}
