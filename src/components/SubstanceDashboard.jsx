// SubstanceDashboard.jsx - Per-Substance Detailed Recovery Card v4.0
import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useRecovery } from '../context/RecoveryContext';
import { HudCard } from './HudComponents';
import { calculateRecoveryProgress, getStreakInfo } from '../utils/calculations';

// Per-substance config for calculations
const SUBSTANCE_CONFIG = {
    cigarettes: {
        label: 'NICOTINE',
        icon: '🚬',
        lifeMinutesPerUnit: 11,
        usagePerDay: 20,
        color: '#00F0FF',
        gradient: 'linear-gradient(135deg, #00F0FF 0%, #0080FF 100%)',
        bgGlow: 'rgba(0, 240, 255, 0.15)',
        milestones: [1, 2, 3, 5, 7, 14, 21, 30, 45, 60, 90, 120, 180, 270, 365],
        healthBenefits: [
            { hour: 0.33, benefit: '20 min: Heart rate drops to normal' },
            { hour: 2, benefit: '2 hrs: Nicotine cravings begin' },
            { hour: 4, benefit: '4 hrs: Body craving nicotine intensely' },
            { hour: 8, benefit: '8 hrs: Carbon monoxide drops 50%' },
            { hour: 12, benefit: '12 hrs: Blood oxygen normalizes' },
            { hour: 16, benefit: '16 hrs: Anxiety may peak' },
            { hour: 20, benefit: '20 hrs: Receptor healing begins' },
            { hour: 24, benefit: '24 hrs: Heart attack risk decreasing' },
            { hour: 36, benefit: '36 hrs: Sense of smell returning' },
            { hour: 48, benefit: '48 hrs: Taste & smell improving' },
            { hour: 60, benefit: '60 hrs: Cravings starting to ease' },
            { hour: 72, benefit: '72 hrs: Breathing becomes easier' },
            { day: 4, benefit: '4 days: Blood circulation improving' },
            { day: 5, benefit: '5 days: Nicotine fully cleared' },
            { day: 6, benefit: '6 days: Irritability decreasing' },
            { day: 7, benefit: '1 week: Sleep quality improving' },
            { day: 10, benefit: '10 days: Gum inflammation reducing' },
            { day: 14, benefit: '2 weeks: Circulation significantly better' },
            { day: 17, benefit: '17 days: Cough reflex normalizing' },
            { day: 21, benefit: '3 weeks: Brain fog clearing' },
            { day: 25, benefit: '25 days: Energy levels rising' },
            { day: 30, benefit: '1 month: Lung function up 30%' },
            { day: 40, benefit: '40 days: Skin tone improving' },
            { day: 50, benefit: '50 days: Exercise easier' },
            { day: 60, benefit: '2 months: Cravings much weaker' },
            { day: 75, benefit: '75 days: Anxiety normalized' },
            { day: 90, benefit: '3 months: Cilia fully regenerated' },
            { day: 120, benefit: '4 months: Lung capacity increasing' },
            { day: 150, benefit: '5 months: Immune system stronger' },
            { day: 180, benefit: '6 months: Coughing/wheezing gone' },
            { day: 240, benefit: '8 months: Shortness of breath rare' },
            { day: 270, benefit: '9 months: Lungs significantly healed' },
            { day: 300, benefit: '10 months: Stroke risk dropping' },
            { day: 330, benefit: '11 months: Cardiovascular improved' },
            { day: 365, benefit: '1 year: Heart disease risk halved' },
        ]
    },
    cannabis: {
        label: 'CANNABIS',
        icon: '🌿',
        lifeMinutesPerUnit: 5,
        usagePerDay: 3,
        color: '#00FF88',
        gradient: 'linear-gradient(135deg, #00FF88 0%, #00CC66 100%)',
        bgGlow: 'rgba(0, 255, 136, 0.15)',
        milestones: [1, 2, 3, 5, 7, 14, 21, 30, 45, 60, 90, 120, 180, 365],
        healthBenefits: [
            { hour: 6, benefit: '6 hrs: Initial detox starting' },
            { hour: 12, benefit: '12 hrs: Appetite changes begin' },
            { hour: 18, benefit: '18 hrs: THC metabolizing' },
            { hour: 24, benefit: '24 hrs: THC detox in progress' },
            { hour: 36, benefit: '36 hrs: Irritability may peak' },
            { hour: 48, benefit: '48 hrs: Withdrawal symptoms begin' },
            { hour: 60, benefit: '60 hrs: Mood swings common' },
            { hour: 72, benefit: '72 hrs: THC leaving fat cells' },
            { day: 4, benefit: '4 days: Sleep disruption peaks' },
            { day: 5, benefit: '5 days: Appetite normalizing' },
            { day: 6, benefit: '6 days: Headaches subsiding' },
            { day: 7, benefit: '1 week: Sleep patterns improving' },
            { day: 8, benefit: '8 days: REM sleep returning' },
            { day: 10, benefit: '10 days: Dreams returning vividly' },
            { day: 12, benefit: '12 days: Concentration improving' },
            { day: 14, benefit: '2 weeks: Short-term memory better' },
            { day: 17, benefit: '17 days: Anxiety easing' },
            { day: 21, benefit: '3 weeks: Motivation increasing' },
            { day: 25, benefit: '25 days: Mood stabilizing' },
            { day: 30, benefit: '1 month: Mental clarity returning' },
            { day: 35, benefit: '35 days: Creativity returning' },
            { day: 40, benefit: '40 days: Energy levels up' },
            { day: 45, benefit: '45 days: Anxiety much lower' },
            { day: 50, benefit: '50 days: Social confidence up' },
            { day: 60, benefit: '2 months: Focus significantly better' },
            { day: 75, benefit: '75 days: Memory consolidated' },
            { day: 90, benefit: '3 months: Full cognitive recovery' },
            { day: 120, benefit: '4 months: Emotional regulation strong' },
            { day: 150, benefit: '5 months: Reward system healing' },
            { day: 180, benefit: '6 months: Dopamine rebalanced' },
            { day: 240, benefit: '8 months: New neural pathways' },
            { day: 300, benefit: '10 months: Permanent brain changes' },
            { day: 365, benefit: '1 year: Brain fully recovered' },
        ]
    },
    alcohol: {
        label: 'ALCOHOL',
        icon: '🍺',
        lifeMinutesPerUnit: 15,
        usagePerDay: 4,
        color: '#FF0064',
        gradient: 'linear-gradient(135deg, #FF0064 0%, #FF6B6B 100%)',
        bgGlow: 'rgba(255, 0, 100, 0.15)',
        milestones: [1, 2, 3, 5, 7, 14, 21, 30, 45, 60, 90, 120, 180, 365],
        healthBenefits: [
            { hour: 4, benefit: '4 hrs: Blood sugar stabilizing' },
            { hour: 8, benefit: '8 hrs: Alcohol leaving blood' },
            { hour: 12, benefit: '12 hrs: Body starting detox' },
            { hour: 18, benefit: '18 hrs: Withdrawal may begin' },
            { hour: 24, benefit: '24 hrs: Liver beginning recovery' },
            { hour: 36, benefit: '36 hrs: Symptoms may intensify' },
            { hour: 48, benefit: '48 hrs: Withdrawal peaks' },
            { hour: 60, benefit: '60 hrs: Worst symptoms passing' },
            { hour: 72, benefit: '72 hrs: Body detoxing heavily' },
            { day: 4, benefit: '4 days: Blood sugar normalizing' },
            { day: 5, benefit: '5 days: Clearer thinking' },
            { day: 6, benefit: '6 days: Appetite returning' },
            { day: 7, benefit: '1 week: Sleep quality improving' },
            { day: 8, benefit: '8 days: Hydration improving' },
            { day: 10, benefit: '10 days: Energy levels rising' },
            { day: 12, benefit: '12 days: Anxiety decreasing' },
            { day: 14, benefit: '2 weeks: Skin hydration returning' },
            { day: 17, benefit: '17 days: Bloating reduced' },
            { day: 21, benefit: '3 weeks: Blood pressure normalizing' },
            { day: 25, benefit: '25 days: Mental clarity up' },
            { day: 30, benefit: '1 month: Liver fat reducing' },
            { day: 35, benefit: '35 days: Face puffiness gone' },
            { day: 40, benefit: '40 days: Better mood overall' },
            { day: 45, benefit: '45 days: Immune system stronger' },
            { day: 50, benefit: '50 days: Weight normalizing' },
            { day: 60, benefit: '2 months: Digestive system healing' },
            { day: 75, benefit: '75 days: Liver enzymes normal' },
            { day: 90, benefit: '3 months: Liver significantly healed' },
            { day: 120, benefit: '4 months: Cognitive function improved' },
            { day: 150, benefit: '5 months: Heart health improving' },
            { day: 180, benefit: '6 months: Cancer risk decreasing' },
            { day: 240, benefit: '8 months: Metabolism normalized' },
            { day: 300, benefit: '10 months: Nerve damage reversing' },
            { day: 365, benefit: '1 year: Brain fully recovered' },
        ]
    }
};

