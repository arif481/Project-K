// AnalyticsConsole.jsx - Advanced Telemetry Dashboard v4.0
import { useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
    LineChart, Line, BarChart, Bar, Cell
} from 'recharts';
import { HudCard } from './HudComponents';
import { useRecovery } from '../context/RecoveryContext';
import RelapseAnalysis from './RelapseAnalysis';

// Animated stat card component
const StatCard = ({ label, value, color, icon, trend, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        whileHover={{ scale: 1.02, y: -2 }}
        className="relative group"
    >
        <div 
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
            style={{ background: `${color}20` }}
        />
        <HudCard className="text-center py-5 relative overflow-hidden">
            {/* Background glow */}
            <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full blur-3xl opacity-20"
                style={{ background: color }}
            />
            
            <div className="relative z-10">
                <div className="text-2xl mb-2">{icon}</div>
                <div className="text-[9px] text-[var(--text-dim)] font-mono mb-2 tracking-wider">{label}</div>
                <div className="text-3xl font-mono font-black" style={{ color }}>{value}</div>
                {trend !== undefined && (
                    <div className={`text-[10px] font-mono mt-1 ${trend >= 0 ? 'text-[#00FF88]' : 'text-[#FF0064]'}`}>
                        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </div>
                )}
            </div>
        </HudCard>
    </motion.div>
);

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    
    return (
        <div className="bg-[rgba(0,0,0,0.9)] border border-[var(--border-dim)] rounded-lg p-3 backdrop-blur-xl">
            <div className="text-[10px] text-[var(--text-dim)] mb-2 font-mono">{label}</div>
            {payload.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-mono">
                    <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                    <span className="text-[var(--text-secondary)]">{entry.name}:</span>
                    <span style={{ color: entry.color }}>{entry.value}%</span>
                </div>
            ))}
        </div>
    );
};

