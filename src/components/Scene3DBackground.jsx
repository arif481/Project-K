import { useRef, useMemo, Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Stars, MeshDistortMaterial } from '@react-three/drei';

// ==========================================
// DYNAMIC NEURAL NETWORK MESH
// ==========================================
function NeuralNetwork({ nodeCount = 60, connectionDistance = 3 }) {
    const pointsRef = useRef();
    const linesRef = useRef();
    
    const { nodes, connections, positions, colors } = useMemo(() => {
        const nodes = [];
        const positions = new Float32Array(nodeCount * 3);
        const colors = new Float32Array(nodeCount * 3);
        
        for (let i = 0; i < nodeCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 3 + Math.random() * 5;
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            nodes.push({ x, y, z });
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            
            const colorChoice = Math.random();
            if (colorChoice > 0.6) {
                colors[i * 3] = 0;
                colors[i * 3 + 1] = 0.94;
                colors[i * 3 + 2] = 1;
            } else if (colorChoice > 0.3) {
                colors[i * 3] = 0.58;
                colors[i * 3 + 1] = 0.2;
                colors[i * 3 + 2] = 0.92;
            } else {
                colors[i * 3] = 0;
                colors[i * 3 + 1] = 1;
                colors[i * 3 + 2] = 0.62;
            }
        }
        
        const connections = [];
        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dz = nodes[i].z - nodes[j].z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (dist < connectionDistance) {
                    connections.push({ i, j, dist });
                }
            }
        }
        
        return { nodes, connections, positions, colors };
    }, [nodeCount, connectionDistance]);
    
    const linePositions = useMemo(() => {
        const pos = new Float32Array(connections.length * 6);
        connections.forEach((conn, idx) => {
            pos[idx * 6] = nodes[conn.i].x;
            pos[idx * 6 + 1] = nodes[conn.i].y;
            pos[idx * 6 + 2] = nodes[conn.i].z;
            pos[idx * 6 + 3] = nodes[conn.j].x;
            pos[idx * 6 + 4] = nodes[conn.j].y;
            pos[idx * 6 + 5] = nodes[conn.j].z;
        });
        return pos;
    }, [connections, nodes]);
    
    useFrame(() => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += 0.0005;
            pointsRef.current.rotation.x += 0.0002;
        }
        if (linesRef.current) {
            linesRef.current.rotation.y += 0.0005;
            linesRef.current.rotation.x += 0.0002;
        }
    });
    
    return (
        <group>
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" array={positions} count={nodeCount} itemSize={3} />
                    <bufferAttribute attach="attributes-color" array={colors} count={nodeCount} itemSize={3} />
                </bufferGeometry>
                <pointsMaterial size={0.08} vertexColors transparent opacity={0.9} sizeAttenuation />
            </points>
            <lineSegments ref={linesRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" array={linePositions} count={connections.length * 2} itemSize={3} />
                </bufferGeometry>
                <lineBasicMaterial color="#00F0FF" transparent opacity={0.15} />
            </lineSegments>
        </group>
    );
}

// ==========================================
// HOLOGRAPHIC CORE SPHERE
// ==========================================
function HolographicCore() {
    const meshRef = useRef();
    const glowRef = useRef();
    
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (meshRef.current) {
            meshRef.current.rotation.x = t * 0.1;
            meshRef.current.rotation.y = t * 0.15;
            meshRef.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.05);
        }
        if (glowRef.current) {
            glowRef.current.rotation.x = -t * 0.05;
            glowRef.current.rotation.z = t * 0.1;
        }
    });
    
    return (
        <group>
            <mesh ref={meshRef}>
                <icosahedronGeometry args={[0.8, 1]} />
                <MeshDistortMaterial color="#00F0FF" emissive="#00F0FF" emissiveIntensity={0.3} wireframe transparent opacity={0.6} distort={0.3} speed={2} />
            </mesh>
            <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[1.5, 0.02, 16, 100]} />
                <meshBasicMaterial color="#9333EA" transparent opacity={0.4} />
            </mesh>
            <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
                <torusGeometry args={[1.8, 0.015, 16, 100]} />
                <meshBasicMaterial color="#00FF9F" transparent opacity={0.25} />
            </mesh>
        </group>
    );
}

