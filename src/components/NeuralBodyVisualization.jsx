// NeuralBodyVisualization.jsx - 3D Human Body with Neural Pathways v4.0
// Real-time damage visualization based on user data
import { useRef, useMemo, useState, useEffect, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Html, OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecovery } from '../context/RecoveryContext';
import { HudCard } from './HudComponents';

// ==========================================
// BODY ORGAN SYSTEM DEFINITIONS
// ==========================================
const ORGAN_SYSTEMS = {
    brain: {
        name: 'NEURAL CORTEX',
        position: [0, 2.2, 0],
        size: 0.35,
        affectedBy: { cigarettes: 0.7, cannabis: 0.9, alcohol: 0.8 },
        recoveryDays: { cigarettes: 90, cannabis: 180, alcohol: 365 },
        description: 'Cognitive function, memory, decision-making',
        color: '#FF00FF'
    },
    prefrontalCortex: {
        name: 'PREFRONTAL CORTEX',
        position: [0, 2.35, 0.2],
        size: 0.2,
        affectedBy: { cigarettes: 0.5, cannabis: 0.95, alcohol: 0.85 },
        recoveryDays: { cigarettes: 60, cannabis: 180, alcohol: 270 },
        description: 'Impulse control, planning, judgment',
        color: '#FF44FF'
    },
    heart: {
        name: 'CARDIAC SYSTEM',
        position: [0.1, 0.8, 0.15],
        size: 0.25,
        affectedBy: { cigarettes: 0.95, cannabis: 0.3, alcohol: 0.7 },
        recoveryDays: { cigarettes: 365, cannabis: 30, alcohol: 180 },
        description: 'Cardiovascular health, blood pressure',
        color: '#FF0044'
    },
    lungs: {
        name: 'PULMONARY SYSTEM',
        position: [0, 0.6, 0],
        size: 0.4,
        affectedBy: { cigarettes: 1.0, cannabis: 0.8, alcohol: 0.2 },
        recoveryDays: { cigarettes: 270, cannabis: 90, alcohol: 30 },
        description: 'Respiratory capacity, oxygen absorption',
        color: '#00AAFF'
    },
    liver: {
        name: 'HEPATIC SYSTEM',
        position: [0.25, 0.2, 0.1],
        size: 0.28,
        affectedBy: { cigarettes: 0.4, cannabis: 0.3, alcohol: 1.0 },
        recoveryDays: { cigarettes: 60, cannabis: 30, alcohol: 365 },
        description: 'Toxin filtration, metabolism',
        color: '#884400'
    },
    kidneys: {
        name: 'RENAL SYSTEM',
        position: [0, -0.1, -0.15],
        size: 0.18,
        affectedBy: { cigarettes: 0.5, cannabis: 0.2, alcohol: 0.6 },
        recoveryDays: { cigarettes: 90, cannabis: 30, alcohol: 180 },
        description: 'Blood filtration, toxin elimination',
        color: '#AA4444'
    },
    stomach: {
        name: 'DIGESTIVE SYSTEM',
        position: [-0.1, 0.1, 0.12],
        size: 0.22,
        affectedBy: { cigarettes: 0.6, cannabis: 0.4, alcohol: 0.85 },
        recoveryDays: { cigarettes: 60, cannabis: 14, alcohol: 90 },
        description: 'Digestion, nutrient absorption',
        color: '#FFAA00'
    },
    spine: {
        name: 'CENTRAL NERVOUS SYSTEM',
        position: [0, 0.5, -0.2],
        size: 0.15,
        affectedBy: { cigarettes: 0.3, cannabis: 0.6, alcohol: 0.5 },
        recoveryDays: { cigarettes: 90, cannabis: 120, alcohol: 180 },
        description: 'Neural signal transmission',
        color: '#00FF88'
    },
    bloodVessels: {
        name: 'VASCULAR SYSTEM',
        position: [0, 0.5, 0],
        size: 0.5,
        affectedBy: { cigarettes: 0.9, cannabis: 0.4, alcohol: 0.7 },
        recoveryDays: { cigarettes: 180, cannabis: 30, alcohol: 120 },
        description: 'Blood circulation, vessel elasticity',
        color: '#FF3366'
    },
    immuneSystem: {
        name: 'IMMUNE SYSTEM',
        position: [0, 0.4, 0],
        size: 0.45,
        affectedBy: { cigarettes: 0.7, cannabis: 0.5, alcohol: 0.8 },
        recoveryDays: { cigarettes: 90, cannabis: 45, alcohol: 90 },
        description: 'Disease resistance, healing capacity',
        color: '#00FFAA'
    }
};

