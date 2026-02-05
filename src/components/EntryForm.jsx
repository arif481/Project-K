// EntryForm.jsx - Data Entry Terminal v4.0
import { useState, useEffect, useRef } from 'react';
import { useRecovery } from '../context/RecoveryContext';
import { HudButton } from './HudComponents';
import { motion, AnimatePresence } from 'framer-motion';

const SUBSTANCE_INFO = {
    cigarettes: { icon: '🚬', label: 'NICOTINE', unit: 'cigarettes', color: '#00F0FF' },
    cannabis: { icon: '🌿', label: 'CANNABIS', unit: 'grams', color: '#00FF88' },
    alcohol: { icon: '🍺', label: 'ALCOHOL', unit: 'drinks', color: '#FF0064' }
};

const TYPE_CONFIG = {
    quit: { icon: '🚀', label: 'INITIATE QUIT', desc: 'Start a new recovery protocol', color: '#00FF88' },
    relapse: { icon: '⚠️', label: 'RELAPSE', desc: 'Record a setback incident', color: '#FF0064' },
    log: { icon: '📊', label: 'DAILY LOG', desc: 'Daily check-in & mood tracking', color: '#00F0FF' }
};

// Custom slider component with animated track
const AnimatedSlider = ({ value, onChange, name, color, leftLabel, rightLabel }) => {
    const trackRef = useRef(null);
    
    return (
        <div className="relative">
            <div className="relative h-2 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                <motion.div 
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
                <input
                    ref={trackRef}
                    type="range"
                    name={name}
                    min="0" 
                    max="100"
                    value={value}
                    onChange={onChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
            </div>
            {/* Custom thumb */}
            <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full pointer-events-none"
                style={{ 
                    left: `calc(${value}% - 8px)`,
                    background: color,
                    boxShadow: `0 0 15px ${color}, 0 0 30px ${color}50`
                }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="flex justify-between text-[8px] text-(--text-dim) mt-2">
                <span>{leftLabel}</span>
                <span>{rightLabel}</span>
            </div>
        </div>
    );
};

// Selection card component
const SelectionCard = ({ active, onClick, icon, label, description, color }) => (
    <motion.button
        type="button"
        onClick={onClick}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`p-3 rounded-xl border text-left transition-all ${
            active 
                ? 'bg-opacity-100' 
                : 'bg-[rgba(255,255,255,0.02)] border-(--border-dim) hover:border-opacity-50'
        }`}
        style={active ? { 
            background: `${color}15`, 
            borderColor: `${color}50`,
            boxShadow: `0 0 20px ${color}20`
        } : {}}
    >
        <div className="flex items-center gap-3">
            <span className="text-xl">{icon}</span>
            <div>
                <div className="text-xs font-mono font-bold" style={{ color: active ? color : 'white' }}>
                    {label}
                </div>
                {description && (
                    <div className="text-[9px] text-(--text-dim)">{description}</div>
                )}
            </div>
        </div>
        {active && (
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{ background: color }}
            />
        )}
    </motion.button>
);