// Animated counter component
const AnimatedCounter = memo(({ value, format = 'number', color }) => {
    const [displayValue, setDisplayValue] = useState(value);
    
    useEffect(() => {
        const duration = 500;
        const startTime = Date.now();
        const startValue = displayValue;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = startValue + (value - startValue) * easeProgress;
            setDisplayValue(current);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }, [value]);
    
    const formattedValue = format === 'currency' 
        ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(displayValue)
        : format === 'time'
        ? formatTimeValue(displayValue)
        : Math.floor(displayValue);
    
    return <span style={{ color }}>{formattedValue}</span>;
});

// Helper for time formatting
function formatTimeValue(minutes) {
    if (minutes < 60) return `${Math.floor(minutes)}m`;
    if (minutes < 1440) return `${(minutes / 60).toFixed(1)}h`;
    return `${(minutes / 1440).toFixed(1)}d`;
}

// Circular Progress Ring
const CircularProgress = memo(({ progress, color, size = 120, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;
    
    return (
        <svg width={size} height={size} className="transform -rotate-90">
            {/* Background ring */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={strokeWidth}
            />
            {/* Progress ring */}
            <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{ filter: `drop-shadow(0 0 8px ${color})` }}
            />
        </svg>
    );
});

// Milestone indicator
const MilestoneIndicator = ({ days, milestones, color }) => {
    const currentMilestoneIndex = milestones.findIndex(m => m > days);
    const nextMilestone = milestones[currentMilestoneIndex] || milestones[milestones.length - 1];
    const prevMilestone = milestones[currentMilestoneIndex - 1] || 0;
    const progressToNext = Math.min(((days - prevMilestone) / (nextMilestone - prevMilestone)) * 100, 100);
    
    return (
        <div className="relative">
            <div className="flex justify-between text-[9px] font-mono text-(--text-dim) mb-1">
                <span>DAY {prevMilestone}</span>
                <span className="text-(--text-secondary)">NEXT: DAY {nextMilestone}</span>
            </div>
            <div className="h-1.5 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNext}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </div>
        </div>
    );
};

export default function SubstanceDashboard({ substance, onLogEntry, onInitialize }) {
    const { progress, quitDates, userSettings, entries, addEntry } = useRecovery();
    const [tickingMoney, setTickingMoney] = useState(0);
    const [tickingLife, setTickingLife] = useState(0);
    const [showHealthInfo, setShowHealthInfo] = useState(false);
    const cardRef = useRef(null);

    const config = SUBSTANCE_CONFIG[substance];
    const isActive = !!quitDates[substance];
    const substanceProgress = progress[substance];
    const costPerDay = userSettings?.costs?.[substance] || 350;
    const days = substanceProgress?.streak?.days || 0;

    // Live ticking effect for money and life
    useEffect(() => {
        if (!isActive || !quitDates[substance]) return;

        const updateTickers = () => {
            const quitDate = new Date(quitDates[substance]);
            const now = new Date();
            const msElapsed = now - quitDate;
            const daysElapsed = msElapsed / (1000 * 60 * 60 * 24);

            // Money saved (cost per day * days)
            const moneySaved = daysElapsed * costPerDay;
            setTickingMoney(moneySaved);

            // Life regained (units not consumed * minutes per unit)
            const unitsNotConsumed = daysElapsed * config.usagePerDay;
            const minutesRegained = unitsNotConsumed * config.lifeMinutesPerUnit;
            setTickingLife(minutesRegained);
        };

        updateTickers();
        const interval = setInterval(updateTickers, 1000);

        return () => clearInterval(interval);
    }, [isActive, quitDates, substance, costPerDay, config]);

    // Get current health benefit
    const getCurrentBenefit = useCallback(() => {
        const benefits = config.healthBenefits;
        // Calculate total hours since quit
        const totalHours = days * 24;
        
        for (let i = benefits.length - 1; i >= 0; i--) {
            const b = benefits[i];
            // Check if this benefit has been achieved (using hours for precision)
            const benefitHours = b.hour !== undefined ? b.hour : (b.day || 0) * 24;
            if (totalHours >= benefitHours) return b;
        }
        return benefits[0];
    }, [days, config]);

    // Quick action handlers
    const handleLogCleanDay = () => {
        addEntry({
            type: 'progress',
            substance,
            notes: 'Clean day logged ✓',
            timestamp: Date.now()
        });
    };

    const handleLogRelapse = () => {
        if (onLogEntry) {
            onLogEntry('relapse', substance);
        }
    };

    // Format helpers
    const formatQuitDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // --- INACTIVE STATE ---
    if (!isActive) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group"
            >
                <div className="absolute inset-0 bg-linear-to-br from-white/[0.02] to-transparent rounded-xl" />
                <HudCard className="p-5 border-dashed border-(--border-dim) opacity-60 hover:opacity-80 transition-opacity">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-2xl">
                                {config.icon}
                            </div>
                            <div>
                                <span className="text-sm font-bold uppercase tracking-widest text-white block">{config.label}</span>
                                <span className="text-[10px] text-(--text-dim)">PROTOCOL OFFLINE</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500/50" />
                            <span className="text-[10px] text-red-400">INACTIVE</span>
                        </div>
                    </div>
                    
                    <div className="text-center py-6 border-y border-(--border-dim) border-dashed">
                        <div className="text-4xl mb-2 opacity-30">{config.icon}</div>
                        <p className="text-(--text-secondary) text-xs mb-1">Recovery protocol not initialized</p>
                        <p className="text-(--text-dim) text-[10px]">Begin your journey to freedom</p>
                    </div>
                    
                    <motion.button
                        onClick={() => onInitialize && onInitialize(substance)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full mt-6 py-3 border border-(--text-secondary) text-(--text-secondary) 
                                   hover:border-white hover:text-white hover:bg-white/5
                                   text-xs font-mono transition-all duration-300 rounded-lg
                                   flex items-center justify-center gap-2"
                    >
                        <span className="text-lg">⚡</span>
                        INITIALIZE RECOVERY PROTOCOL
                    </motion.button>
                </HudCard>
            </motion.div>
        );
    }

    // --- ACTIVE STATE ---
    const currentBenefit = getCurrentBenefit();
    
    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="relative group"
        >
            {/* Glow effect */}
            <div 
                className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                style={{ background: config.bgGlow }}
            />
            
            <HudCard className="p-0 overflow-hidden relative">
                {/* Colored top border */}
                <div 
                    className="h-1 w-full"
                    style={{ background: config.gradient }}
                />
                
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-[0.03]">
                    <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                </div>

                <div className="p-5 relative">
                    {/* HEADER */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <motion.div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl relative"
                                style={{ background: `${config.bgGlow}` }}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                                {config.icon}
                                <div className="absolute inset-0 rounded-xl animate-pulse" style={{ boxShadow: `0 0 20px ${config.color}40` }} />
                            </motion.div>
                            <div>
                                <span className="text-sm font-bold uppercase tracking-widest text-white block">{config.label}</span>
                                <span className="text-[10px] text-(--text-dim)">RECOVERY ACTIVE</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <motion.div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: config.color }}
                                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <span className="text-[10px] font-mono" style={{ color: config.color }}>ONLINE</span>
                        </div>
                    </div>

                    {/* HERO SECTION - Days Clean with Circular Progress */}
                    <div className="flex items-center justify-center gap-6 py-4 border-y border-(--border-dim)">
                        <div className="relative">
                            <CircularProgress 
                                progress={Math.min((substanceProgress?.progress || 0), 100)} 
                                color={config.color} 
                                size={100}
                                strokeWidth={6}
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="text-3xl font-mono font-black text-white">
                                    {days}
                                </div>
                                <div className="text-[8px] text-(--text-dim) tracking-wider">DAYS</div>
                            </div>
                        </div>
                        
                        <div className="text-left">
                            <div className="text-[10px] text-(--text-secondary) mb-1">CURRENT BENEFIT</div>
                            <div className="text-sm text-white font-medium mb-2">{currentBenefit?.benefit}</div>
                            <button 
                                onClick={() => setShowHealthInfo(!showHealthInfo)}
                                className="text-[10px] font-mono flex items-center gap-1 hover:opacity-80"
                                style={{ color: config.color }}
                            >
                                {showHealthInfo ? '▼' : '▶'} VIEW ALL BENEFITS
                            </button>
                        </div>
                    </div>

                    {/* Health Benefits Dropdown */}
                    <AnimatePresence>
                        {showHealthInfo && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="py-3 space-y-2 border-b border-(--border-dim) max-h-[300px] overflow-y-auto scrollbar-thin">
                                    {config.healthBenefits.map((b, i) => {
                                        // Calculate if this benefit has been achieved
                                        // For hour-based benefits, convert to days
                                        const benefitDays = b.hour ? b.hour / 24 : (b.day || 0);
                                        const achieved = days >= benefitDays;
                                        
                                        return (
                                            <motion.div 
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.03 }}
                                                className={`flex items-start gap-2 text-[10px] py-1 px-2 rounded-md transition-all
                                                    ${achieved ? 'bg-[rgba(0,255,136,0.05)]' : 'opacity-50'}`}
                                            >
                                                <span 
                                                    className="mt-0.5 text-xs"
                                                    style={{ color: achieved ? config.color : 'var(--text-dim)' }}
                                                >
                                                    {achieved ? '✓' : '○'}
                                                </span>
                                                <span className="text-white leading-relaxed">{b.benefit}</span>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* STATS GRID */}
                    <div className="grid grid-cols-2 gap-3 my-4">
                        {/* Money Saved */}
                        <motion.div 
                            className="bg-[rgba(0,255,136,0.05)] p-3 rounded-lg border border-[rgba(0,255,136,0.1)]"
                            whileHover={{ scale: 1.02, borderColor: 'rgba(0,255,136,0.3)' }}
                        >
                            <div className="text-[9px] text-(--text-dim) mb-1 flex items-center gap-1">
                                <span>💰</span> CAPITAL SAVED
                            </div>
                            <div className="text-lg font-mono font-bold">
                                <AnimatedCounter value={tickingMoney} format="currency" color="#00FF88" />
                            </div>
                        </motion.div>

                        {/* Life Regained */}
                        <motion.div 
                            className="bg-[rgba(0,240,255,0.05)] p-3 rounded-lg border border-[rgba(0,240,255,0.1)]"
                            whileHover={{ scale: 1.02, borderColor: 'rgba(0,240,255,0.3)' }}
                        >
                            <div className="text-[9px] text-(--text-dim) mb-1 flex items-center gap-1">
                                <span>⏱️</span> LIFE REGAINED
                            </div>
                            <div className="text-lg font-mono font-bold">
                                <AnimatedCounter value={tickingLife} format="time" color="#00F0FF" />
                            </div>
                        </motion.div>

                        {/* Recovery Progress */}
                        <motion.div 
                            className="bg-[rgba(147,51,234,0.05)] p-3 rounded-lg border border-[rgba(147,51,234,0.1)]"
                            whileHover={{ scale: 1.02, borderColor: 'rgba(147,51,234,0.3)' }}
                        >
                            <div className="text-[9px] text-(--text-dim) mb-1 flex items-center gap-1">
                                <span>📊</span> RECOVERY
                            </div>
                            <div className="text-lg font-mono font-bold text-[#9333EA]">
                                {Math.round(substanceProgress?.progress || 0)}%
                            </div>
                        </motion.div>

                        {/* Quit Date */}
                        <motion.div 
                            className="bg-[rgba(255,255,255,0.02)] p-3 rounded-lg border border-[rgba(255,255,255,0.05)]"
                            whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.1)' }}
                        >
                            <div className="text-[9px] text-(--text-dim) mb-1 flex items-center gap-1">
                                <span>📅</span> INITIATED
                            </div>
                            <div className="text-sm font-mono text-white">
                                {formatQuitDate(quitDates[substance])}
                            </div>
                        </motion.div>
                    </div>

                    {/* MILESTONE PROGRESS */}
                    <div className="mb-4">
                        <MilestoneIndicator days={days} milestones={config.milestones} color={config.gradient} />
                    </div>

                    {/* DAILY CHECK-IN ACTIONS */}
                    <div className="flex gap-2">
                        <motion.button
                            onClick={handleLogCleanDay}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 py-3 rounded-lg text-xs font-mono font-bold transition-all duration-300
                                       bg-[rgba(0,255,136,0.1)] hover:bg-[rgba(0,255,136,0.2)] text-[#00FF88]
                                       border border-[rgba(0,255,136,0.2)] hover:border-[rgba(0,255,136,0.4)]
                                       flex items-center justify-center gap-2"
                        >
                            <span>✓</span> CLEAN TODAY
                        </motion.button>
                        <motion.button
                            onClick={handleLogRelapse}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-3 rounded-lg text-xs font-mono transition-all duration-300
                                       bg-[rgba(255,0,100,0.1)] hover:bg-[rgba(255,0,100,0.2)] text-[#FF0064]
                                       border border-[rgba(255,0,100,0.2)] hover:border-[rgba(255,0,100,0.4)]"
                        >
                            ⚠ LOG
                        </motion.button>
                    </div>
                </div>
            </HudCard>
        </motion.div>
    );
}
