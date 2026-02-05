import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { HudCard, HudButton, HudInput } from './HudComponents';
import Scene3DBackground, { Scene3DBackgroundLite } from './Scene3DBackground';

// ==========================================
// BOOT SEQUENCE CONFIGURATION
// ==========================================
const BOOT_SEQUENCE = [
    { text: "INITIALIZING NEURAL INTERFACE...", delay: 0 },
    { text: "SCANNING BIOMETRICS...", delay: 800 },
    { text: "ESTABLISHING SECURE CONNECTION...", delay: 1600 },
    { text: "LOADING RECOVERY PROTOCOLS...", delay: 2400 },
    { text: "SYSTEM READY", delay: 3200, final: true },
];

// ==========================================
// TYPING TEXT EFFECT COMPONENT
// ==========================================
function TypingText({ text, onComplete, speed = 30 }) {
    const [displayText, setDisplayText] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    
    useEffect(() => {
        let index = 0;
        const timer = setInterval(() => {
            if (index < text.length) {
                setDisplayText(text.slice(0, index + 1));
                index++;
            } else {
                clearInterval(timer);
                setIsComplete(true);
                onComplete?.();
            }
        }, speed);
        
        return () => clearInterval(timer);
    }, [text, speed, onComplete]);
    
    return (
        <span>
            {displayText}
            {!isComplete && <span className="terminal-cursor ml-1" />}
        </span>
    );
}

// ==========================================
// BOOT SEQUENCE COMPONENT
// ==========================================
function BootSequence({ onComplete }) {
    const [currentLine, setCurrentLine] = useState(0);
    const [completedLines, setCompletedLines] = useState([]);
    
    useEffect(() => {
        BOOT_SEQUENCE.forEach((item, index) => {
            setTimeout(() => {
                setCurrentLine(index);
            }, item.delay);
        });
        
        // Complete after last line
        setTimeout(() => {
            onComplete?.();
        }, BOOT_SEQUENCE[BOOT_SEQUENCE.length - 1].delay + 1000);
    }, [onComplete]);
    
    const handleLineComplete = (index) => {
        setCompletedLines(prev => [...prev, index]);
    };
    
    return (
        <div className="terminal-container rounded-none">
            <div className="space-y-3">
                {BOOT_SEQUENCE.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ 
                            opacity: currentLine >= index ? 1 : 0,
                            x: currentLine >= index ? 0 : -10
                        }}
                        transition={{ duration: 0.3 }}
                        className="terminal-line"
                    >
                        {completedLines.includes(index) ? (
                            <>
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="checkmark text-(--neon-green-hex)"
                                >
                                    ✓
                                </motion.span>
                                <span className={item.final ? "text-(--neon-green-hex)" : ""}>
                                    {item.text}
                                </span>
                            </>
                        ) : currentLine === index ? (
                            <>
                                <span className="text-(--neon-cyan-hex)">›</span>
                                <TypingText 
                                    text={item.text} 
                                    onComplete={() => handleLineComplete(index)}
                                    speed={25}
                                />
                            </>
                        ) : null}
                    </motion.div>
                ))}
            </div>
            
            {/* Progress bar */}
            <motion.div 
                className="mt-6 h-1 bg-(--bg-muted) overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <motion.div
                    className="h-full bg-(--neon-cyan-hex)"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentLine + 1) / BOOT_SEQUENCE.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </motion.div>
        </div>
    );
}

