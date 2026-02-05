import { motion, AnimatePresence } from 'framer-motion';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function
function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// ==========================================
// HUD CARD COMPONENT
// ==========================================
const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { 
        opacity: 1, 
        scale: 1, 
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
    }
};

export function HudCard({ 
    children, 
    title, 
    className = "", 
    animate = true,
    variant = "default", // default, glow, danger, success
    showIndicators = true 
}) {
    const variantClass = variant !== "default" ? variant : "";
    
    return (
        <motion.div
            initial={animate ? "hidden" : false}
            animate={animate ? "visible" : false}
            variants={cardVariants}
            className={cn("hud-card", variantClass, className)}
        >
            {title && (
                <div className="flex items-center justify-between mb-4 border-b border-(--border-dim) pb-3">
                    <h3 className="hud-label flex items-center gap-2 text-(--neon-cyan-hex)">
                        <span className="status-dot active"></span>
                        {title}
                    </h3>
                    {showIndicators && (
                        <div className="flex gap-1.5">
                            <span className="w-1.5 h-1.5 bg-(--neon-cyan-hex) animate-pulse"></span>
                            <span className="w-1.5 h-1.5 bg-(--neon-cyan-hex) opacity-50"></span>
                            <span className="w-1.5 h-1.5 bg-(--neon-cyan-hex) opacity-25"></span>
                        </div>
                    )}
                </div>
            )}
            {children}
        </motion.div>
    );
}

// ==========================================
// HUD BUTTON COMPONENT
// ==========================================
const buttonVariants = cva(
    "hud-btn",
    {
        variants: {
            variant: {
                primary: "hud-btn--primary",
                secondary: "hud-btn--secondary",
                success: "hud-btn--success",
                danger: "hud-btn--danger",
                ghost: "hud-btn--ghost",
            },
            size: {
                sm: "text-[0.65rem] px-3 py-1.5",
                md: "text-[0.75rem] px-6 py-3",
                lg: "text-[0.85rem] px-8 py-4",
            }
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
        }
    }
);

export function HudButton({ 
    children, 
    onClick, 
    variant = 'primary', 
    size = 'md',
    className = "", 
    type = "button", 
    disabled = false,
    loading = false,
    icon = null
}) {
    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            onClick={onClick}
            type={type}
            disabled={disabled || loading}
            className={cn(buttonVariants({ variant, size }), className)}
        >
            {loading ? (
                <>
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    <span>PROCESSING...</span>
                </>
            ) : (
                <>
                    {icon && <span className="text-base">{icon}</span>}
                    {children}
                </>
            )}
        </motion.button>
    );
}

// ==========================================
// HUD INPUT COMPONENT
// ==========================================
export function HudInput({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    className = "",
    disabled = false,
    error = null,
    ...props
}) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label className="hud-label text-(--neon-cyan-hex)">
                    {label}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                    "hud-input",
                    error && "border-(--neon-magenta-hex)",
                    className
                )}
                {...props}
            />
            {error && (
                <span className="text-[0.65rem] text-(--neon-magenta-hex) font-mono">
                    ⚠ {error}
                </span>
            )}
        </div>
    );
}

// ==========================================
// HUD SELECT COMPONENT
// ==========================================
export function HudSelect({
    label,
    value,
    onChange,
    options = [],
    className = "",
    disabled = false,
    ...props
}) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label className="hud-label text-(--neon-cyan-hex)">
                    {label}
                </label>
            )}
            <select
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={cn("hud-select", className)}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

// ==========================================
// HUD PROGRESS COMPONENT
// ==========================================
export function HudProgress({ 
    label, 
    value = 0, 
    max = 100,
    variant = "default", // default, danger, success
    showValue = true,
    animate = true,
    className = ""
}) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const fillClass = variant !== "default" ? variant : "";
    
    return (
        <div className={cn("hud-progress", className)}>
            <div className="hud-progress-header">
                <span className="hud-label">{label}</span>
                {showValue && (
                    <span className="hud-value text-sm text-(--neon-cyan-hex)">
                        {percentage.toFixed(0)}%
                    </span>
                )}
            </div>
            <div className="hud-progress-track">
                <motion.div 
                    className={cn("hud-progress-fill", fillClass)}
                    initial={animate ? { width: 0 } : false}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}

