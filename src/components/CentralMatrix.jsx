import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { HudCard } from './HudComponents';
import { useRecovery } from '../context/RecoveryContext';

export default function CentralMatrix() {
    const { overallHealth, advancedStats, progress } = useRecovery();

    // Normalize data for Radar Chart (0-100 scale)
    const healthScore = Math.min(overallHealth, 100);
    const moneyScore = Math.min((advancedStats.moneySaved / 5000) * 100, 100); // 5000 INR target
    const streakScore = Math.min((Object.values(progress).reduce((acc, p) => acc + (p?.streak?.days || 0), 0) / 30) * 100, 100);
    const moodScore = 75; // Placeholder until mood module deeper integration

    const data = [
        { subject: 'HEALTH', A: healthScore, fullMark: 100 },
        { subject: 'CAPITAL', A: moneyScore, fullMark: 100 },
        { subject: 'STREAK', A: streakScore, fullMark: 100 },
        { subject: 'MOOD', A: moodScore, fullMark: 100 },
    ];

    return (
        <HudCard title="CORE SYSTEM MATRIX" className="row-span-2 h-full flex flex-col items-center justify-center relative overflow-hidden bg-black/50">

            {/* Background Grid Animation */}
            <div className="absolute inset-0 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:20px_20px] opacity-10 animate-pulse" />

            <div className="w-full h-[300px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#333" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--neon-cyan)', fontSize: 10, fontFamily: 'monospace' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Recovery"
                            dataKey="A"
                            stroke="var(--neon-cyan)"
                            fill="var(--neon-cyan)"
                            fillOpacity={0.3}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="absolute bottom-4 w-full px-6 flex justify-between text-[10px] font-mono text-[var(--text-secondary)]">
                <div>SYNC: ACTIVE</div>
                <div>MATRIX v2.5</div>
            </div>
        </HudCard>
    );
}