// Neural pathway connections
const NEURAL_PATHWAYS = [
    { from: 'brain', to: 'prefrontalCortex', thickness: 3 },
    { from: 'brain', to: 'spine', thickness: 4 },
    { from: 'spine', to: 'heart', thickness: 2 },
    { from: 'spine', to: 'lungs', thickness: 2 },
    { from: 'spine', to: 'liver', thickness: 2 },
    { from: 'spine', to: 'kidneys', thickness: 2 },
    { from: 'spine', to: 'stomach', thickness: 2 },
    { from: 'brain', to: 'heart', thickness: 1 },
    { from: 'heart', to: 'lungs', thickness: 2 },
    { from: 'liver', to: 'kidneys', thickness: 1 },
    { from: 'heart', to: 'bloodVessels', thickness: 3 },
];

// ==========================================
// 3D ORGAN COMPONENT
// ==========================================
function Organ({ id, data, damageLevel, isHovered, onHover, pulsePhase }) {
    const meshRef = useRef();
    const glowRef = useRef();
    
    // Calculate color based on damage (red = damaged, green = healthy)
    const healthLevel = 1 - damageLevel;
    const color = useMemo(() => {
        if (healthLevel > 0.8) return '#00FF88'; // Healthy green
        if (healthLevel > 0.6) return '#88FF00'; // Light green
        if (healthLevel > 0.4) return '#FFFF00'; // Yellow
        if (healthLevel > 0.2) return '#FF8800'; // Orange
        return '#FF0044'; // Damaged red
    }, [healthLevel]);
    
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (meshRef.current) {
            // Pulse effect based on damage level
            const pulseIntensity = 0.1 + damageLevel * 0.15;
            meshRef.current.scale.setScalar(
                data.size * (1 + Math.sin(t * 2 + pulsePhase) * pulseIntensity)
            );
            
            // Subtle rotation
            meshRef.current.rotation.y = t * 0.2;
        }
        if (glowRef.current) {
            glowRef.current.material.opacity = 0.3 + Math.sin(t * 3) * 0.2;
        }
    });
    
    return (
        <group position={data.position}>
            {/* Main organ mesh */}
            <mesh 
                ref={meshRef}
                onPointerEnter={() => onHover(id)}
                onPointerLeave={() => onHover(null)}
            >
                <sphereGeometry args={[data.size, 32, 32]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={isHovered ? 0.8 : 0.4}
                    transparent
                    opacity={0.85}
                    roughness={0.3}
                    metalness={0.7}
                />
            </mesh>
            
            {/* Outer glow */}
            <mesh ref={glowRef} scale={1.3}>
                <sphereGeometry args={[data.size, 16, 16]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.2}
                    depthWrite={false}
                />
            </mesh>
            
            {/* Damage indicator rings */}
            {damageLevel > 0.3 && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[data.size * 1.5, 0.02, 8, 32]} />
                    <meshBasicMaterial color="#FF0044" transparent opacity={damageLevel * 0.8} />
                </mesh>
            )}
            
            {/* Hover label */}
            {isHovered && (
                <Html position={[0, data.size + 0.3, 0]} center>
                    <div className="pointer-events-none whitespace-nowrap px-3 py-2 rounded-lg 
                                    bg-black/90 border border-white/20 backdrop-blur-xl">
                        <div className="text-[10px] font-mono text-white/60">{data.name}</div>
                        <div className="text-sm font-bold font-mono" style={{ color }}>
                            {Math.round(healthLevel * 100)}% HEALTHY
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}

// ==========================================
// NEURAL PATHWAY LINE COMPONENT
// ==========================================
function NeuralPathway({ from, to, thickness, damageLevel, pulsePhase }) {
    const lineRef = useRef();
    const fromPos = ORGAN_SYSTEMS[from]?.position || [0, 0, 0];
    const toPos = ORGAN_SYSTEMS[to]?.position || [0, 0, 0];
    
    const healthLevel = 1 - damageLevel;
    const color = healthLevel > 0.5 ? '#00FF88' : '#FF0044';
    
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (lineRef.current) {
            // Pulse opacity
            lineRef.current.material.opacity = 0.3 + Math.sin(t * 4 + pulsePhase) * 0.3;
        }
    });
    
    // Create curved path points
    const points = useMemo(() => {
        const midPoint = [
            (fromPos[0] + toPos[0]) / 2,
            (fromPos[1] + toPos[1]) / 2 + 0.1,
            (fromPos[2] + toPos[2]) / 2 + 0.1
        ];
        
        const curvePoints = [];
        for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const x = (1 - t) * (1 - t) * fromPos[0] + 2 * (1 - t) * t * midPoint[0] + t * t * toPos[0];
            const y = (1 - t) * (1 - t) * fromPos[1] + 2 * (1 - t) * t * midPoint[1] + t * t * toPos[1];
            const z = (1 - t) * (1 - t) * fromPos[2] + 2 * (1 - t) * t * midPoint[2] + t * t * toPos[2];
            curvePoints.push([x, y, z]);
        }
        return curvePoints;
    }, [fromPos, toPos]);
    
    return (
        <group>
            {points.slice(0, -1).map((point, i) => {
                const nextPoint = points[i + 1];
                const midX = (point[0] + nextPoint[0]) / 2;
                const midY = (point[1] + nextPoint[1]) / 2;
                const midZ = (point[2] + nextPoint[2]) / 2;
                const length = Math.sqrt(
                    Math.pow(nextPoint[0] - point[0], 2) +
                    Math.pow(nextPoint[1] - point[1], 2) +
                    Math.pow(nextPoint[2] - point[2], 2)
                );
                
                return (
                    <mesh
                        key={i}
                        ref={i === 10 ? lineRef : null}
                        position={[midX, midY, midZ]}
                        lookAt={nextPoint}
                        rotation={[Math.PI / 2, 0, 0]}
                    >
                        <cylinderGeometry args={[0.01 * thickness, 0.01 * thickness, length, 8]} />
                        <meshBasicMaterial
                            color={color}
                            transparent
                            opacity={0.6}
                        />
                    </mesh>
                );
            })}
        </group>
    );
}

