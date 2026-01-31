import { useState } from 'react';
import { motion } from 'framer-motion';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { HudCard, HudButton } from './HudComponents';

export default function AuthTerminal({ onSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
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
        if (!email || !password) return;

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
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black">
            <HudCard title="IDENTITY VERIFICATION" className="w-full max-w-md">
                <div className="flex flex-col gap-6">
                    {/* Header Animation */}
                    <div className="text-center space-y-2">
                        <div className="inline-block p-4 border border-[var(--neon-cyan)] rounded-full mb-2 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                            <span className="text-4xl">🔐</span>
                        </div>
                        <h2 className="text-xl font-mono text-white tracking-widest">RECOVERY.OS CLOUD</h2>
                        <p className="text-xs text-[var(--text-secondary)] font-mono">SECURE REAL-TIME UPLINK</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div>
                            <label className="text-[10px] text-[var(--neon-cyan)] font-mono mb-1 block">USER ID (EMAIL)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[var(--bg-grid)] border border-[var(--border-dim)] p-3 text-white font-mono text-sm focus:border-[var(--neon-cyan)] outline-none transition-colors"
                                placeholder="operative@recovery.os"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] text-[var(--neon-cyan)] font-mono mb-1 block">ACCESS CODE (PASSWORD)</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[var(--bg-grid)] border border-[var(--border-dim)] p-3 text-white font-mono text-sm focus:border-[var(--neon-cyan)] outline-none transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-[var(--neon-magenta)] text-xs font-mono border border-[var(--neon-magenta)] p-2 bg-[rgba(255,0,60,0.1)]"
                            >
                                ⚠ ERROR: {error}
                            </motion.div>
                        )}

                        <HudButton className="w-full justify-center" type="submit">
                            {loading ? 'PROCESSING...' : isLogin ? 'ESTABLISH LINK' : 'REGISTER NEW ID'}
                        </HudButton>
                    </form>

                    <div className="relative flex items-center justify-center border-t border-[var(--border-dim)] pt-6">
                        <span className="absolute bg-black px-2 top-3 text-[10px] text-[var(--text-dim)] font-mono">OR AUTHENTICATE VIA</span>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className="flex items-center justify-center gap-3 w-full bg-white text-black font-mono font-bold py-3 hover:bg-gray-200 transition-colors"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                        GOOGLE ACCOUNT
                    </button>

                    <div className="text-center mt-4">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-xs text-[var(--text-secondary)] hover:text-[var(--neon-cyan)] font-mono underline"
                        >
                            {isLogin ? 'Initialize New User Identity' : 'Return to Login Terminal'}
                        </button>
                    </div>
                </div>
            </HudCard>
        </div>
    );
}
