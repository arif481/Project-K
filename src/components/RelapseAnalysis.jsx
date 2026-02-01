// RelapseAnalysis.jsx - Deep Dive into Relapse Patterns
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRecovery } from '../context/RecoveryContext';
import { HudCard } from './HudComponents';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const COLORS = {
    cigarettes: '#00F0FF',
    cannabis: '#00FF9F',
    alcohol: '#FF003C'
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function RelapseAnalysis() {
    const { entries, quitDates } = useRecovery();

    // Filter only relapse entries
    const relapseEntries = useMemo(() => {
        return entries.filter(e => e.type === 'relapse');
    }, [entries]);

    // Analyze by day of week
    const dayOfWeekData = useMemo(() => {
        const counts = Array(7).fill(0);
        relapseEntries.forEach(entry => {
            const timestamp = entry.timestamp || new Date(entry.date).getTime();
            const day = new Date(timestamp).getDay();
            counts[day]++;
        });
        return DAY_NAMES.map((name, i) => ({
            name,
            count: counts[i],
            fill: counts[i] > 0 ? '#FF003C' : '#333'
        }));
    }, [relapseEntries]);

    // Analyze by time of day
    const timeOfDayData = useMemo(() => {
        const periods = { morning: 0, afternoon: 0, evening: 0, night: 0 };
        relapseEntries.forEach(entry => {
            const timestamp = entry.timestamp || new Date(entry.date).getTime();
            const hour = new Date(timestamp).getHours();
            if (hour >= 6 && hour < 12) periods.morning++;
            else if (hour >= 12 && hour < 18) periods.afternoon++;
            else if (hour >= 18 && hour < 22) periods.evening++;
            else periods.night++;
        });
        return [
            { name: 'Morning (6-12)', value: periods.morning, color: '#FCEE0A' },
            { name: 'Afternoon (12-18)', value: periods.afternoon, color: '#00FF9F' },
            { name: 'Evening (18-22)', value: periods.evening, color: '#00F0FF' },
            { name: 'Night (22-6)', value: periods.night, color: '#FF003C' }
        ].filter(d => d.value > 0);
    }, [relapseEntries]);

    // Analyze by substance
    const substanceData = useMemo(() => {
        const counts = { cigarettes: 0, cannabis: 0, alcohol: 0 };
        relapseEntries.forEach(entry => {
            if (counts[entry.substance] !== undefined) {
                counts[entry.substance]++;
            }
        });
        return Object.entries(counts)
            .filter(([_, count]) => count > 0)
            .map(([name, count]) => ({
                name: name.toUpperCase(),
                count,
                fill: COLORS[name]
            }));
    }, [relapseEntries]);

    // Common triggers (from notes)
    const triggerAnalysis = useMemo(() => {
        const triggerWords = {
            stress: ['stress', 'stressed', 'anxious', 'anxiety', 'work', 'pressure'],
            social: ['party', 'friends', 'social', 'bar', 'club', 'drinking'],
            emotional: ['sad', 'depressed', 'lonely', 'bored', 'angry', 'upset'],
            habitual: ['habit', 'routine', 'morning', 'after meal', 'coffee']
        };

        const counts = { stress: 0, social: 0, emotional: 0, habitual: 0 };

        relapseEntries.forEach(entry => {
            if (entry.notes) {
                const notesLower = entry.notes.toLowerCase();
                Object.entries(triggerWords).forEach(([trigger, words]) => {
                    if (words.some(word => notesLower.includes(word))) {
                        counts[trigger]++;
                    }
                });
            }
        });

        return Object.entries(counts)
            .filter(([_, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4);
    }, [relapseEntries]);

    // Calculate streaks between relapses
    const streakAnalysis = useMemo(() => {
        const streaks = [];
        const substances = ['cigarettes', 'cannabis', 'alcohol'];

        substances.forEach(substance => {
            if (!quitDates[substance]) return;

            const substanceRelapses = relapseEntries
                .filter(e => e.substance === substance)
                .sort((a, b) => {
                    const timeA = a.timestamp || new Date(a.date).getTime();
                    const timeB = b.timestamp || new Date(b.date).getTime();
                    return timeA - timeB;
                });

            if (substanceRelapses.length === 0) return;

            const quitTime = new Date(quitDates[substance]).getTime();
            let lastTime = quitTime;

            substanceRelapses.forEach(relapse => {
                const relapseTime = relapse.timestamp || new Date(relapse.date).getTime();
                const days = Math.floor((relapseTime - lastTime) / (1000 * 60 * 60 * 24));
                if (days > 0) {
                    streaks.push({ substance, days });
                }
                lastTime = relapseTime;
            });
        });

        if (streaks.length === 0) return null;

        const maxStreak = Math.max(...streaks.map(s => s.days));
        const avgStreak = Math.round(streaks.reduce((a, b) => a + b.days, 0) / streaks.length);

        return { maxStreak, avgStreak, total: streaks.length };
    }, [relapseEntries, quitDates]);

    // No data state
    if (relapseEntries.length === 0) {
        return (
            <HudCard title="RELAPSE ANALYSIS" className="col-span-full">
                <div className="text-center py-12">
                    <div className="text-4xl mb-4">🛡️</div>
                    <div className="text-[var(--neon-green)] font-mono text-lg mb-2">NO INCIDENTS RECORDED</div>
                    <div className="text-[var(--text-secondary)] text-xs font-mono">
                        Keep going strong! This module will help you identify patterns if setbacks occur.
                    </div>
                </div>
            </HudCard>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Day of Week Analysis */}
            <HudCard title="INCIDENT FREQUENCY BY DAY">
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dayOfWeekData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                            <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 10 }} />
                            <YAxis tick={{ fill: '#666', fontSize: 10 }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#000', borderColor: '#333' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="count" fill="#FF003C" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="text-[9px] text-[var(--text-secondary)] font-mono mt-2 text-center">
                    Identify which days you're most vulnerable
                </div>
            </HudCard>

            {/* Time of Day Distribution */}
            <HudCard title="TIME OF DAY DISTRIBUTION">
                <div className="h-48 flex items-center justify-center">
                    {timeOfDayData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={timeOfDayData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {timeOfDayData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', borderColor: '#333' }}
                                    formatter={(value, name) => [`${value} incidents`, name]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-[var(--text-secondary)] text-xs">No time data available</div>
                    )}
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {timeOfDayData.map(d => (
                        <div key={d.name} className="flex items-center gap-1 text-[9px] font-mono">
                            <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                            <span className="text-[var(--text-secondary)]">{d.name.split(' ')[0]}</span>
                        </div>
                    ))}
                </div>
            </HudCard>

            {/* Streak Analysis */}
            {streakAnalysis && (
                <HudCard title="STREAK METRICS">
                    <div className="grid grid-cols-3 gap-4 text-center py-4">
                        <div>
                            <div className="text-3xl font-mono font-bold text-[var(--neon-green)]">
                                {streakAnalysis.maxStreak}
                            </div>
                            <div className="text-[9px] text-[var(--text-secondary)] font-mono">BEST STREAK (DAYS)</div>
                        </div>
                        <div>
                            <div className="text-3xl font-mono font-bold text-[var(--neon-cyan)]">
                                {streakAnalysis.avgStreak}
                            </div>
                            <div className="text-[9px] text-[var(--text-secondary)] font-mono">AVG STREAK (DAYS)</div>
                        </div>
                        <div>
                            <div className="text-3xl font-mono font-bold text-[var(--neon-magenta)]">
                                {streakAnalysis.total}
                            </div>
                            <div className="text-[9px] text-[var(--text-secondary)] font-mono">TOTAL INCIDENTS</div>
                        </div>
                    </div>
                    <div className="text-[9px] text-[var(--text-secondary)] font-mono text-center border-t border-[var(--border-dim)] pt-3">
                        Your resilience is growing with each attempt
                    </div>
                </HudCard>
            )}

            {/* Trigger Analysis */}
            <HudCard title="IDENTIFIED TRIGGERS">
                {triggerAnalysis.length > 0 ? (
                    <div className="space-y-3 py-2">
                        {triggerAnalysis.map(([trigger, count], index) => (
                            <motion.div
                                key={trigger}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-8 h-8 flex items-center justify-center rounded bg-[var(--bg-grid)] border border-[var(--border-dim)]">
                                    {trigger === 'stress' && '😰'}
                                    {trigger === 'social' && '🎉'}
                                    {trigger === 'emotional' && '💔'}
                                    {trigger === 'habitual' && '🔄'}
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-mono text-white capitalize">{trigger}</div>
                                    <div className="w-full h-1 bg-[var(--bg-grid)] rounded mt-1">
                                        <div
                                            className="h-full bg-[var(--neon-magenta)] rounded"
                                            style={{ width: `${(count / relapseEntries.length) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-xs font-mono text-[var(--neon-magenta)]">{count}</div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-[var(--text-secondary)] text-xs font-mono">
                        Add notes to your entries to help identify triggers
                    </div>
                )}
            </HudCard>

            {/* By Substance */}
            {substanceData.length > 1 && (
                <HudCard title="INCIDENTS BY PROTOCOL" className="col-span-full">
                    <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={substanceData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                <XAxis type="number" tick={{ fill: '#666', fontSize: 10 }} allowDecimals={false} />
                                <YAxis dataKey="name" type="category" tick={{ fill: '#666', fontSize: 10 }} width={80} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', borderColor: '#333' }}
                                />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                    {substanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </HudCard>
            )}
        </div>
    );
}
