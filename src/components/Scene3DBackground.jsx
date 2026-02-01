import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// ==========================================
// FLOATING OCTAHEDRON
// ==========================================
function FloatingOctahedron() {
    const meshRef = useRef();
    
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.002;
            meshRef.current.rotation.y += 0.003;
        }
    });
    
    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={meshRef}>
                <octahedronGeometry args={[1.5, 0]} />
                <meshBasicMaterial color="#00FFFF" wireframe transparent opacity={0.6} />
            </mesh>
        </Float>
    );
}

// ==========================================
// FLOATING TORUS
// ==========================================
function FloatingTorus() {
    const meshRef = useRef();
    
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.001;
            meshRef.current.rotation.z += 0.002;
        }
    });
    
    return (
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
            <mesh ref={meshRef} rotation={[Math.PI / 4, 0, 0]}>
                <torusGeometry args={[2.5, 0.02, 16, 100]} />
                <meshBasicMaterial color="#FF003C" transparent opacity={0.5} />
            </mesh>
        </Float>
    );
}

// ==========================================
// SECONDARY TORUS
// ==========================================
function SecondaryTorus() {
    const meshRef = useRef();
    
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.002;
            meshRef.current.rotation.x += 0.001;
        }
    });
    
    return (
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.4}>
            <mesh ref={meshRef} rotation={[Math.PI / 3, Math.PI / 6, 0]}>
                <torusGeometry args={[3, 0.01, 16, 100]} />
                <meshBasicMaterial color="#00FF9F" transparent opacity={0.3} />
            </mesh>
        </Float>
    );
}

// ==========================================
// PARTICLE FIELD
// ==========================================
function ParticleField({ count = 500 }) {
    const pointsRef = useRef();
    
    const { positions, colors } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        
        for (let i = 0; i < count * 3; i += 3) {
            // Spread particles in a sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 5 + Math.random() * 15;
            
            pos[i] = radius * Math.sin(phi) * Math.cos(theta);
            pos[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
            pos[i + 2] = radius * Math.cos(phi);
            
            // Random cyan/magenta colors
            const isCyan = Math.random() > 0.3;
            col[i] = isCyan ? 0 : 1;
            col[i + 1] = isCyan ? 1 : 0;
            col[i + 2] = 1;
        }
        
        return { positions: pos, colors: col };
    }, [count]);
    
    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += 0.0003;
            pointsRef.current.rotation.x += 0.0001;
        }
    });
    
    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    array={positions}
                    count={count}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    array={colors}
                    count={count}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial 
                size={0.03} 
                vertexColors 
                transparent 
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}

// ==========================================
// DATA STREAM LINES
// ==========================================
function DataStream({ position = [0, 0, 0] }) {
    const lineRef = useRef();
    
    const points = useMemo(() => {
        const pts = [];
        for (let i = 0; i < 20; i++) {
            pts.push(new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                i * 0.5 - 5,
                (Math.random() - 0.5) * 0.5
            ));
        }
        return pts;
    }, []);
    
    const lineGeometry = useMemo(() => {
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        return geo;
    }, [points]);
    
    useFrame((state) => {
        if (lineRef.current) {
            lineRef.current.position.y = Math.sin(state.clock.elapsedTime) * 2;
        }
    });
    
    return (
        <line ref={lineRef} position={position}>
            <bufferGeometry attach="geometry" {...lineGeometry} />
            <lineBasicMaterial color="#00FFFF" transparent opacity={0.3} />
        </line>
    );
}

// ==========================================
// HEXAGON GRID PLANE
// ==========================================
function HexGrid() {
    const meshRef = useRef();
    
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = -Math.PI / 2;
            meshRef.current.position.y = -3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
        }
    });
    
    return (
        <mesh ref={meshRef} position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[30, 30, 30, 30]} />
            <meshBasicMaterial 
                color="#00FFFF" 
                wireframe 
                transparent 
                opacity={0.05}
            />
        </mesh>
    );
}

// ==========================================
// MAIN 3D SCENE
// ==========================================
function Scene() {
    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.1} />
            <pointLight position={[10, 10, 10]} color="#00FFFF" intensity={0.5} />
            <pointLight position={[-10, -10, -10]} color="#FF003C" intensity={0.3} />
            <pointLight position={[0, 5, -5]} color="#00FF9F" intensity={0.2} />
            
            {/* Stars Background */}
            <Stars 
                radius={100} 
                depth={50} 
                count={2000} 
                factor={4} 
                saturation={0} 
                fade 
                speed={1} 
            />
            
            {/* Floating Geometry */}
            <FloatingOctahedron />
            <FloatingTorus />
            <SecondaryTorus />
            
            {/* Particle System */}
            <ParticleField count={400} />
            
            {/* Grid Floor */}
            <HexGrid />
            
            {/* Data Streams */}
            <DataStream position={[-5, 0, -3]} />
            <DataStream position={[5, 0, -3]} />
            <DataStream position={[0, 0, -5]} />
        </>
    );
}

// ==========================================
// EXPORTED BACKGROUND COMPONENT
// ==========================================
export default function Scene3DBackground() {
    return (
        <div className="fixed inset-0 -z-10 pointer-events-none">
            <Canvas 
                camera={{ position: [0, 0, 8], fov: 60 }}
                gl={{ antialias: true, alpha: true }}
                dpr={[1, 2]}
            >
                <Suspense fallback={null}>
                    <Scene />
                </Suspense>
            </Canvas>
        </div>
    );
}

// ==========================================
// LIGHTWEIGHT VERSION FOR MOBILE
// ==========================================
export function Scene3DBackgroundLite() {
    return (
        <div className="fixed inset-0 -z-10 pointer-events-none">
            <Canvas 
                camera={{ position: [0, 0, 8], fov: 60 }}
                gl={{ antialias: false, alpha: true }}
                dpr={1}
            >
                <Suspense fallback={null}>
                    <ambientLight intensity={0.1} />
                    <pointLight position={[10, 10, 10]} color="#00FFFF" intensity={0.3} />
                    <Stars 
                        radius={100} 
                        depth={50} 
                        count={1000} 
                        factor={4} 
                        saturation={0} 
                        fade 
                        speed={0.5} 
                    />
                    <FloatingOctahedron />
                    <ParticleField count={200} />
                </Suspense>
            </Canvas>
        </div>
    );
}