export default function EntryForm({ initialSubstance = 'cigarettes', initialType = 'log', onClose }) {
    const { addEntry, quitDates } = useRecovery();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [step, setStep] = useState(1); // Multi-step form

    const [formData, setFormData] = useState({
        substance: initialSubstance,
        type: initialType === 'progress' ? 'log' : initialType,
        date: new Date().toISOString().slice(0, 16),
        amount: '',
        unit: SUBSTANCE_INFO[initialSubstance]?.unit || 'units',
        cost: '',
        feeling: 50,
        craving: 0,
        notes: ''
    });

    // Update unit when substance changes
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            unit: SUBSTANCE_INFO[prev.substance]?.unit || 'units'
        }));
    }, [formData.substance]);

    // Check if protocol exists for quit type warning
    const hasExistingQuit = quitDates[formData.substance];
    const substanceInfo = SUBSTANCE_INFO[formData.substance];
    const typeInfo = TYPE_CONFIG[formData.type];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.substance || !formData.date) return;

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            await addEntry({
                ...formData,
                id: Date.now(),
                timestamp: new Date(formData.date).getTime()
            });
            
            setSubmitStatus('success');
            
            setTimeout(() => {
                if (onClose) onClose();
            }, 1000);
        } catch (error) {
            console.error('Entry Error:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Progress indicator
    const totalSteps = formData.type === 'quit' ? 2 : 3;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative"
        >
            {/* Background effect */}
            <div 
                className="absolute inset-0 rounded-xl opacity-30 blur-3xl pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 0%, ${substanceInfo?.color}20, transparent 70%)` }}
            />

            <form onSubmit={handleSubmit} className="relative flex flex-col gap-4">
                {/* Header */}
                <div 
                    className="p-4 rounded-xl mb-2 relative overflow-hidden"
                    style={{ background: `${substanceInfo?.color}10`, border: `1px solid ${substanceInfo?.color}30` }}
                >
                    <div 
                        className="absolute top-0 left-0 h-1 rounded-full transition-all duration-500"
                        style={{ 
                            width: `${(step / totalSteps) * 100}%`,
                            background: substanceInfo?.color
                        }}
                    />
                    <div className="flex items-center gap-3">
                        <motion.span 
                            className="text-3xl"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            {substanceInfo?.icon}
                        </motion.span>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white uppercase tracking-wider">
                                    {substanceInfo?.label}
                                </span>
                                <span 
                                    className="text-[9px] px-2 py-0.5 rounded-full font-mono"
                                    style={{ background: `${typeInfo?.color}20`, color: typeInfo?.color }}
                                >
                                    {typeInfo?.icon} {typeInfo?.label}
                                </span>
                            </div>
                            <p className="text-[10px] text-(--text-dim) font-mono mt-1">{typeInfo?.desc}</p>
                        </div>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-2 mb-2">
                    {[...Array(totalSteps)].map((_, i) => (
                        <div key={i} className="flex items-center gap-2 flex-1">
                            <div 
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                                    i + 1 <= step 
                                        ? 'text-black' 
                                        : 'text-(--text-dim) bg-[rgba(255,255,255,0.05)]'
                                }`}
                                style={i + 1 <= step ? { background: substanceInfo?.color } : {}}
                            >
                                {i + 1}
                            </div>
                            {i < totalSteps - 1 && (
                                <div 
                                    className="flex-1 h-0.5 rounded-full transition-all"
                                    style={{ background: i + 1 < step ? substanceInfo?.color : 'rgba(255,255,255,0.1)' }}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            {/* Substance Selection */}
                            <div>
                                <label className="text-[10px] text-(--text-dim) font-mono mb-2 block tracking-wider">
                                    SELECT PROTOCOL
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.entries(SUBSTANCE_INFO).map(([key, info]) => (
                                        <SelectionCard
                                            key={key}
                                            active={formData.substance === key}
                                            onClick={() => setFormData(prev => ({ ...prev, substance: key }))}
                                            icon={info.icon}
                                            label={info.label}
                                            color={info.color}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Type Selection */}
                            <div>
                                <label className="text-[10px] text-(--text-dim) font-mono mb-2 block tracking-wider">
                                    ENTRY TYPE
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                    {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                                        <SelectionCard
                                            key={key}
                                            active={formData.type === key}
                                            onClick={() => setFormData(prev => ({ ...prev, type: key }))}
                                            icon={config.icon}
                                            label={config.label}
                                            description={config.desc}
                                            color={config.color}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Warning for existing quit */}
                            {formData.type === 'quit' && hasExistingQuit && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="text-[10px] text-[#FFE600] font-mono bg-[rgba(255,230,0,0.1)] p-3 rounded-lg border border-[rgba(255,230,0,0.3)]"
                                >
                                    ⚠ PROTOCOL ALREADY ACTIVE — This will reset your current {formData.substance} streak
                                </motion.div>
                            )}

                            {/* Timestamp */}
                            <div>
                                <label className="text-[10px] text-(--text-dim) font-mono mb-2 block tracking-wider">
                                    TIMESTAMP
                                </label>
                                <input
                                    type="datetime-local"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="w-full bg-[rgba(255,255,255,0.02)] border border-(--border-dim) rounded-lg
                                               text-white p-3 font-mono text-sm 
                                               focus:border-(--neon-cyan) focus:bg-[rgba(0,240,255,0.02)]
                                               outline-none transition-all"
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && formData.type !== 'quit' && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            {/* Amount & Cost */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-(--text-dim) font-mono mb-2 block tracking-wider">
                                        AMOUNT ({formData.unit})
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        placeholder="0"
                                        min="0"
                                        step="0.5"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        className="w-full bg-[rgba(255,255,255,0.02)] border border-(--border-dim) rounded-lg
                                                   text-white p-3 font-mono text-sm 
                                                   focus:border-(--neon-cyan) outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-(--text-dim) font-mono mb-2 block tracking-wider">
                                        COST (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="cost"
                                        placeholder="0"
                                        min="0"
                                        value={formData.cost}
                                        onChange={handleChange}
                                        className="w-full bg-[rgba(255,255,255,0.02)] border border-(--border-dim) rounded-lg
                                                   text-white p-3 font-mono text-sm 
                                                   focus:border-(--neon-cyan) outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Mood Slider */}
                            <div>
                                <div className="flex justify-between mb-3">
                                    <label className="text-[10px] text-(--text-dim) font-mono tracking-wider">
                                        😊 MOOD STATUS
                                    </label>
                                    <span 
                                        className="font-mono text-sm font-bold px-2 py-0.5 rounded"
                                        style={{ 
                                            color: '#00F0FF',
                                            background: 'rgba(0,240,255,0.1)'
                                        }}
                                    >
                                        {formData.feeling}%
                                    </span>
                                </div>
                                <AnimatedSlider
                                    value={formData.feeling}
                                    onChange={handleChange}
                                    name="feeling"
                                    color="#00F0FF"
                                    leftLabel="CRITICAL"
                                    rightLabel="OPTIMAL"
                                />
                            </div>

                            {/* Craving Slider */}
                            <div>
                                <div className="flex justify-between mb-3">
                                    <label className="text-[10px] text-(--text-dim) font-mono tracking-wider">
                                        🔥 CRAVING INTENSITY
                                    </label>
                                    <span 
                                        className="font-mono text-sm font-bold px-2 py-0.5 rounded"
                                        style={{ 
                                            color: '#FF0064',
                                            background: 'rgba(255,0,100,0.1)'
                                        }}
                                    >
                                        {formData.craving}%
                                    </span>
                                </div>
                                <AnimatedSlider
                                    value={formData.craving}
                                    onChange={handleChange}
                                    name="craving"
                                    color="#FF0064"
                                    leftLabel="NONE"
                                    rightLabel="SEVERE"
                                />
                            </div>
                        </motion.div>
                    )}

                    {((step === 3 && formData.type !== 'quit') || (step === 2 && formData.type === 'quit')) && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            {/* Notes */}
                            <div>
                                <label className="text-[10px] text-(--text-dim) font-mono mb-2 block tracking-wider">
                                    📝 MISSION NOTES
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full bg-[rgba(255,255,255,0.02)] border border-(--border-dim) rounded-lg
                                               text-white p-3 font-mono text-sm 
                                               focus:border-(--neon-cyan) outline-none resize-none transition-all"
                                    placeholder="Document your observations, triggers, or victories..."
                                />
                            </div>

                            {/* Summary */}
                            <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-(--border-dim)">
                                <div className="text-[10px] text-(--text-dim) font-mono mb-3">ENTRY SUMMARY</div>
                                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                                    <div>
                                        <span className="text-(--text-dim)">Protocol:</span>
                                        <span className="ml-2 text-white">{substanceInfo?.label}</span>
                                    </div>
                                    <div>
                                        <span className="text-(--text-dim)">Type:</span>
                                        <span className="ml-2" style={{ color: typeInfo?.color }}>{typeInfo?.label}</span>
                                    </div>
                                    {formData.type !== 'quit' && (
                                        <>
                                            <div>
                                                <span className="text-(--text-dim)">Mood:</span>
                                                <span className="ml-2 text-[#00F0FF]">{formData.feeling}%</span>
                                            </div>
                                            <div>
                                                <span className="text-(--text-dim)">Craving:</span>
                                                <span className="ml-2 text-[#FF0064]">{formData.craving}%</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Status Message */}
                <AnimatePresence>
                    {submitStatus && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className={`text-center py-3 rounded-lg font-mono text-sm ${
                                submitStatus === 'success' 
                                    ? 'text-[#00FF88] bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.3)]' 
                                    : 'text-[#FF0064] bg-[rgba(255,0,100,0.1)] border border-[rgba(255,0,100,0.3)]'
                            }`}
                        >
                            {submitStatus === 'success' ? '✓ DATA LOGGED SUCCESSFULLY' : '✕ TRANSMISSION FAILED'}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mt-2">
                    {step > 1 ? (
                        <motion.button
                            type="button"
                            onClick={() => setStep(s => s - 1)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="py-3 rounded-lg font-mono text-sm border border-(--border-dim) 
                                       text-(--text-secondary) hover:text-white hover:border-white transition-all"
                        >
                            ← BACK
                        </motion.button>
                    ) : (
                        <motion.button
                            type="button"
                            onClick={onClose}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="py-3 rounded-lg font-mono text-sm border border-[rgba(255,0,100,0.3)] 
                                       text-[#FF0064] hover:bg-[rgba(255,0,100,0.1)] transition-all"
                        >
                            ABORT
                        </motion.button>
                    )}
                    
                    {step < totalSteps ? (
                        <motion.button
                            type="button"
                            onClick={() => setStep(s => s + 1)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="py-3 rounded-lg font-mono text-sm font-bold text-black transition-all"
                            style={{ background: substanceInfo?.color }}
                        >
                            NEXT →
                        </motion.button>
                    ) : (
                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="py-3 rounded-lg font-mono text-sm font-bold text-black transition-all
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: '#00FF88' }}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <motion.span
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    >
                                        ⟳
                                    </motion.span>
                                    TRANSMITTING...
                                </span>
                            ) : (
                                '✓ CONFIRM'
                            )}
                        </motion.button>
                    )}
                </div>
            </form>
        </motion.div>
    );
}
