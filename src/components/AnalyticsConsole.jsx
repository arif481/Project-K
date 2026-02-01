import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
    LineChart, Line
} from 'recharts';
import { HudCard } from './HudComponents';
import { useRecovery } from '../context/RecoveryContext';
import RelapseAnalysis from './RelapseAnalysis';

export default function AnalyticsConsole() {
    const { entries, progress, advancedStats, quitDates } = useRecovery();
    const [activeTab, setActiveTab] = useState('trends');

    // 1. Prepare Trend Data with better date handling
    const trendData = useMemo(() => {
        const sorted = [...entries].sort((a, b) => {
            const timeA = a.timestamp || new Date(a.date).getTime();
            const timeB = b.timestamp || new Date(b.date).getTime();
            return timeA - timeB;
        });

        if (sorted.length === 0) return [];

        return sorted.map(e => ({
            date: new Date(e.timestamp || e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            mood: e.feeling ?? 50,
            craving: e.craving ?? 0,
            relapse: e.type === 'relapse' ? 100 : 0
        }));
    }, [entries]);

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

    // 3. Calculate weekly summary
    const weeklySummary = useMemo(() => {
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recentEntries = entries.filter(e => {
            const time = e.timestamp || new Date(e.date).getTime();
            return time >= oneWeekAgo;
        });

        const avgMood = recentEntries.length > 0
            ? Math.round(recentEntries.reduce((acc, e) => acc + (e.feeling || 50), 0) / recentEntries.length)
            : 50;
        
        const avgCraving = recentEntries.length > 0
            ? Math.round(recentEntries.reduce((acc, e) => acc + (e.craving || 0), 0) / recentEntries.length)
            : 0;

        const relapseCount = recentEntries.filter(e => e.type === 'relapse').length;
        const logCount = recentEntries.length;

        return { avgMood, avgCraving, relapseCount, logCount };
    }, [entries]);

    // Tab content based on selection
    const tabs = [
        { id: 'trends', label: 'TRENDS' },
        { id: 'comparison', label: 'COMPARISON' },
        { id: 'relapses', label: 'RELAPSE INTEL' }
    ];

    return (
        <div className="space-y-6">
            {/* Weekly Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <HudCard className="text-center py-4">
                    <div className="text-[10px] text-[var(--text-secondary)] font-mono mb-1">7-DAY AVG MOOD</div>
                    <div className="text-3xl font-mono font-bold text-[var(--neon-cyan)]">{weeklySummary.avgMood}%</div>
                </HudCard>
                <HudCard className="text-center py-4">
                    <div className="text-[10px] text-[var(--text-secondary)] font-mono mb-1">7-DAY AVG CRAVING</div>
                    <div className="text-3xl font-mono font-bold text-[var(--neon-magenta)]">{weeklySummary.avgCraving}%</div>
                </HudCard>
                <HudCard className="text-center py-4">
                    <div className="text-[10px] text-[var(--text-secondary)] font-mono mb-1">TOTAL LOGS</div>
                    <div className="text-3xl font-mono font-bold text-[var(--neon-green)]">{weeklySummary.logCount}</div>
                </HudCard>
                <HudCard className="text-center py-4">
                    <div className="text-[10px] text-[var(--text-secondary)] font-mono mb-1">SETBACKS</div>
                    <div className={`text-3xl font-mono font-bold ${weeklySummary.relapseCount === 0 ? 'text-[var(--neon-green)]' : 'text-[var(--neon-magenta)]'}`}>
                        {weeklySummary.relapseCount}
                    </div>
                </HudCard>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-[var(--border-dim)] pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-xs font-mono transition-all ${
                            activeTab === tab.id
                                ? 'text-[var(--neon-cyan)] border-b-2 border-[var(--neon-cyan)]'
                                : 'text-[var(--text-secondary)] hover:text-white'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                {activeTab === 'trends' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* BIO-METRIC TRENDS */}
                        <HudCard title="BIO-METRIC TRENDS" className="min-h-[300px]">
                            {trendData.length > 0 ? (
                                <div style={{ width: '100%', height: 250 }}>
                                    <ResponsiveContainer>
                                        <AreaChart data={trendData}>
                                            <defs>
                                                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorCraving" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#FF003C" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#FF003C" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                            <XAxis dataKey="date" stroke="#666" tick={{ fill: '#666', fontSize: 10 }} />
                                            <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 10 }} domain={[0, 100]} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Area type="monotone" dataKey="mood" stroke="#00F0FF" fillOpacity={1} fill="url(#colorMood)" name="Mood" />
                                            <Area type="monotone" dataKey="craving" stroke="#FF003C" fillOpacity={1} fill="url(#colorCraving)" name="Craving" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-[var(--text-secondary)] font-mono text-sm">
                                    Log entries to see your trends
                                </div>
                            )}
                        </HudCard>

                        {/* Recovery Progress Line */}
                        <HudCard title="RECOVERY TRAJECTORY" className="min-h-[300px]">
                            <div className="space-y-6 py-4">
                                {['cigarettes', 'cannabis', 'alcohol'].map(substance => {
                                    const data = progress[substance];
                                    const isActive = !!quitDates[substance];
                                    const progressVal = data?.progress || 0;
                                    const colors = {
                                        cigarettes: '#00F0FF',
                                        cannabis: '#00FF9F',
                                        alcohol: '#FF003C'
                                    };

                                    return (
                                        <div key={substance} className={!isActive ? 'opacity-30' : ''}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-mono uppercase text-white">
                                                    {substance === 'cigarettes' ? '🚬' : substance === 'cannabis' ? '🌿' : '🍺'} {substance}
                                                </span>
                                                <span className="text-xs font-mono" style={{ color: colors[substance] }}>
                                                    {Math.round(progressVal)}%
                                                </span>
                                            </div>
                                            <div className="h-3 w-full bg-[var(--bg-grid)] rounded-full overflow-hidden border border-[var(--border-dim)]">
                                                <motion.div
                                                    className="h-full rounded-full"
                                                    style={{ backgroundColor: colors[substance] }}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progressVal}%` }}
                                                    transition={{ duration: 1.5, ease: 'easeOut' }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </HudCard>
                    </div>
                )}

                {activeTab === 'comparison' && (
                    <div className="grid grid-cols-1 gap-6">
                        <HudCard title="SUBSTANCE MATRIX" className="min-h-[350px]">
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                        <PolarGrid stroke="#333" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#00F0FF', fontSize: 11 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#333" tick={{ fill: '#666', fontSize: 9 }} />
                                        <Radar name="Cigarettes" dataKey="Cigarettes" stroke="#00F0FF" fill="#00F0FF" fillOpacity={0.3} />
                                        <Radar name="Cannabis" dataKey="Cannabis" stroke="#00FF9F" fill="#00FF9F" fillOpacity={0.3} />
                                        <Radar name="Alcohol" dataKey="Alcohol" stroke="#FF003C" fill="#FF003C" fillOpacity={0.3} />
                                        <Legend 
                                            wrapperStyle={{ paddingTop: '20px' }}
                                            formatter={(value) => <span style={{ color: '#fff', fontSize: '11px' }}>{value}</span>} 
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </HudCard>
                    </div>
                )}

                {activeTab === 'relapses' && <RelapseAnalysis />}
            </motion.div>
        </div>
    );
}
