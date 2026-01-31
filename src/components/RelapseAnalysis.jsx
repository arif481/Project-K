import { useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { HudCard } from './HudComponents';
import { useRecovery } from '../context/RecoveryContext';

export default function AnalyticsConsole() {
    const { entries, progress } = useRecovery();

    // 1. Prepare Trend Data
    const trendData = useMemo(() => {
        // Sort entries by date
        const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));

        // Aggregate data points (mocking continuous data for demo if sparse)
        if (sorted.length === 0) return [];

        return sorted.map(e => ({
            date: new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            mood: e.feeling || 50,
            craving: e.craving || 0,
            relapse: e.type === 'relapse' ? 100 : 0
        }));
    }, [entries]);

    // 2. Prepare Radar Data (Substance Comparison)
    const radarData = useMemo(() => {
        return [
            { subject: 'Streak', A: progress.cigarettes?.streak?.days || 0, B: progress.cannabis?.streak?.days || 0, C: progress.alcohol?.streak?.days || 0, fullMark: 100 },
            { subject: 'Health', A: 80, B: 70, C: 60, fullMark: 100 }, // Using placeholders for now, connect to real health later
            { subject: 'Money', A: 90, B: 50, C: 40, fullMark: 100 },
            { subject: 'Mood', A: 65, B: 85, C: 45, fullMark: 100 },
        ];
    }, [progress]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* HUD: MAIN TELEMETRY */}
            <HudCard title="BIO-METRIC TRENDS" className="min-h-[300px]">
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
                            <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 10 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="mood" stroke="#00F0FF" fillOpacity={1} fill="url(#colorMood)" />
                            <Area type="monotone" dataKey="craving" stroke="#FF003C" fillOpacity={1} fill="url(#colorCraving)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </HudCard>

            {/* HUD: SYSTEM COMPARISON */}
            <HudCard title="SUBSTANCE MATRIX" className="min-h-[300px]">
                <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="#333" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#00F0FF', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#333" />
                            <Radar name="Cigarettes" dataKey="A" stroke="#00F0FF" fill="#00F0FF" fillOpacity={0.3} />
                            <Radar name="Cannabis" dataKey="B" stroke="#00FF9F" fill="#00FF9F" fillOpacity={0.3} />
                            <Radar name="Alcohol" dataKey="C" stroke="#FCEE0A" fill="#FCEE0A" fillOpacity={0.3} />
                            <Legend formatter={(value) => <span style={{ color: '#fff' }}>{value}</span>} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </HudCard>
        </div>
    );
}
