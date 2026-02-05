// NeuralBodyVisualization.jsx - Iron Man Style Holographic Body v6.0
// Real-time damage visualization based on user data - WIREFRAME MESH STYLE
import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, OrbitControls, Line, MeshTransmissionMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useRecovery } from '../context/RecoveryContext';
import * as THREE from 'three';

// ==========================================
// ORGAN SYSTEM DEFINITIONS - ANATOMICAL POSITIONS
// ==========================================
const ORGAN_SYSTEMS = {
    brain: {
        name: 'BRAIN',
        displayName: 'Neural Cortex',
        position: [0, 1.65, 0.05],
        icon: '🧠',
        affectedBy: { cigarettes: 0.7, cannabis: 0.9, alcohol: 0.8 },
        recoveryDays: { cigarettes: 90, cannabis: 180, alcohol: 365 },
        description: 'Cognitive function & memory'
    },
    heart: {
        name: 'HEART',
        displayName: 'Cardiac System',
        position: [0.08, 0.85, 0.12],
        icon: '❤️',
        affectedBy: { cigarettes: 0.95, cannabis: 0.3, alcohol: 0.7 },
        recoveryDays: { cigarettes: 365, cannabis: 30, alcohol: 180 },
        description: 'Cardiovascular health'
    },
    lungs: {
        name: 'LUNGS',
        displayName: 'Pulmonary System',
        position: [0, 0.75, 0.08],
        icon: '🫁',
        affectedBy: { cigarettes: 1.0, cannabis: 0.8, alcohol: 0.2 },
        recoveryDays: { cigarettes: 270, cannabis: 90, alcohol: 30 },
        description: 'Respiratory capacity'
    },
    liver: {
        name: 'LIVER',
        displayName: 'Hepatic System',
        position: [0.12, 0.45, 0.1],
        icon: '🫀',
        affectedBy: { cigarettes: 0.4, cannabis: 0.3, alcohol: 1.0 },
        recoveryDays: { cigarettes: 60, cannabis: 30, alcohol: 365 },
        description: 'Toxin filtration'
    },
    kidneys: {
        name: 'KIDNEYS',
        displayName: 'Renal System',
        position: [0, 0.25, -0.05],
        icon: '🫘',
        affectedBy: { cigarettes: 0.5, cannabis: 0.2, alcohol: 0.6 },
        recoveryDays: { cigarettes: 90, cannabis: 30, alcohol: 180 },
        description: 'Blood filtration'
    },
    stomach: {
        name: 'STOMACH',
        displayName: 'Digestive System',
        position: [-0.08, 0.4, 0.1],
        icon: '🔶',
        affectedBy: { cigarettes: 0.6, cannabis: 0.4, alcohol: 0.85 },
        recoveryDays: { cigarettes: 60, cannabis: 14, alcohol: 90 },
        description: 'Nutrient absorption'
    },
    nervous: {
        name: 'NERVOUS',
        displayName: 'Central Nervous System',
        position: [0, 0.5, -0.12],
        icon: '⚡',
        affectedBy: { cigarettes: 0.5, cannabis: 0.7, alcohol: 0.6 },
        recoveryDays: { cigarettes: 90, cannabis: 120, alcohol: 180 },
        description: 'Neural signal transmission'
    },
    immune: {
        name: 'IMMUNE',
        displayName: 'Immune System',
        position: [0, 0.6, 0],
        icon: '🛡️',
        affectedBy: { cigarettes: 0.7, cannabis: 0.5, alcohol: 0.8 },
        recoveryDays: { cigarettes: 90, cannabis: 45, alcohol: 90 },
        description: 'Disease resistance'
    }
};

// Neural pathway connections
const NEURAL_PATHWAYS = [
    { from: 'brain', to: 'heart' },
    { from: 'brain', to: 'lungs' },
    { from: 'brain', to: 'liver' },
    { from: 'brain', to: 'kidneys' },
    { from: 'brain', to: 'stomach' },
    { from: 'brain', to: 'nervous' },
    { from: 'heart', to: 'lungs' },
    { from: 'liver', to: 'kidneys' },
    { from: 'nervous', to: 'immune' },
];