// ==========================================
// HUMAN BODY OUTLINE
// ==========================================
function HumanBodyOutline({ overallHealth }) {
    const bodyRef = useRef();
    const color = overallHealth > 70 ? '#00FF88' : overallHealth > 40 ? '#FFFF00' : '#FF0044';
    
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (bodyRef.current) {
            bodyRef.current.rotation.y = Math.sin(t * 0.3) * 0.1;
        }
    });
    
    return (
        <group ref={bodyRef}>
            {/* Head */}
            <mesh position={[0, 2.2, 0]}>
                <sphereGeometry args={[0.25, 32, 32]} />
                <meshStandardMaterial color={color} transparent opacity={0.15} wireframe />
            </mesh>
            
            {/* Torso */}
            <mesh position={[0, 0.8, 0]}>
                <cylinderGeometry args={[0.35, 0.45, 1.4, 32]} />
                <meshStandardMaterial color={color} transparent opacity={0.1} wireframe />
            </mesh>
            
            {/* Pelvis */}
            <mesh position={[0, -0.2, 0]}>
                <cylinderGeometry args={[0.45, 0.35, 0.4, 32]} />
                <meshStandardMaterial color={color} transparent opacity={0.1} wireframe />
            </mesh>
            
            {/* Neck */}
            <mesh position={[0, 1.7, 0]}>
                <cylinderGeometry args={[0.12, 0.15, 0.3, 16]} />
                <meshStandardMaterial color={color} transparent opacity={0.1} wireframe />
            </mesh>
            
            {/* Arms */}
            <mesh position={[0.55, 0.9, 0]} rotation={[0, 0, -0.3]}>
                <cylinderGeometry args={[0.08, 0.1, 0.8, 16]} />
                <meshStandardMaterial color={color} transparent opacity={0.1} wireframe />
            </mesh>
            <mesh position={[-0.55, 0.9, 0]} rotation={[0, 0, 0.3]}>
                <cylinderGeometry args={[0.08, 0.1, 0.8, 16]} />
                <meshStandardMaterial color={color} transparent opacity={0.1} wireframe />
            </mesh>
            
            {/* Legs */}
            <mesh position={[0.2, -0.9, 0]}>
                <cylinderGeometry args={[0.12, 0.15, 1.2, 16]} />
                <meshStandardMaterial color={color} transparent opacity={0.1} wireframe />
            </mesh>
            <mesh position={[-0.2, -0.9, 0]}>
                <cylinderGeometry args={[0.12, 0.15, 1.2, 16]} />
                <meshStandardMaterial color={color} transparent opacity={0.1} wireframe />
            </mesh>
        </group>
    );
}