// ==========================================
// LIVE TICKER COMPONENT
// ==========================================
export function LiveTicker({ 
    value, 
    label, 
    unit = "",
    size = "md", // sm, md, lg
    className = ""
}) {
    const sizeClasses = {
        sm: "text-lg",
        md: "text-2xl",
        lg: "text-4xl"
    };
    
    return (
        <div className={cn("live-ticker", className)}>
            <span className="hud-label">{label}</span>
            <div className="flex items-baseline gap-1">
                <AnimatePresence mode="wait">
                    <motion.span
                        key={value}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.2 }}
                        className={cn("ticker-value", sizeClasses[size])}
                    >
                        {value}
                    </motion.span>
                </AnimatePresence>
                {unit && <span className="ticker-unit">{unit}</span>}
            </div>
        </div>
    );
}

// ==========================================
// HUD BADGE COMPONENT
// ==========================================
export function HudBadge({
    children,
    variant = "cyan", // cyan, magenta, green, yellow
    className = ""
}) {
    return (
        <span className={cn(`badge badge-${variant}`, className)}>
            {children}
        </span>
    );
}

// ==========================================
// STATUS INDICATOR COMPONENT
// ==========================================
export function StatusIndicator({
    status = "default", // default, active, warning, danger
    label,
    className = ""
}) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <span className={cn("status-dot", status)}></span>
            {label && <span className="hud-label">{label}</span>}
        </div>
    );
}

// ==========================================
// HUD DIVIDER COMPONENT
// ==========================================
export function HudDivider({ className = "" }) {
    return (
        <div className={cn("w-full h-px bg-linear-to-r from-transparent via-[var(--border-dim)] to-transparent my-4", className)} />
    );
}

// ==========================================
// DATA DISPLAY COMPONENT
// ==========================================
export function DataDisplay({
    label,
    value,
    unit = "",
    trend = null, // "up", "down", null
    className = ""
}) {
    const trendColors = {
        up: "text-(--neon-green-hex)",
        down: "text-(--neon-magenta-hex)"
    };
    
    const trendIcons = {
        up: "↑",
        down: "↓"
    };
    
    return (
        <div className={cn("flex flex-col gap-1", className)}>
            <span className="hud-label">{label}</span>
            <div className="flex items-baseline gap-2">
                <span className="hud-value text-xl text-(--text-primary)">{value}</span>
                {unit && <span className="text-xs text-(--text-secondary)">{unit}</span>}
                {trend && (
                    <span className={cn("text-sm", trendColors[trend])}>
                        {trendIcons[trend]}
                    </span>
                )}
            </div>
        </div>
    );
}

// ==========================================
// CONTAINER VARIANTS FOR STAGGER ANIMATIONS
// ==========================================
export const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

export const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
    }
};

// ==========================================
// LOADING SPINNER COMPONENT
// ==========================================
export function LoadingSpinner({ size = "md", className = "" }) {
    const sizeClasses = {
        sm: "w-4 h-4 border-2",
        md: "w-8 h-8 border-2",
        lg: "w-12 h-12 border-3"
    };
    
    return (
        <div className={cn(
            "rounded-full border-(--neon-cyan-hex) border-t-transparent animate-spin",
            sizeClasses[size],
            className
        )} />
    );
}

// ==========================================
// GLITCH TEXT COMPONENT
// ==========================================
export function GlitchText({ children, className = "" }) {
    return (
        <span className={cn("relative inline-block", className)}>
            <span className="relative z-10">{children}</span>
            <span 
                className="absolute top-0 left-0 -ml-0.5 text-(--neon-cyan-hex) opacity-70 animate-pulse" 
                aria-hidden="true"
            >
                {children}
            </span>
            <span 
                className="absolute top-0 left-0 ml-0.5 text-(--neon-magenta-hex) opacity-70 animate-pulse" 
                style={{ animationDelay: '0.1s' }}
                aria-hidden="true"
            >
                {children}
            </span>
        </span>
    );
}
