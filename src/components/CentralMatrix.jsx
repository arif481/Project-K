import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Html } from '@react-three/drei';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { HudCard } from './HudComponents';
import { useRecovery } from '../context/RecoveryContext';

// 3D Health Orb Component
function HealthOrb({ health }) {
    const meshRef = useRef();
    const glowRef = useRef();
    
    const color = health > 70 ? '#00F0FF' : health > 40 ? '#FFE600' : '#FF0064';
    
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (meshRef.current) {
            meshRef.current.rotation.x = t * 0.2;
            meshRef.current.rotation.y = t * 0.3;
            meshRef.current.scale.setScalar(0.8 + Math.sin(t * 0.5) * 0.05);
        }
        if (glowRef.current) {
            glowRef.current.rotation.z = t * 0.5;
            glowRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.05);
        }
    });
    
    return (
        <group>
            {/* Core sphere */}
            <Float speed={2} rotationIntensity={0.3} floatIntensity={0.3}>
                <mesh ref={meshRef}>
                    <icosahedronGeometry args={[1, 2]} />
                    <MeshDistortMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={0.4}
                        wireframe
                        transparent
                        opacity={0.8}
                        distort={0.2}
                        speed={3}
                    />
                </mesh>
            </Float>
            
            {/* Orbital ring */}
            <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[1.5, 0.02, 16, 100]} />
                <meshBasicMaterial color={color} transparent opacity={0.5} />
            </mesh>
            
            {/* Secondary ring */}
            <mesh rotation={[Math.PI / 3, Math.PI / 6, 0]}>
                <torusGeometry args={[1.7, 0.015, 16, 100]} />
                <meshBasicMaterial color="#9333EA" transparent opacity={0.3} />
            </mesh>
            
            {/* Health percentage display */}
            <Html center position={[0, -2.2, 0]}>
                <div className="text-center whitespace-nowrap">
                    <div className="text-3xl font-mono font-black" style={{ color, textShadow: `0 0 20px ${color}` }}>
                        {Math.round(health)}%
                    </div>
                    <div className="text-[10px] font-mono text-[var(--text-secondary)] tracking-widest">
                        SYSTEM HEALTH
                    </div>
                </div>
            </Html>
        </group>
    );
}

// Animated stat display
function AnimatedStat({ label, value, color, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="text-center"
        >
            <div className="text-[9px] font-mono text-[var(--text-dim)] uppercase tracking-wider mb-1">{label}</div>
            <div className="text-lg font-mono font-bold" style={{ color }}>{value}</div>
        </motion.div>
    );
}

export default function CentralMatrix() {
    const { overallHealth, advancedStats, progress, quitDates } = useRecovery();
    const [viewMode, setViewMode] = useState('3d'); // '3d' or 'radar'

    // Normalize data for Radar Chart (0-100 scale)
    const healthScore = Math.min(overallHealth, 100);
    const moneyScore = Math.min((advancedStats.moneySaved / 10000) * 100, 100);
    const streakScore = Math.min((Object.values(progress).reduce((acc, p) => acc + (p?.streak?.days || 0), 0) / 90) * 100, 100);
    const consistencyScore = Math.min(
        Object.values(quitDates).filter(d => !!d).length * 33,
        100
    );

    const radarData = [
        { subject: 'HEALTH', value: healthScore, fullMark: 100 },
        { subject: 'CAPITAL', value: moneyScore, fullMark: 100 },
        { subject: 'STREAK', value: streakScore, fullMark: 100 },
        { subject: 'FOCUS', value: consistencyScore, fullMark: 100 },
    ];

    // Calculate recovery velocity (progress per day)
    const recoveryVelocity = useMemo(() => {
        const totalDays = Object.values(progress).reduce((acc, p) => acc + (p?.streak?.days || 0), 0);
        const avgHealth = healthScore;
        return totalDays > 0 ? (avgHealth / Math.max(totalDays, 1) * 10).toFixed(1) : '0.0';
    }, [progress, healthScore]);

    return (
        <HudCard 
            title="CORE SYSTEM MATRIX" 
            className="h-full flex flex-col relative overflow-hidden"
        >
            {/* Background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.05)_0%,transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03]" />

            {/* View Toggle */}
            <div className="absolute top-4 right-4 flex gap-1 z-20">
                <button
                    onClick={() => setViewMode('3d')}
                    className={`px-2 py-1 text-[9px] font-mono border transition-all ${
                        viewMode === '3d' 
                            ? 'border-[var(--neon-cyan)] text-[var(--neon-cyan)] bg-[rgba(0,240,255,0.1)]' 
                            : 'border-[var(--border-dim)] text-[var(--text-dim)]'
                    }`}
                >
                    3D ORB
                </button>
                <button
                    onClick={() => setViewMode('radar')}
                    className={`px-2 py-1 text-[9px] font-mono border transition-all ${
                        viewMode === 'radar' 
                            ? 'border-[var(--neon-cyan)] text-[var(--neon-cyan)] bg-[rgba(0,240,255,0.1)]' 
                            : 'border-[var(--border-dim)] text-[var(--text-dim)]'
                    }`}
                >
                    RADAR
                </button>
            </div>

            {/* Main Visualization */}
            <div className="flex-1 relative z-10" style={{ minHeight: '280px' }}>
                {viewMode === '3d' ? (
                    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                        <ambientLight intensity={0.2} />
                        <pointLight position={[10, 10, 10]} color="#00F0FF" intensity={0.5} />
                        <pointLight position={[-10, -10, -10]} color="#FF0064" intensity={0.3} />
                        <Suspense fallback={null}>
                            <HealthOrb health={overallHealth} />
                        </Suspense>
                    </Canvas>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="rgba(0,240,255,0.2)" strokeDasharray="3 3" />
                            <PolarAngleAxis 
                                dataKey="subject" 
                                tick={{ fill: 'var(--neon-cyan)', fontSize: 10, fontFamily: 'monospace' }} 
                            />
                            <PolarRadiusAxis 
                                angle={90} 
                                domain={[0, 100]} 
                                tick={false} 
                                axisLine={false} 
                            />
                            <Radar
                                name="Recovery"
                                dataKey="value"
                                stroke="var(--neon-cyan)"
                                fill="var(--neon-cyan)"
                                fillOpacity={0.2}
                                strokeWidth={2}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Bottom Stats */}
            <div className="relative z-10 grid grid-cols-4 gap-2 pt-4 border-t border-[var(--border-dim)]">
                <AnimatedStat label="Velocity" value={`${recoveryVelocity}x`} color="var(--neon-cyan-hex)" delay={0.1} />
                <AnimatedStat label="Protocols" value={`${Object.values(quitDates).filter(d => !!d).length}/3`} color="var(--neon-green-hex)" delay={0.2} />
                <AnimatedStat label="Saved" value={advancedStats.moneySavedFormatted} color="var(--neon-yellow-hex)" delay={0.3} />
                <AnimatedStat label="Rank" value={advancedStats.currentRank || '-'} color="var(--neon-purple-hex)" delay={0.4} />
            </div>

            {/* Status Footer */}
            <div className="relative z-10 flex justify-between items-center mt-3 pt-2 border-t border-[var(--border-dim)] text-[9px] font-mono text-[var(--text-dim)]">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-green)] animate-pulse" />
                    <span>MATRIX SYNC: ACTIVE</span>
                </div>
                <span>v4.0.0</span>
            </div>
        </HudCard>
    );
}