// ==========================================
// FLOATING DATA CUBES
// ==========================================
function DataCubes({ count = 15 }) {
    const cubesRef = useRef([]);
    
    const cubeData = useMemo(() => {
        return Array.from({ length: count }, () => ({
            position: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 10 - 5],
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
            scale: 0.1 + Math.random() * 0.2,
            speed: 0.2 + Math.random() * 0.5,
            color: Math.random() > 0.5 ? '#00F0FF' : '#9333EA'
        }));
    }, [count]);
    
    useFrame((state) => {
        cubesRef.current.forEach((cube, i) => {
            if (cube) {
                cube.rotation.x += cubeData[i].speed * 0.01;
                cube.rotation.y += cubeData[i].speed * 0.015;
                cube.position.y += Math.sin(state.clock.elapsedTime * cubeData[i].speed + i) * 0.002;
            }
        });
    });
    
    return (
        <group>
            {cubeData.map((data, i) => (
                <mesh key={i} ref={el => cubesRef.current[i] = el} position={data.position} rotation={data.rotation} scale={data.scale}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshBasicMaterial color={data.color} wireframe transparent opacity={0.4} />
                </mesh>
            ))}
        </group>
    );
}

// ==========================================
// ENERGY PARTICLES
// ==========================================
function EnergyParticles({ count = 300 }) {
    const pointsRef = useRef();
    
    const { positions, colors, speeds } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const speeds = new Float32Array(count);
        
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5;
            
            const colorChoice = Math.random();
            if (colorChoice > 0.7) { colors[i * 3] = 0; colors[i * 3 + 1] = 0.94; colors[i * 3 + 2] = 1; }
            else if (colorChoice > 0.4) { colors[i * 3] = 0.58; colors[i * 3 + 1] = 0.2; colors[i * 3 + 2] = 0.92; }
            else { colors[i * 3] = 0; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 0.62; }
            
            speeds[i] = 0.5 + Math.random() * 1.5;
        }
        
        return { positions, colors, speeds };
    }, [count]);
    
    useFrame(() => {
        if (pointsRef.current) {
            const posArray = pointsRef.current.geometry.attributes.position.array;
            for (let i = 0; i < count; i++) {
                posArray[i * 3 + 1] += speeds[i] * 0.01;
                if (posArray[i * 3 + 1] > 10) posArray[i * 3 + 1] = -10;
            }
            pointsRef.current.geometry.attributes.position.needsUpdate = true;
            pointsRef.current.rotation.y += 0.0003;
        }
    });
    
    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
                <bufferAttribute attach="attributes-color" array={colors} count={count} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.04} vertexColors transparent opacity={0.7} sizeAttenuation />
        </points>
    );
}

// ==========================================
// HEX GRID FLOOR
// ==========================================
function HexGridFloor() {
    const gridRef = useRef();
    
    useFrame((state) => {
        if (gridRef.current) {
            gridRef.current.position.y = -4 + Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
        }
    });
    
    return (
        <mesh ref={gridRef} position={[0, -4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[50, 50, 50, 50]} />
            <meshBasicMaterial color="#00F0FF" wireframe transparent opacity={0.03} />
        </mesh>
    );
}

// ==========================================
// LIGHT ORBS
// ==========================================
function LightOrbs({ count = 5 }) {
    const orbsRef = useRef([]);
    
    const orbData = useMemo(() => {
        return Array.from({ length: count }, (_, i) => ({
            position: [Math.cos(i * (Math.PI * 2 / count)) * 8, (Math.random() - 0.5) * 4, Math.sin(i * (Math.PI * 2 / count)) * 8 - 5],
            color: ['#00F0FF', '#9333EA', '#00FF9F', '#FF0064'][i % 4],
            speed: 0.3 + Math.random() * 0.5
        }));
    }, [count]);
    
    useFrame((state) => {
        orbsRef.current.forEach((orb, i) => {
            if (orb) {
                const t = state.clock.elapsedTime * orbData[i].speed;
                orb.position.y = orbData[i].position[1] + Math.sin(t + i) * 2;
                orb.scale.setScalar(0.3 + Math.sin(t * 2 + i) * 0.1);
            }
        });
    });
    
    return (
        <group>
            {orbData.map((data, i) => (
                <mesh key={i} ref={el => orbsRef.current[i] = el} position={data.position}>
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshBasicMaterial color={data.color} transparent opacity={0.3} />
                </mesh>
            ))}
        </group>
    );
}

// ==========================================
// CAMERA CONTROLLER
// ==========================================
function CameraController() {
    const { camera } = useThree();
    
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        camera.position.x = Math.sin(t * 0.1) * 0.5;
        camera.position.y = Math.cos(t * 0.15) * 0.3;
        camera.lookAt(0, 0, 0);
    });
    
    return null;
}

