import { motion } from 'framer-motion';

export function HudCard({ children, title, className = "", animate = true }) {
    return (
        <motion.div
            initial={animate ? { opacity: 0, scale: 0.95 } : {}}
            animate={animate ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className={`hud-card ${className}`}
        >
            {title && (
                <div className="flex items-center justify-between mb-4 border-b border-[var(--border-dim)] pb-2">
                    <h3 className="hud-label text-[var(--neon-cyan)]">{title}</h3>
                    <div className="flex gap-1">
                        <span className="w-1 h-1 bg-[var(--neon-cyan)] animate-pulse"></span>
                        <span className="w-1 h-1 bg-[var(--neon-cyan)] opacity-50"></span>
                        <span className="w-1 h-1 bg-[var(--neon-cyan)] opacity-25"></span>
                    </div>
                </div>
            )}
            {children}
        </motion.div>
    );
}

export function HudButton({ children, onClick, variant = 'primary', className = "" }) {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`hud-btn hud-btn--${variant} ${className}`}
        >
            {children}
        </motion.button>
    );
}

export function LiveTicker({ value, label, unit = "" }) {
    // Simple animated ticker component
    return (
        <div className="flex flex-col">
            <span className="hud-label">{label}</span>
            <div className="flex items-baseline gap-1">
                <span className="hud-value font-mono tracking-tighter">{value}</span>
                <span className="text-xs text-[var(--neon-cyan)]">{unit}</span>
            </div>
        </div>
    );
}