// ==========================================
// PARTICLE FIELD (Blood/Neural activity)
// ==========================================
function ParticleField({ count = 100, overallHealth }) {
    const pointsRef = useRef();
    
    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            // Distribute particles within body shape
            const theta = Math.random() * Math.PI * 2;
            const y = (Math.random() - 0.3) * 3;
            const radius = 0.3 + Math.random() * 0.3;
            
            positions[i * 3] = Math.cos(theta) * radius;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = Math.sin(theta) * radius;
            
            // Color based on health
            const isHealthy = Math.random() < overallHealth / 100;
            colors[i * 3] = isHealthy ? 0 : 1;
            colors[i * 3 + 1] = isHealthy ? 1 : 0;
            colors[i * 3 + 2] = isHealthy ? 0.5 : 0.25;
        }
        
        return { positions, colors };
    }, [count, overallHealth]);
    
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (pointsRef.current) {
            pointsRef.current.rotation.y = t * 0.1;
            
            const positions = pointsRef.current.geometry.attributes.position.array;
            for (let i = 0; i < count; i++) {
                positions[i * 3 + 1] += Math.sin(t + i) * 0.002;
            }
            pointsRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });
    
    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={particles.positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    array={particles.colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.03}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation
            />
        </points>
    );
}

// ==========================================
// MAIN 3D SCENE
// ==========================================
function BodyScene({ organHealth, overallHealth, hoveredOrgan, setHoveredOrgan }) {
    return (
        <>
            <ambientLight intensity={0.3} />
            <pointLight position={[5, 5, 5]} intensity={1} color="#00F0FF" />
            <pointLight position={[-5, 5, -5]} intensity={0.8} color="#FF00FF" />
            <pointLight position={[0, -3, 3]} intensity={0.5} color="#00FF88" />
            
            <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
                <group>
                    {/* Human body wireframe outline */}
                    <HumanBodyOutline overallHealth={overallHealth} />
                    
                    {/* Organs */}
                    {Object.entries(ORGAN_SYSTEMS).map(([id, data], index) => (
                        <Organ
                            key={id}
                            id={id}
                            data={data}
                            damageLevel={organHealth[id] || 0}
                            isHovered={hoveredOrgan === id}
                            onHover={setHoveredOrgan}
                            pulsePhase={index * 0.5}
                        />
                    ))}
                    
                    {/* Neural pathways */}
                    {NEURAL_PATHWAYS.map((pathway, index) => {
                        const avgDamage = ((organHealth[pathway.from] || 0) + (organHealth[pathway.to] || 0)) / 2;
                        return (
                            <NeuralPathway
                                key={index}
                                {...pathway}
                                damageLevel={avgDamage}
                                pulsePhase={index * 0.3}
                            />
                        );
                    })}
                    
                    {/* Particle field */}
                    <ParticleField count={150} overallHealth={overallHealth} />
                </group>
            </Float>
            
            <OrbitControls
                enablePan={false}
                enableZoom={true}
                minDistance={2}
                maxDistance={8}
                autoRotate
                autoRotateSpeed={0.5}
            />
        </>
    );
}

