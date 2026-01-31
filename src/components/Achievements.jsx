import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRecovery } from '../context/RecoveryContext';

const ACHIEVEMENTS = [
    { id: 'first_step', label: 'First Step', desc: 'Started a recovery journey', icon: '🚀', threshold: 0 },
    { id: 'one_week', label: 'Iron Will', desc: '1 week clean streak', icon: '🛡️', threshold: 7 },
    { id: 'one_month', label: 'Ascended', desc: '1 month clean streak', icon: '🦅', threshold: 30 },
    { id: 'three_months', label: 'Sovereign', desc: '3 months clean streak', icon: '👑', threshold: 90 },
    { id: 'saving_master', label: 'Wealth Architect', desc: 'Saved over $1000', icon: '💎', threshold: 1000, type: 'money' }
];

export default function Achievements() {
    const { progress, advancedStats } = useRecovery();

    const unlocked = useMemo(() => {
        const list = [];
        const maxStreak = Math.max(...Object.values(progress).map(p => p?.streak?.days || 0));

        ACHIEVEMENTS.forEach(a => {
            if (a.type === 'money') {
                if (advancedStats.moneySaved >= a.threshold) list.push(a.id);
            } else {
                if (maxStreak >= a.threshold) list.push(a.id);
            }
        });
        return list;
    }, [progress, advancedStats]);

    return (
        <div className="achievements-premium bento-item bento-item--md" style={{ padding: '32px' }}>
            <h4 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>
                <span>🏆</span> Hall of Achievements
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '20px' }}>
                {ACHIEVEMENTS.map((a, index) => {
                    const isUnlocked = unlocked.includes(a.id);
                    return (
                        <motion.div
                            key={a.id}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                opacity: isUnlocked ? 1 : 0.2,
                                filter: isUnlocked ? 'none' : 'grayscale(1)'
                            }}
                        >
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: isUnlocked ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))' : 'rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.8rem',
                                marginBottom: '8px',
                                boxShadow: isUnlocked ? '0 0 20px var(--accent-cyan-dim)' : 'none',
                                border: isUnlocked ? 'none' : '1px solid rgba(255,255,255,0.1)'
                            }}>
                                {a.icon}
                            </div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'white' }}>{a.label}</div>
                        </motion.div>
                    );
                })}
            </div>

            <div style={{ marginTop: '32px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    {unlocked.length} of {ACHIEVEMENTS.length} Achievements Unlocked
                </p>
            </div>
        </div>
    );
}