// ==========================================
// HOLOGRAPHIC WIREFRAME HUMAN BODY - IRON MAN STYLE
// ==========================================
function HolographicBody({ overallHealth }) {
    const bodyRef = useRef();
    const innerGlowRef = useRef();
    const pulseRef = useRef();
    const scanRef = useRef();
    
    const healthColor = useMemo(() => {
        if (overallHealth > 70) return '#00F0FF';
        if (overallHealth > 40) return '#FFE600';
        return '#FF0044';
    }, [overallHealth]);
    
    const secondaryColor = useMemo(() => {
        if (overallHealth > 70) return '#00FF88';
        if (overallHealth > 40) return '#FF8800';
        return '#FF0044';
    }, [overallHealth]);
    
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        
        if (bodyRef.current) {
            bodyRef.current.rotation.y = Math.sin(t * 0.2) * 0.08;
        }
        
        if (innerGlowRef.current) {
            innerGlowRef.current.material.opacity = 0.08 + Math.sin(t * 1.5) * 0.04;
        }
        
        if (pulseRef.current) {
            const scale = 1 + Math.sin(t * 2) * 0.02;
            pulseRef.current.scale.set(scale, scale, scale);
        }
        
        if (scanRef.current) {
            scanRef.current.position.y = ((t * 0.5) % 3.8) - 1.7;
        }
    });
    
    return (
        <group ref={bodyRef}>
            {/* ===== HEAD ===== */}
            <group position={[0, 1.7, 0]}>
                {/* Skull wireframe */}
                <mesh>
                    <sphereGeometry args={[0.2, 16, 12]} />
                    <meshBasicMaterial color={healthColor} wireframe transparent opacity={0.6} />
                </mesh>
                {/* Inner glow */}
                <mesh>
                    <sphereGeometry args={[0.18, 12, 8]} />
                    <meshBasicMaterial color={healthColor} transparent opacity={0.15} />
                </mesh>
                {/* Face plate */}
                <mesh position={[0, -0.02, 0.12]}>
                    <planeGeometry args={[0.18, 0.22]} />
                    <meshBasicMaterial color={healthColor} wireframe transparent opacity={0.4} />
                </mesh>
            </group>
            
            {/* ===== NECK ===== */}
            <mesh position={[0, 1.48, 0]}>
                <cylinderGeometry args={[0.06, 0.08, 0.15, 8]} />
                <meshBasicMaterial color={healthColor} wireframe transparent opacity={0.5} />
            </mesh>
            
            {/* ===== TORSO - RIBCAGE ===== */}
            <group position={[0, 1.05, 0]}>
                {/* Main torso cage */}
                <mesh ref={pulseRef}>
                    <cylinderGeometry args={[0.22, 0.28, 0.7, 12, 4, true]} />
                    <meshBasicMaterial color={healthColor} wireframe transparent opacity={0.55} />
                </mesh>
                {/* Inner chest glow */}
                <mesh ref={innerGlowRef}>
                    <cylinderGeometry args={[0.18, 0.24, 0.65, 8]} />
                    <meshBasicMaterial color={secondaryColor} transparent opacity={0.1} />
                </mesh>
                {/* Spine detail */}
                <mesh position={[0, 0, -0.2]}>
                    <boxGeometry args={[0.04, 0.65, 0.04]} />
                    <meshBasicMaterial color={healthColor} wireframe transparent opacity={0.4} />
                </mesh>
                {/* Horizontal rib lines */}
                {[-0.25, -0.1, 0.05, 0.2].map((y, i) => (
                    <mesh key={i} position={[0, y, 0.1]} rotation={[0.2, 0, 0]}>
                        <torusGeometry args={[0.2 - i * 0.02, 0.008, 4, 16, Math.PI]} />
                        <meshBasicMaterial color={healthColor} transparent opacity={0.35} />
                    </mesh>
                ))}
            </group>
            
            {/* ===== ABDOMEN ===== */}
            <group position={[0, 0.5, 0]}>
                <mesh>
                    <cylinderGeometry args={[0.28, 0.22, 0.4, 10, 2, true]} />
                    <meshBasicMaterial color={healthColor} wireframe transparent opacity={0.45} />
                </mesh>
                {/* Pelvis */}
                <mesh position={[0, -0.25, 0]}>
                    <cylinderGeometry args={[0.22, 0.25, 0.15, 8]} />
                    <meshBasicMaterial color={healthColor} wireframe transparent opacity={0.4} />
                </mesh>
            </group>
            
            {/* ===== SHOULDERS ===== */}
            {[-1, 1].map((side) => (
                <group key={side} position={[side * 0.32, 1.32, 0]}>
                    <mesh>
                        <sphereGeometry args={[0.08, 8, 6]} />
                        <meshBasicMaterial color={healthColor} wireframe transparent opacity={0.5} />
                    </mesh>
                </group>
            ))}
            
            {/* ===== ARMS ===== */}
            {[-1, 1].map((side) => (
                <group key={side}>
                    {/* Upper arm */}
                    <mesh position={[side * 0.38, 1.1, 0]} rotation={[0, 0, side * 0.15]}>
                        <cylinderGeometry args={[0.05, 0.06, 0.4, 8]} />
                        <meshBasicMaterial color={healthColor} wireframe transparent opacity={0.45} />
                    </mesh>
                    {/* Elbow joint */}
                    <mesh position={[side * 0.42, 0.85, 0]}>
                        <sphereGeometry args={[0.045, 6, 4]} />
                        <meshBasicMaterial color={healthColor} wireframe transparent opacity={0.4} />
                    </mesh>
                    {/* Forearm */}
                    <mesh position={[side * 0.44, 0.6, 0]} rotation={[0, 0, side * 0.1]}>
                        <cylinderGeometry args={[0.035, 0.05, 0.4, 6]} />
                        <meshBasicMaterial color={healthColor} wireframe transparent opacity={0.4} />
                    </mesh>
                    {/* Hand */}
                    <mesh position={[side * 0.45, 0.35, 0]}>
                        <boxGeometry args={[0.06, 0.1, 0.03]} />
                        <meshBasicMaterial color={healthColor} wireframe transparent opacity={0.35} />
                    </mesh>
                </group>
            ))}
            
            {/* ===== LEGS ===== */}
            {[-1, 1].map((side) => (
                <group key={side}>
                    {/* Hip joint */}
                    <mesh position={[side * 0.12, 0.18, 0]}>
                        <sphereGeometry args={[0.06, 6, 4]} />
                        <meshBasicMaterial color={healthColor} wireframe transparent opacity={0.4} />
                    </mesh>
                    {/* Upper leg */}
                    <mesh position={[side * 0.14, -0.15, 0]}>
                        <cylinderGeometry args={[0.06, 0.08, 0.55, 8]} />
                        <meshBasicMaterial color={healthColor} wireframe transparent opacity={0.45} />
                    </mesh>
                    {/* Knee joint */}
                    <mesh position={[side * 0.14, -0.48, 0]}>
                        <sphereGeometry args={[0.055, 6, 4]} />
                        <meshBasicMaterial color={healthColor} wireframe transparent opacity={0.4} />
                    </mesh>
                    {/* Lower leg */}
                    <mesh position={[side * 0.13, -0.85, 0]}>
                        <cylinderGeometry args={[0.04, 0.055, 0.6, 6]} />
                        <meshBasicMaterial color={healthColor} wireframe transparent opacity={0.4} />
                    </mesh>
                    {/* Foot */}
                    <mesh position={[side * 0.13, -1.2, 0.04]}>
                        <boxGeometry args={[0.07, 0.06, 0.15]} />
                        <meshBasicMaterial color={healthColor} wireframe transparent opacity={0.35} />
                    </mesh>
                </group>
            ))}
            
            {/* ===== SCANNING EFFECT ===== */}
            <mesh ref={scanRef} position={[0, 0, 0.1]}>
                <planeGeometry args={[1.2, 0.02]} />
                <meshBasicMaterial color="#00F0FF" transparent opacity={0.9} side={THREE.DoubleSide} />
            </mesh>
            <mesh ref={scanRef} position={[0, 0, 0.1]}>
                <planeGeometry args={[1.3, 0.1]} />
                <meshBasicMaterial color="#00F0FF" transparent opacity={0.15} side={THREE.DoubleSide} />
            </mesh>
            
            {/* ===== ENERGY FIELD / AURA ===== */}
            <mesh>
                <cylinderGeometry args={[0.5, 0.4, 3, 16, 8, true]} />
                <meshBasicMaterial color={healthColor} wireframe transparent opacity={0.08} />
            </mesh>
            
            {/* ===== CIRCULAR DATA RINGS ===== */}
            {[1.8, 1.0, 0.2, -0.6].map((y, i) => (
                <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.4 + i * 0.05, 0.42 + i * 0.05, 32]} />
                    <meshBasicMaterial color={healthColor} transparent opacity={0.15 - i * 0.02} side={THREE.DoubleSide} />
                </mesh>
            ))}
        </group>
    );
}