// ==========================================
// MAIN 3D BACKGROUND - FULL VERSION
// ==========================================
export function Scene3DBackground() {
    const [dpr, setDpr] = useState(1);
    
    useEffect(() => {
        const pixelRatio = Math.min(window.devicePixelRatio, 2);
        setDpr(pixelRatio > 1.5 ? 1.5 : pixelRatio);
    }, []);
    
    return (
        <div className="fixed inset-0 z-0">
            <Canvas dpr={dpr} camera={{ position: [0, 0, 12], fov: 60, near: 0.1, far: 100 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
                <color attach="background" args={['#030508']} />
                <fog attach="fog" args={['#030508', 10, 40]} />
                
                <Suspense fallback={null}>
                    <CameraController />
                    <HolographicCore />
                    <NeuralNetwork nodeCount={50} connectionDistance={2.5} />
                    <DataCubes count={12} />
                    <EnergyParticles count={200} />
                    <HexGridFloor />
                    <LightOrbs count={4} />
                    <Stars radius={50} depth={50} count={1500} factor={3} saturation={0} fade speed={0.5} />
                </Suspense>
                
                <ambientLight intensity={0.1} />
            </Canvas>
            
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030508] pointer-events-none" />
        </div>
    );
}

// ==========================================
// LITE VERSION FOR PERFORMANCE
// ==========================================
export function Scene3DBackgroundLite() {
    const [dpr, setDpr] = useState(1);
    
    useEffect(() => {
        setDpr(Math.min(window.devicePixelRatio, 1.5));
    }, []);
    
    return (
        <div className="fixed inset-0 z-0">
            <Canvas dpr={dpr} camera={{ position: [0, 0, 15], fov: 50 }} gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}>
                <color attach="background" args={['#030508']} />
                <fog attach="fog" args={['#030508', 15, 50]} />
                
                <Suspense fallback={null}>
                    <NeuralNetwork nodeCount={30} connectionDistance={3} />
                    <EnergyParticles count={100} />
                    <HexGridFloor />
                    <Stars radius={60} depth={40} count={800} factor={4} saturation={0} fade speed={0.3} />
                </Suspense>
                
                <ambientLight intensity={0.05} />
            </Canvas>
            
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(3,5,8,0.3)] to-[#030508] pointer-events-none" />
        </div>
    );
}

// ==========================================
// MINIMAL VERSION FOR MOBILE
// ==========================================
export function Scene3DBackgroundMinimal() {
    return (
        <div className="fixed inset-0 z-0">
            <Canvas dpr={1} camera={{ position: [0, 0, 20], fov: 45 }} gl={{ antialias: false, alpha: true }}>
                <color attach="background" args={['#030508']} />
                
                <Suspense fallback={null}>
                    <EnergyParticles count={50} />
                    <Stars radius={80} depth={30} count={400} factor={5} saturation={0} fade speed={0.2} />
                </Suspense>
            </Canvas>
            
            <div className="absolute inset-0 bg-gradient-radial from-transparent to-[#030508] pointer-events-none" />
        </div>
    );
}

export default Scene3DBackground;