// Tab button component
const TabButton = ({ active, onClick, children }) => (
    <motion.button
        onClick={onClick}
        className={`relative px-4 py-2 text-xs font-mono transition-all ${
            active ? 'text-white' : 'text-[var(--text-dim)] hover:text-[var(--text-secondary)]'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
    >
        {children}
        {active && (
            <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)]"
            />
        )}
    </motion.button>
);

export default function AnalyticsConsole() {
    const { entries, progress, advancedStats, quitDates } = useRecovery();
    const [activeTab, setActiveTab] = useState('trends');
    const [chartTimeframe, setChartTimeframe] = useState('7d');

    // 1. Prepare Trend Data with better date handling
    const trendData = useMemo(() => {
        const sorted = [...entries].sort((a, b) => {
            const timeA = a.timestamp || new Date(a.date).getTime();
            const timeB = b.timestamp || new Date(b.date).getTime();
            return timeA - timeB;
        });

        if (sorted.length === 0) return [];

        // Filter by timeframe
        const now = Date.now();
        const timeframeMs = {
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000,
            'all': Infinity
        }[chartTimeframe];

        const filtered = sorted.filter(e => {
            const time = e.timestamp || new Date(e.date).getTime();
            return now - time <= timeframeMs;
        });

        return filtered.map(e => ({
            date: new Date(e.timestamp || e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            mood: e.feeling ?? 50,
            craving: e.craving ?? 0,
            relapse: e.type === 'relapse' ? 100 : 0
        }));
    }, [entries, chartTimeframe]);

    // 2. Prepare Radar Data (Substance Comparison) with real data
    const radarData = useMemo(() => {
        const getSubstanceHealth = (substance) => {
            if (!progress[substance]) return 0;
            return progress[substance].progress || 0;
        };

        const getSubstanceMood = (substance) => {
            const substanceEntries = entries.filter(e => e.substance === substance && e.feeling);
            if (substanceEntries.length === 0) return 50;
            const avgMood = substanceEntries.reduce((acc, e) => acc + e.feeling, 0) / substanceEntries.length;
            return Math.round(avgMood);
        };

        return [
            { 
                subject: 'Streak', 
                Cigarettes: Math.min(progress.cigarettes?.streak?.days || 0, 100), 
                Cannabis: Math.min(progress.cannabis?.streak?.days || 0, 100), 
                Alcohol: Math.min(progress.alcohol?.streak?.days || 0, 100), 
                fullMark: 100 
            },
            { 
                subject: 'Health', 
                Cigarettes: getSubstanceHealth('cigarettes'), 
                Cannabis: getSubstanceHealth('cannabis'), 
                Alcohol: getSubstanceHealth('alcohol'), 
                fullMark: 100 
            },
            { 
                subject: 'Mood', 
                Cigarettes: getSubstanceMood('cigarettes'), 
                Cannabis: getSubstanceMood('cannabis'), 
                Alcohol: getSubstanceMood('alcohol'), 
                fullMark: 100 
            },
        ];
    }, [progress, entries]);

    // 3. Calculate weekly summary with trend comparison
    const weeklySummary = useMemo(() => {
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
        
        const thisWeekEntries = entries.filter(e => {
            const time = e.timestamp || new Date(e.date).getTime();
            return time >= oneWeekAgo;
        });
        
        const lastWeekEntries = entries.filter(e => {
            const time = e.timestamp || new Date(e.date).getTime();
            return time >= twoWeeksAgo && time < oneWeekAgo;
        });

        const calcAvg = (arr, key, defaultVal = 50) => {
            if (arr.length === 0) return defaultVal;
            return Math.round(arr.reduce((acc, e) => acc + (e[key] || defaultVal), 0) / arr.length);
        };

        const thisWeekMood = calcAvg(thisWeekEntries, 'feeling');
        const lastWeekMood = calcAvg(lastWeekEntries, 'feeling');
        const moodTrend = lastWeekMood > 0 ? Math.round(((thisWeekMood - lastWeekMood) / lastWeekMood) * 100) : 0;

        const thisWeekCraving = calcAvg(thisWeekEntries, 'craving', 0);
        const lastWeekCraving = calcAvg(lastWeekEntries, 'craving', 0);
        const cravingTrend = lastWeekCraving > 0 ? Math.round(((lastWeekCraving - thisWeekCraving) / lastWeekCraving) * 100) : 0;

        const relapseCount = thisWeekEntries.filter(e => e.type === 'relapse').length;
        const logCount = thisWeekEntries.length;

        return { 
            avgMood: thisWeekMood, 
            avgCraving: thisWeekCraving, 
            relapseCount, 
            logCount,
            moodTrend,
            cravingTrend
        };
    }, [entries]);

    // 4. Bar chart data for substance comparison
    const barData = useMemo(() => {
        return ['cigarettes', 'cannabis', 'alcohol'].map(substance => ({
            name: substance.charAt(0).toUpperCase() + substance.slice(1),
            progress: Math.round(progress[substance]?.progress || 0),
            days: progress[substance]?.streak?.days || 0,
            active: !!quitDates[substance]
        }));
    }, [progress, quitDates]);

    const tabs = [
        { id: 'trends', label: '📊 TRENDS', icon: '📊' },
        { id: 'comparison', label: '🔬 COMPARISON', icon: '🔬' },
        { id: 'relapses', label: '⚠️ RELAPSE INTEL', icon: '⚠️' }
    ];

    const substanceColors = {
        cigarettes: '#00F0FF',
        cannabis: '#00FF88',
        alcohol: '#FF0064'
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-mono font-bold text-white mb-1">ANALYTICS CONSOLE</h2>
                    <p className="text-[10px] text-[var(--text-dim)] font-mono">Real-time telemetry & performance metrics</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--neon-green)] animate-pulse" />
                    <span className="text-[10px] font-mono text-[var(--text-dim)]">LIVE DATA</span>
                </div>
            </div>

            {/* Weekly Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard 
                    label="7-DAY AVG MOOD" 
                    value={`${weeklySummary.avgMood}%`} 
                    color="#00F0FF" 
                    icon="😊"
                    trend={weeklySummary.moodTrend}
                    delay={0}
                />
                <StatCard 
                    label="7-DAY AVG CRAVING" 
                    value={`${weeklySummary.avgCraving}%`} 
                    color="#FF0064" 
                    icon="🔥"
                    trend={weeklySummary.cravingTrend}
                    delay={0.1}
                />
                <StatCard 
                    label="TOTAL LOGS" 
                    value={weeklySummary.logCount} 
                    color="#00FF88" 
                    icon="📝"
                    delay={0.2}
                />
                <StatCard 
                    label="SETBACKS" 
                    value={weeklySummary.relapseCount} 
                    color={weeklySummary.relapseCount === 0 ? '#00FF88' : '#FF0064'} 
                    icon={weeklySummary.relapseCount === 0 ? '✅' : '⚠️'}
                    delay={0.3}
                />
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center justify-between border-b border-[var(--border-dim)]">
                <div className="flex gap-1">
                    {tabs.map(tab => (
                        <TabButton
                            key={tab.id}
                            active={activeTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </TabButton>
                    ))}
                </div>
                
                {activeTab === 'trends' && (
                    <div className="flex gap-1 pb-2">
                        {['7d', '30d', 'all'].map(tf => (
                            <button
                                key={tf}
                                onClick={() => setChartTimeframe(tf)}
                                className={`px-2 py-1 text-[9px] font-mono rounded transition-all ${
                                    chartTimeframe === tf 
                                        ? 'bg-[var(--neon-cyan)] text-black' 
                                        : 'text-[var(--text-dim)] hover:text-white'
                                }`}
                            >
                                {tf.toUpperCase()}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'trends' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* BIO-METRIC TRENDS */}
                            <HudCard title="BIO-METRIC TRENDS" className="min-h-[320px]">
                                {trendData.length > 0 ? (
                                    <div style={{ width: '100%', height: 260 }}>
                                        <ResponsiveContainer>
                                            <AreaChart data={trendData}>
                                                <defs>
                                                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorCraving" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#FF0064" stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor="#FF0064" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                                <XAxis 
                                                    dataKey="date" 
                                                    stroke="rgba(255,255,255,0.2)" 
                                                    tick={{ fill: 'var(--text-dim)', fontSize: 9, fontFamily: 'monospace' }} 
                                                />
                                                <YAxis 
                                                    stroke="rgba(255,255,255,0.2)" 
                                                    tick={{ fill: 'var(--text-dim)', fontSize: 9, fontFamily: 'monospace' }} 
                                                    domain={[0, 100]} 
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="mood" 
                                                    stroke="#00F0FF" 
                                                    strokeWidth={2}
                                                    fillOpacity={1} 
                                                    fill="url(#colorMood)" 
                                                    name="Mood" 
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="craving" 
                                                    stroke="#FF0064" 
                                                    strokeWidth={2}
                                                    fillOpacity={1} 
                                                    fill="url(#colorCraving)" 
                                                    name="Craving" 
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-64 flex flex-col items-center justify-center text-center">
                                        <span className="text-4xl mb-3">📊</span>
                                        <p className="text-[var(--text-secondary)] font-mono text-sm mb-1">No data available</p>
                                        <p className="text-[var(--text-dim)] font-mono text-xs">Log entries to see your trends</p>
                                    </div>
                                )}
                            </HudCard>

                            {/* Recovery Progress Bars */}
                            <HudCard title="RECOVERY TRAJECTORY" className="min-h-[320px]">
                                <div className="space-y-5 py-4">
                                    {['cigarettes', 'cannabis', 'alcohol'].map((substance, idx) => {
                                        const data = progress[substance];
                                        const isActive = !!quitDates[substance];
                                        const progressVal = data?.progress || 0;
                                        const days = data?.streak?.days || 0;
                                        const color = substanceColors[substance];
                                        const icons = { cigarettes: '🚬', cannabis: '🌿', alcohol: '🍺' };

                                        return (
                                            <motion.div 
                                                key={substance} 
                                                className={!isActive ? 'opacity-30' : ''}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: isActive ? 1 : 0.3, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{icons[substance]}</span>
                                                        <span className="text-xs font-mono uppercase text-white">{substance}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-mono text-[var(--text-dim)]">
                                                            {days} days
                                                        </span>
                                                        <span className="text-sm font-mono font-bold" style={{ color }}>
                                                            {Math.round(progressVal)}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="h-3 w-full bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full rounded-full relative overflow-hidden"
                                                        style={{ backgroundColor: color }}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progressVal}%` }}
                                                        transition={{ duration: 1.5, ease: 'easeOut', delay: idx * 0.1 }}
                                                    >
                                                        {/* Shimmer effect */}
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                                
                                {/* Mini bar chart */}
                                <div className="mt-4 pt-4 border-t border-[var(--border-dim)]">
                                    <div className="text-[9px] font-mono text-[var(--text-dim)] mb-3">COMPARATIVE PROGRESS</div>
                                    <div style={{ width: '100%', height: 100 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={barData} layout="vertical">
                                                <XAxis type="number" domain={[0, 100]} hide />
                                                <YAxis 
                                                    type="category" 
                                                    dataKey="name" 
                                                    width={70}
                                                    tick={{ fill: 'var(--text-dim)', fontSize: 9, fontFamily: 'monospace' }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <Bar dataKey="progress" radius={[0, 4, 4, 0]}>
                                                    {barData.map((entry, index) => (
                                                        <Cell 
                                                            key={`cell-${index}`} 
                                                            fill={Object.values(substanceColors)[index]}
                                                            opacity={entry.active ? 1 : 0.3}
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </HudCard>
                        </div>
                    )}

                    {activeTab === 'comparison' && (
                        <div className="grid grid-cols-1 gap-6">
                            <HudCard title="SUBSTANCE MATRIX" className="min-h-[400px]">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Radar Chart */}
                                    <div style={{ width: '100%', height: 320 }}>
                                        <ResponsiveContainer>
                                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                                <PolarAngleAxis 
                                                    dataKey="subject" 
                                                    tick={{ fill: '#00F0FF', fontSize: 11, fontFamily: 'monospace' }} 
                                                />
                                                <PolarRadiusAxis 
                                                    angle={30} 
                                                    domain={[0, 100]} 
                                                    stroke="rgba(255,255,255,0.1)" 
                                                    tick={{ fill: 'var(--text-dim)', fontSize: 9 }} 
                                                />
                                                <Radar 
                                                    name="Cigarettes" 
                                                    dataKey="Cigarettes" 
                                                    stroke="#00F0FF" 
                                                    fill="#00F0FF" 
                                                    fillOpacity={0.2}
                                                    strokeWidth={2}
                                                />
                                                <Radar 
                                                    name="Cannabis" 
                                                    dataKey="Cannabis" 
                                                    stroke="#00FF88" 
                                                    fill="#00FF88" 
                                                    fillOpacity={0.2}
                                                    strokeWidth={2}
                                                />
                                                <Radar 
                                                    name="Alcohol" 
                                                    dataKey="Alcohol" 
                                                    stroke="#FF0064" 
                                                    fill="#FF0064" 
                                                    fillOpacity={0.2}
                                                    strokeWidth={2}
                                                />
                                                <Legend 
                                                    wrapperStyle={{ paddingTop: '20px' }}
                                                    formatter={(value) => (
                                                        <span style={{ color: '#fff', fontSize: '10px', fontFamily: 'monospace' }}>
                                                            {value}
                                                        </span>
                                                    )} 
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    
                                    {/* Stats comparison */}
                                    <div className="space-y-4 py-4">
                                        <div className="text-[10px] font-mono text-[var(--text-dim)] mb-4">DETAILED METRICS</div>
                                        {['cigarettes', 'cannabis', 'alcohol'].map((substance, idx) => {
                                            const data = progress[substance];
                                            const isActive = !!quitDates[substance];
                                            const color = substanceColors[substance];
                                            const icons = { cigarettes: '🚬', cannabis: '🌿', alcohol: '🍺' };
                                            
                                            return (
                                                <motion.div
                                                    key={substance}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className={`p-4 rounded-lg border transition-all ${
                                                        isActive 
                                                            ? 'bg-[rgba(255,255,255,0.02)] border-[var(--border-dim)]' 
                                                            : 'bg-transparent border-dashed border-[var(--border-dim)] opacity-40'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className="text-xl">{icons[substance]}</span>
                                                        <span className="text-sm font-mono font-bold uppercase" style={{ color }}>
                                                            {substance}
                                                        </span>
                                                        {isActive && (
                                                            <span className="ml-auto text-[9px] font-mono px-2 py-0.5 rounded bg-[rgba(0,255,136,0.1)] text-[#00FF88]">
                                                                ACTIVE
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4 text-center">
                                                        <div>
                                                            <div className="text-[9px] text-[var(--text-dim)]">STREAK</div>
                                                            <div className="text-lg font-mono font-bold text-white">
                                                                {data?.streak?.days || 0}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[9px] text-[var(--text-dim)]">HEALTH</div>
                                                            <div className="text-lg font-mono font-bold" style={{ color }}>
                                                                {Math.round(data?.progress || 0)}%
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[9px] text-[var(--text-dim)]">RANK</div>
                                                            <div className="text-lg font-mono font-bold text-white">
                                                                {data?.rank || '-'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </HudCard>
                        </div>
                    )}

                    {activeTab === 'relapses' && <RelapseAnalysis />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