// ==========================================
// ORGAN STATUS PANEL
// ==========================================
function OrganStatusPanel({ organHealth, hoveredOrgan }) {
    const sortedOrgans = useMemo(() => {
        return Object.entries(ORGAN_SYSTEMS)
            .map(([id, data]) => ({
                id,
                ...data,
                damage: organHealth[id] || 0,
                health: 100 - (organHealth[id] || 0) * 100
            }))
            .sort((a, b) => b.damage - a.damage);
    }, [organHealth]);
    
    return (
        <div className="absolute right-4 top-4 w-64 max-h-[calc(100%-2rem)] overflow-y-auto
                        bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-3
                        scrollbar-thin scrollbar-thumb-white/20">
            <div className="text-[10px] font-mono text-white/50 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                SYSTEM STATUS
            </div>
            
            <div className="space-y-2">
                {sortedOrgans.map(organ => {
                    const isHovered = hoveredOrgan === organ.id;
                    const healthColor = organ.health > 80 ? '#00FF88' : 
                                       organ.health > 50 ? '#FFFF00' : '#FF0044';
                    
                    return (
                        <motion.div
                            key={organ.id}
                            animate={{ 
                                scale: isHovered ? 1.02 : 1,
                                borderColor: isHovered ? healthColor : 'rgba(255,255,255,0.1)'
                            }}
                            className="p-2 rounded-lg border transition-colors"
                            style={{ background: `${healthColor}08` }}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] font-mono text-white/70">{organ.name}</span>
                                <span 
                                    className="text-[10px] font-mono font-bold"
                                    style={{ color: healthColor }}
                                >
                                    {Math.round(organ.health)}%
                                </span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ background: healthColor }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${organ.health}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

// ==========================================
// DAMAGE CALCULATION BASED ON USER DATA
// ==========================================
function calculateOrganDamage(userProfile, quitDates, progress, entries) {
    const organHealth = {};
    
    if (!userProfile) {
        // Return default moderate damage if no profile
        Object.keys(ORGAN_SYSTEMS).forEach(id => {
            organHealth[id] = 0.3;
        });
        return organHealth;
    }
    
    Object.entries(ORGAN_SYSTEMS).forEach(([organId, organ]) => {
        let totalDamage = 0;
        let relevantSubstances = 0;
        
        Object.entries(organ.affectedBy).forEach(([substance, impactFactor]) => {
            if (impactFactor < 0.1) return; // Skip minimal impact
            
            const profile = userProfile[substance];
            if (!profile || !profile.usageStartDate) return;
            
            relevantSubstances++;
            
            // Calculate years of usage
            const usageStartDate = new Date(profile.usageStartDate);
            const quitDate = quitDates[substance] ? new Date(quitDates[substance]) : new Date();
            const yearsOfUse = (quitDate - usageStartDate) / (365.25 * 24 * 60 * 60 * 1000);
            
            // Frequency multiplier (daily = 1, weekly = 0.3, monthly = 0.1, rarely = 0.05)
            const frequencyMultiplier = {
                'multiple-daily': 1.2,
                'daily': 1.0,
                'weekly': 0.4,
                'monthly': 0.15,
                'rarely': 0.05
            }[profile.frequency] || 0.5;
            
            // Amount multiplier
            const amountMultiplier = {
                'heavy': 1.2,
                'moderate': 0.8,
                'light': 0.4
            }[profile.amount] || 0.6;
            
            // Base damage from usage history
            let baseDamage = Math.min(1, (yearsOfUse * frequencyMultiplier * amountMultiplier * impactFactor) / 10);
            
            // Recovery factor - reduce damage based on days clean
            if (quitDates[substance] && progress[substance]) {
                const daysSober = progress[substance]?.streak?.days || 0;
                const recoveryDays = organ.recoveryDays[substance] || 180;
                const recoveryProgress = Math.min(1, daysSober / recoveryDays);
                
                // Damage reduces as recovery progresses
                baseDamage *= (1 - recoveryProgress * 0.9);
            }
            
            // Recent relapse increases damage
            const recentRelapses = entries.filter(e => 
                e.type === 'relapse' && 
                e.substance === substance &&
                Date.now() - e.timestamp < 7 * 24 * 60 * 60 * 1000
            ).length;
            
            if (recentRelapses > 0) {
                baseDamage = Math.min(1, baseDamage + recentRelapses * 0.1);
            }
            
            totalDamage += baseDamage;
        });
        
        organHealth[organId] = relevantSubstances > 0 
            ? Math.min(1, totalDamage / relevantSubstances)
            : 0;
    });
    
    return organHealth;
}

// ==========================================
// MAIN EXPORT COMPONENT
// ==========================================
export default function NeuralBodyVisualization({ userProfile, compact = false }) {
    const { quitDates, progress, entries, overallHealth: contextHealth } = useRecovery();
    const [hoveredOrgan, setHoveredOrgan] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    
    // Calculate organ damage based on user data
    const organHealth = useMemo(() => {
        return calculateOrganDamage(userProfile, quitDates, progress, entries);
    }, [userProfile, quitDates, progress, entries]);
    
    // Calculate overall health
    const overallHealth = useMemo(() => {
        const damages = Object.values(organHealth);
        if (damages.length === 0) return 100;
        const avgDamage = damages.reduce((a, b) => a + b, 0) / damages.length;
        return Math.round((1 - avgDamage) * 100);
    }, [organHealth]);
    
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 500);
        return () => clearTimeout(timer);
    }, []);
    
    if (compact) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative w-full h-[300px] rounded-xl overflow-hidden
                           bg-gradient-to-br from-black via-[#050810] to-black
                           border border-white/10"
            >
                <Canvas camera={{ position: [0, 0.5, 4], fov: 50 }}>
                    <Suspense fallback={null}>
                        <BodyScene
                            organHealth={organHealth}
                            overallHealth={overallHealth}
                            hoveredOrgan={hoveredOrgan}
                            setHoveredOrgan={setHoveredOrgan}
                        />
                    </Suspense>
                </Canvas>
                
                {/* Compact health display */}
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center
                                bg-black/60 backdrop-blur-xl rounded-lg px-3 py-2 border border-white/10">
                    <span className="text-[10px] font-mono text-white/50">NEURAL INTEGRITY</span>
                    <span 
                        className="text-lg font-mono font-bold"
                        style={{ color: overallHealth > 70 ? '#00FF88' : overallHealth > 40 ? '#FFFF00' : '#FF0044' }}
                    >
                        {overallHealth}%
                    </span>
                </div>
            </motion.div>
        );
    }
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.6 }}
            className="relative w-full h-[600px] rounded-2xl overflow-hidden
                       bg-gradient-to-br from-black via-[#050810] to-black
                       border border-white/10"
        >
            {/* Scanline overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 
                            bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)]" />
            
            {/* Header */}
            <div className="absolute top-4 left-4 z-20">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full animate-pulse"
                         style={{ background: overallHealth > 70 ? '#00FF88' : overallHealth > 40 ? '#FFFF00' : '#FF0044' }} />
                    <span className="text-[11px] font-mono text-white/60 tracking-widest">
                        NEURAL BODY MATRIX
                    </span>
                </div>
                <div className="text-4xl font-mono font-black tracking-tight"
                     style={{ color: overallHealth > 70 ? '#00FF88' : overallHealth > 40 ? '#FFFF00' : '#FF0044' }}>
                    {overallHealth}%
                    <span className="text-sm font-normal text-white/40 ml-2">INTEGRITY</span>
                </div>
            </div>
            
            {/* 3D Canvas */}
            <Canvas camera={{ position: [0, 0.5, 5], fov: 45 }}>
                <Suspense fallback={null}>
                    <BodyScene
                        organHealth={organHealth}
                        overallHealth={overallHealth}
                        hoveredOrgan={hoveredOrgan}
                        setHoveredOrgan={setHoveredOrgan}
                    />
                </Suspense>
            </Canvas>
            
            {/* Organ Status Panel */}
            <OrganStatusPanel organHealth={organHealth} hoveredOrgan={hoveredOrgan} />
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 flex items-center gap-4 text-[9px] font-mono text-white/50">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#00FF88]" />
                    HEALTHY
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#FFFF00]" />
                    RECOVERING
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#FF0044]" />
                    DAMAGED
                </div>
            </div>
            
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00F0FF]/30" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00F0FF]/30" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#00F0FF]/30" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00F0FF]/30" />
        </motion.div>
    );
}

// Export sub-components for flexible use
export { ORGAN_SYSTEMS, calculateOrganDamage };