// ==========================================
// ORGAN NODE - FUTURISTIC INDICATOR
// ==========================================
function OrganNode({ id, data, damageLevel, isHovered, isSelected, onHover, onClick }) {
    const groupRef = useRef();
    const ringRef = useRef();
    const pulseRef = useRef();
    const baseY = useRef(data.position[1]);
    
    const healthLevel = 1 - damageLevel;
    
    // Color based on health
    const color = useMemo(() => {
        if (healthLevel > 0.8) return '#00FF88';
        if (healthLevel > 0.6) return '#88FF00';
        if (healthLevel > 0.4) return '#FFE600';
        if (healthLevel > 0.2) return '#FF8800';
        return '#FF0044';
    }, [healthLevel]);
    
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        
        if (groupRef.current) {
            // Subtle floating
            groupRef.current.position.y = baseY.current + Math.sin(t * 2 + data.position[0] * 5) * 0.008;
        }
        
        if (ringRef.current) {
            ringRef.current.rotation.z = t * 0.5;
        }
        
        if (pulseRef.current) {
            const scale = 1 + Math.sin(t * 3) * 0.15 * (damageLevel > 0.5 ? 1 : 0.3);
            pulseRef.current.scale.setScalar(scale);
        }
    });
    
    return (
        <group 
            ref={groupRef}
            position={data.position}
            onPointerEnter={() => onHover(id)}
            onPointerLeave={() => onHover(null)}
            onClick={() => onClick(id)}
        >
            {/* Main indicator dot */}
            <mesh ref={pulseRef}>
                <sphereGeometry args={[0.035, 16, 16]} />
                <meshBasicMaterial color={color} />
            </mesh>
            
            {/* Inner glow */}
            <mesh>
                <sphereGeometry args={[0.05, 12, 12]} />
                <meshBasicMaterial color={color} transparent opacity={0.3} />
            </mesh>
            
            {/* Outer ring */}
            <mesh ref={ringRef}>
                <torusGeometry args={[0.06, 0.006, 8, 24]} />
                <meshBasicMaterial color={color} transparent opacity={0.9} />
            </mesh>
            
            {/* Health arc indicator */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.075, 0.085, 32, 1, 0, Math.PI * 2 * healthLevel]} />
                <meshBasicMaterial color={color} transparent opacity={0.7} side={THREE.DoubleSide} />
            </mesh>
            
            {/* Background arc (empty part) */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.075, 0.085, 32, 1, Math.PI * 2 * healthLevel, Math.PI * 2 * (1 - healthLevel)]} />
                <meshBasicMaterial color="#FFFFFF" transparent opacity={0.1} side={THREE.DoubleSide} />
            </mesh>
            
            {/* Critical warning pulse for damaged organs */}
            {damageLevel > 0.5 && (
                <mesh>
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshBasicMaterial 
                        color="#FF0044"
                        transparent
                        opacity={0.15}
                        wireframe
                    />
                </mesh>
            )}
            
            {/* Hover/Selected state info panel */}
            {(isHovered || isSelected) && (
                <>
                    {/* Connection line to label */}
                    <Line
                        points={[[0, 0, 0], [data.position[0] > 0 ? 0.25 : -0.25, 0.12, 0]]}
                        color="#00F0FF"
                        lineWidth={1}
                        transparent
                        opacity={0.8}
                    />
                    
                    {/* Expanded selection ring */}
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.1, 0.115, 6]} />
                        <meshBasicMaterial color="#00F0FF" transparent opacity={0.7} side={THREE.DoubleSide} />
                    </mesh>
                    
                    {/* Info panel */}
                    <Html position={[data.position[0] > 0 ? 0.3 : -0.3, 0.12, 0]} center={false}>
                        <div className="pointer-events-none whitespace-nowrap">
                            <div 
                                className="px-3 py-2 rounded-lg bg-black/95 border-2 backdrop-blur-xl"
                                style={{ borderColor: color, boxShadow: `0 0 20px ${color}40` }}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-base">{data.icon}</span>
                                    <span className="text-[11px] font-mono font-bold text-white">{data.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="text-2xl font-mono font-black"
                                        style={{ color }}
                                    >
                                        {Math.round(healthLevel * 100)}%
                                    </div>
                                    <div className="text-[9px] font-mono text-white/50 max-w-[100px]">
                                        {data.description}
                                    </div>
                                </div>
                                {/* Mini health bar */}
                                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${healthLevel * 100}%`, background: color }}
                                    />
                                </div>
                                <div className="mt-1 text-[8px] font-mono text-white/30">
                                    {healthLevel > 0.8 ? '● OPTIMAL' : healthLevel > 0.5 ? '● RECOVERING' : '● CRITICAL'}
                                </div>
                            </div>
                        </div>
                    </Html>
                </>
            )}
        </group>
    );
}

// ==========================================
// NEURAL PATHWAY - ANIMATED CONNECTION
// ==========================================
function NeuralPathway({ from, to, damageLevel }) {
    const lineRef = useRef();
    const fromPos = ORGAN_SYSTEMS[from]?.position || [0, 0, 0];
    const toPos = ORGAN_SYSTEMS[to]?.position || [0, 0, 0];
    
    const healthLevel = 1 - damageLevel;
    const color = healthLevel > 0.5 ? '#00FF88' : '#FF0044';
    
    // Create curved path
    const curvePoints = useMemo(() => {
        const mid = [
            (fromPos[0] + toPos[0]) / 2 + (Math.random() - 0.5) * 0.08,
            (fromPos[1] + toPos[1]) / 2,
            (fromPos[2] + toPos[2]) / 2 + 0.04
        ];
        
        const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(...fromPos),
            new THREE.Vector3(...mid),
            new THREE.Vector3(...toPos)
        );
        
        return curve.getPoints(16);
    }, [fromPos, toPos]);
    
    useFrame((state) => {
        if (lineRef.current) {
            lineRef.current.material.dashOffset = -state.clock.elapsedTime * 0.3;
        }
    });
    
    return (
        <>
            <Line
                ref={lineRef}
                points={curvePoints}
                color={color}
                lineWidth={1.5}
                transparent
                opacity={0.3 + healthLevel * 0.4}
                dashed
                dashSize={0.025}
                dashScale={4}
            />
            {/* Glow line */}
            <Line
                points={curvePoints}
                color={color}
                lineWidth={4}
                transparent
                opacity={0.08}
            />
        </>
    );
}

// ==========================================
// FLOATING PARTICLES
// ==========================================
function FloatingParticles({ count = 50, overallHealth }) {
    const pointsRef = useRef();
    
    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            // Distribute around body
            const theta = Math.random() * Math.PI * 2;
            const y = (Math.random() - 0.3) * 2.5;
            const radius = 0.4 + Math.random() * 0.3;
            
            positions[i * 3] = Math.cos(theta) * radius;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = Math.sin(theta) * radius;
            
            // Color based on health
            const isHealthy = Math.random() < overallHealth / 100;
            colors[i * 3] = isHealthy ? 0 : 1;
            colors[i * 3 + 1] = isHealthy ? 1 : 0;
            colors[i * 3 + 2] = isHealthy ? 0.5 : 0.3;
        }
        
        return { positions, colors };
    }, [count, overallHealth]);
    
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (pointsRef.current) {
            pointsRef.current.rotation.y = t * 0.05;
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
                size={0.015}
                vertexColors
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}

// ==========================================
// MAIN 3D SCENE
// ==========================================
function BodyScene({ organHealth, overallHealth, hoveredOrgan, selectedOrgan, setHoveredOrgan, setSelectedOrgan }) {
    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.15} />
            <pointLight position={[3, 3, 3]} intensity={0.8} color="#00F0FF" />
            <pointLight position={[-3, 2, -2]} intensity={0.5} color="#00F0FF" />
            <pointLight position={[0, -2, 2]} intensity={0.4} color="#00FF88" />
            <spotLight position={[0, 5, 5]} intensity={0.3} color="#FFFFFF" angle={0.5} />
            
            <Float speed={0.3} rotationIntensity={0.02} floatIntensity={0.05}>
                <group scale={1.15} position={[0, -0.25, 0]}>
                    {/* Holographic Wireframe Body */}
                    <HolographicBody overallHealth={overallHealth} />
                    
                    {/* Organ Nodes */}
                    {Object.entries(ORGAN_SYSTEMS).map(([id, data]) => (
                        <OrganNode
                            key={id}
                            id={id}
                            data={data}
                            damageLevel={organHealth[id] || 0}
                            isHovered={hoveredOrgan === id}
                            isSelected={selectedOrgan === id}
                            onHover={setHoveredOrgan}
                            onClick={setSelectedOrgan}
                        />
                    ))}
                    
                    {/* Neural Pathways */}
                    {NEURAL_PATHWAYS.map((pathway, index) => {
                        const avgDamage = ((organHealth[pathway.from] || 0) + (organHealth[pathway.to] || 0)) / 2;
                        return (
                            <NeuralPathway
                                key={index}
                                {...pathway}
                                damageLevel={avgDamage}
                            />
                        );
                    })}
                    
                    {/* Floating Particles */}
                    <FloatingParticles count={80} overallHealth={overallHealth} />
                </group>
            </Float>
            
            <OrbitControls
                enablePan={false}
                enableZoom={true}
                minDistance={2.5}
                maxDistance={6}
                autoRotate
                autoRotateSpeed={0.3}
                maxPolarAngle={Math.PI * 0.75}
                minPolarAngle={Math.PI * 0.25}
            />
        </>
    );
}

// ==========================================
// ORGAN STATS PANEL - FUTURISTIC UI
// ==========================================
function OrganStatsPanel({ organHealth, selectedOrgan, setSelectedOrgan }) {
    const sortedOrgans = useMemo(() => {
        return Object.entries(ORGAN_SYSTEMS)
            .map(([id, data]) => ({
                id,
                ...data,
                damage: organHealth[id] || 0,
                health: Math.round((1 - (organHealth[id] || 0)) * 100)
            }))
            .sort((a, b) => b.damage - a.damage);
    }, [organHealth]);
    
    return (
        <div className="absolute right-4 top-4 bottom-4 w-52 flex flex-col gap-2 overflow-hidden">
            {/* Header */}
            <div className="bg-black/80 backdrop-blur-xl border border-[#00F0FF]/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#00F0FF]">
                    <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
                    ORGAN TELEMETRY
                </div>
            </div>
            
            {/* Organ list */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-white/10">
                {sortedOrgans.map((organ, index) => {
                    const isSelected = selectedOrgan === organ.id;
                    const healthColor = organ.health > 80 ? '#00FF88' : 
                                       organ.health > 50 ? '#FFE600' : '#FF0044';
                    
                    return (
                        <motion.button
                            key={organ.id}
                            onClick={() => setSelectedOrgan(isSelected ? null : organ.id)}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer
                                       ${isSelected 
                                           ? 'bg-white/10 border-[#00F0FF]' 
                                           : 'bg-black/60 border-white/10 hover:border-white/30 hover:bg-white/5'
                                       }`}
                            style={isSelected ? { boxShadow: '0 0 15px rgba(0,240,255,0.2)' } : {}}
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">{organ.icon}</span>
                                    <span className="text-[10px] font-mono text-white/80">{organ.name}</span>
                                </div>
                                <span 
                                    className="text-xs font-mono font-bold"
                                    style={{ color: healthColor }}
                                >
                                    {organ.health}%
                                </span>
                            </div>
                            
                            {/* Health bar */}
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ background: healthColor }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${organ.health}%` }}
                                    transition={{ duration: 0.6, delay: index * 0.04 }}
                                />
                            </div>
                            
                            {/* Status indicator */}
                            <div className="mt-1.5 flex items-center gap-1.5">
                                <div 
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ background: healthColor }}
                                />
                                <span className="text-[8px] font-mono text-white/40">
                                    {organ.health > 80 ? 'OPTIMAL' : 
                                     organ.health > 50 ? 'RECOVERING' : 'CRITICAL'}
                                </span>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
            
            {/* Legend */}
            <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg p-2.5">
                <div className="flex justify-between text-[8px] font-mono">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#00FF88]" />
                        <span className="text-white/50">OPTIMAL</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#FFE600]" />
                        <span className="text-white/50">HEALING</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#FF0044]" />
                        <span className="text-white/50">DAMAGED</span>
                    </div>
                </div>
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
            organHealth[id] = 0.25;
        });
        return organHealth;
    }
    
    Object.entries(ORGAN_SYSTEMS).forEach(([organId, organ]) => {
        let totalDamage = 0;
        let relevantSubstances = 0;
        
        Object.entries(organ.affectedBy).forEach(([substance, impactFactor]) => {
            if (impactFactor < 0.1) return;
            
            const profile = userProfile[substance];
            if (!profile || !profile.usageStartDate) return;
            
            relevantSubstances++;
            
            const usageStartDate = new Date(profile.usageStartDate);
            const quitDate = quitDates[substance] ? new Date(quitDates[substance]) : new Date();
            const yearsOfUse = Math.max(0, (quitDate - usageStartDate) / (365.25 * 24 * 60 * 60 * 1000));
            
            const frequencyMultiplier = {
                'multiple-daily': 1.2,
                'daily': 1.0,
                'weekly': 0.4,
                'monthly': 0.15,
                'rarely': 0.05
            }[profile.frequency] || 0.5;
            
            const amountMultiplier = {
                'heavy': 1.2,
                'moderate': 0.8,
                'light': 0.4
            }[profile.amount] || 0.6;
            
            let baseDamage = Math.min(1, (yearsOfUse * frequencyMultiplier * amountMultiplier * impactFactor) / 10);
            
            if (quitDates[substance] && progress[substance]) {
                const daysSober = progress[substance]?.streak?.days || 0;
                const recoveryDays = organ.recoveryDays[substance] || 180;
                const recoveryProgress = Math.min(1, daysSober / recoveryDays);
                baseDamage *= (1 - recoveryProgress * 0.9);
            }
            
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
    const { quitDates, progress, entries } = useRecovery();
    const [hoveredOrgan, setHoveredOrgan] = useState(null);
    const [selectedOrgan, setSelectedOrgan] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    
    const organHealth = useMemo(() => {
        return calculateOrganDamage(userProfile, quitDates, progress, entries);
    }, [userProfile, quitDates, progress, entries]);
    
    const overallHealth = useMemo(() => {
        const damages = Object.values(organHealth);
        if (damages.length === 0) return 100;
        const avgDamage = damages.reduce((a, b) => a + b, 0) / damages.length;
        return Math.round((1 - avgDamage) * 100);
    }, [organHealth]);
    
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 300);
        return () => clearTimeout(timer);
    }, []);
    
    const healthColor = overallHealth > 70 ? '#00FF88' : overallHealth > 40 ? '#FFE600' : '#FF0044';
    
    // COMPACT VERSION
    if (compact) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative w-full h-[300px] rounded-xl overflow-hidden
                           bg-linear-to-br from-[#030508] via-[#050810] to-[#030508]
                           border border-white/10"
            >
                {/* Scanlines */}
                <div className="absolute inset-0 pointer-events-none opacity-30
                                bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,240,255,0.03)_2px,rgba(0,240,255,0.03)_4px)]" />
                
                <Canvas camera={{ position: [0, 0.3, 2.8], fov: 45 }}>
                    <Suspense fallback={null}>
                        <BodyScene
                            organHealth={organHealth}
                            overallHealth={overallHealth}
                            hoveredOrgan={hoveredOrgan}
                            selectedOrgan={selectedOrgan}
                            setHoveredOrgan={setHoveredOrgan}
                            setSelectedOrgan={setSelectedOrgan}
                        />
                    </Suspense>
                </Canvas>
                
                {/* Health Display Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3
                                bg-linear-to-t from-black/90 via-black/50 to-transparent">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: healthColor }} />
                            <span className="text-[10px] font-mono text-white/60 tracking-wider">SYSTEM INTEGRITY</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-mono font-black" style={{ color: healthColor }}>
                                {overallHealth}%
                            </span>
                        </div>
                    </div>
                    {/* Health bar */}
                    <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${healthColor}, ${healthColor}80)` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${overallHealth}%` }}
                            transition={{ duration: 1 }}
                        />
                    </div>
                </div>
                
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[#00F0FF]/50" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-[#00F0FF]/50" />
            </motion.div>
        );
    }
    
    // FULL VERSION
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.5 }}
            className="relative w-full h-[650px] rounded-2xl overflow-hidden
                       bg-linear-to-br from-[#030508] via-[#050810] to-[#030508]
                       border border-white/10"
        >
            {/* Animated scanlines overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 opacity-40
                            bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,240,255,0.02)_2px,rgba(0,240,255,0.02)_4px)]" />
            
            {/* Header HUD */}
            <div className="absolute top-4 left-4 z-20">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: healthColor }} />
                    <span className="text-[11px] font-mono text-white/50 tracking-[0.25em]">
                        NEURAL BODY MATRIX
                    </span>
                </div>
                
                <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-mono font-black" style={{ color: healthColor }}>
                        {overallHealth}%
                    </span>
                    <span className="text-sm font-mono text-white/40">INTEGRITY</span>
                </div>
                
                {/* Status indicators */}
                <div className="mt-4 flex flex-col gap-1.5">
                    <div className="text-[9px] font-mono text-white/30 flex items-center gap-2">
                        <span className="w-14 text-[#00F0FF]">STATUS:</span>
                        <span className="text-white/60">
                            {overallHealth > 80 ? 'OPTIMAL' : overallHealth > 50 ? 'RECOVERING' : 'CRITICAL'}
                        </span>
                    </div>
                    <div className="text-[9px] font-mono text-white/30 flex items-center gap-2">
                        <span className="w-14 text-[#00F0FF]">MODE:</span>
                        <span className="text-white/60">LIVE MONITORING</span>
                    </div>
                    <div className="text-[9px] font-mono text-white/30 flex items-center gap-2">
                        <span className="w-14 text-[#00F0FF]">ORGANS:</span>
                        <span className="text-white/60">{Object.keys(ORGAN_SYSTEMS).length} TRACKED</span>
                    </div>
                </div>
            </div>
            
            {/* 3D Canvas */}
            <Canvas camera={{ position: [0, 0.3, 3.5], fov: 40 }}>
                <Suspense fallback={null}>
                    <BodyScene
                        organHealth={organHealth}
                        overallHealth={overallHealth}
                        hoveredOrgan={hoveredOrgan}
                        selectedOrgan={selectedOrgan}
                        setHoveredOrgan={setHoveredOrgan}
                        setSelectedOrgan={setSelectedOrgan}
                    />
                </Suspense>
            </Canvas>
            
            {/* Organ Stats Panel */}
            <OrganStatsPanel 
                organHealth={organHealth} 
                selectedOrgan={selectedOrgan}
                setSelectedOrgan={setSelectedOrgan}
            />
            
            {/* Bottom info bar */}
            <div className="absolute bottom-4 left-4 right-60 flex items-center justify-between
                            text-[9px] font-mono text-white/30">
                <div className="flex items-center gap-4">
                    <span>◉ CLICK ORGAN TO INSPECT</span>
                    <span>◉ DRAG TO ROTATE</span>
                    <span>◉ SCROLL TO ZOOM</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse" />
                    <span>LIVE</span>
                </div>
            </div>
            
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#00F0FF]/30" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#00F0FF]/30" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#00F0FF]/30" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#00F0FF]/30" />
        </motion.div>
    );
}

export { ORGAN_SYSTEMS, calculateOrganDamage };