// ==========================================
// MAIN AUTH TERMINAL COMPONENT
// ==========================================
export default function AuthTerminal({ onSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bootComplete, setBootComplete] = useState(false);
    const [showForm, setShowForm] = useState(false);
    
    // Check if on mobile for lite 3D
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const handleBootComplete = useCallback(() => {
        setBootComplete(true);
        setTimeout(() => setShowForm(true), 300);
    }, []);
    
    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            setError(null);
            await signInWithPopup(auth, googleProvider);
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('All fields are required');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            if (onSuccess) onSuccess();
        } catch (err) {
            // Friendly error messages
            const errorMessages = {
                'auth/user-not-found': 'Operator not found in database',
                'auth/wrong-password': 'Invalid access code',
                'auth/email-already-in-use': 'Operator ID already registered',
                'auth/weak-password': 'Access code too weak (min 6 chars)',
                'auth/invalid-email': 'Invalid operator ID format',
            };
            setError(errorMessages[err.code] || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* 3D Background */}
            {isMobile ? <Scene3DBackgroundLite /> : <Scene3DBackground />}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-[var(--bg-void)]/50 to-(--bg-void) pointer-events-none" />
            
            <div className="w-full max-w-md relative z-10">
                {/* Logo/Brand */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8"
                >
                    <h1 className="hero-title text-gradient mb-2">RECOVERY.OS</h1>
                    <p className="hud-label text-(--text-secondary)">
                        OPERATOR AUTHENTICATION REQUIRED
                    </p>
                </motion.div>
                
                {/* Boot Sequence */}
                <AnimatePresence mode="wait">
                    {!bootComplete && (
                        <motion.div
                            key="boot"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <BootSequence onComplete={handleBootComplete} />
                        </motion.div>
                    )}
                    
                    {/* Auth Form */}
                    {showForm && (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <HudCard 
                                title="IDENTITY VERIFICATION" 
                                variant="glow"
                                className="backdrop-blur-xl"
                            >
                                <div className="flex flex-col gap-6">
                                    {/* Header Icon */}
                                    <div className="text-center">
                                        <motion.div 
                                            className="inline-block p-4 border border-(--neon-cyan-hex) mb-2 glow-cyan"
                                            style={{
                                                clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)"
                                            }}
                                            animate={{ 
                                                boxShadow: [
                                                    "0 0 20px rgba(0, 255, 255, 0.3)",
                                                    "0 0 40px rgba(0, 255, 255, 0.5)",
                                                    "0 0 20px rgba(0, 255, 255, 0.3)"
                                                ]
                                            }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <span className="text-3xl">🔐</span>
                                        </motion.div>
                                        <p className="hud-label text-(--text-secondary) mt-2">
                                            SECURE REAL-TIME UPLINK
                                        </p>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleEmailAuth} className="space-y-4">
                                        <HudInput
                                            label="OPERATOR ID (EMAIL)"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="operative@recovery.os"
                                            disabled={loading}
                                        />

                                        <HudInput
                                            label="ACCESS CODE (PASSWORD)"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            disabled={loading}
                                        />

                                        {/* Error Display */}
                                        <AnimatePresence>
                                            {error && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="text-(--neon-magenta-hex) text-xs font-mono border border-(--neon-magenta-hex) p-3 bg-[rgba(255,0,60,0.1)]"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <span>⚠</span>
                                                        <span>SYSTEM ERROR: {error}</span>
                                                    </span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <HudButton 
                                            className="w-full" 
                                            type="submit"
                                            loading={loading}
                                            disabled={loading}
                                        >
                                            {isLogin ? 'ESTABLISH LINK' : 'REGISTER NEW ID'}
                                        </HudButton>
                                    </form>

                                    {/* Divider */}
                                    <div className="relative flex items-center justify-center">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-(--border-dim)" />
                                        </div>
                                        <span className="relative bg-(--bg-card) px-4 hud-label text-(--text-dim)">
                                            OR AUTHENTICATE VIA
                                        </span>
                                    </div>

                                    {/* Google Auth */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleGoogleLogin}
                                        disabled={loading}
                                        className="flex items-center justify-center gap-3 w-full bg-white text-black font-mono font-bold py-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                        style={{
                                            clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)"
                                        }}
                                    >
                                        <img 
                                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                                            className="w-5 h-5" 
                                            alt="Google" 
                                        />
                                        <span className="text-sm tracking-wider">GOOGLE ACCOUNT</span>
                                    </motion.button>

                                    {/* Toggle Login/Register */}
                                    <div className="text-center">
                                        <button
                                            onClick={() => {
                                                setIsLogin(!isLogin);
                                                setError(null);
                                            }}
                                            className="hud-label text-(--text-secondary) hover:text-(--neon-cyan-hex) transition-colors underline underline-offset-4"
                                        >
                                            {isLogin ? 'INITIALIZE NEW OPERATOR ID' : 'RETURN TO LOGIN TERMINAL'}
                                        </button>
                                    </div>
                                </div>
                            </HudCard>
                            
                            {/* Footer */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-center mt-6 hud-label text-(--text-dim)"
                            >
                                RECOVERY.OS V3 — BUILT WITH PRECISION
                            </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
