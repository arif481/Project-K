// UsageAssessmentForm.jsx - Comprehensive Usage History Assessment v4.0
// Collects user's substance usage history to calculate damage levels
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecovery } from '../context/RecoveryContext';
import { HudCard, HudButton } from './HudComponents';
import NeuralBodyVisualization from './NeuralBodyVisualization';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// ==========================================
// QUESTIONNAIRE CONFIGURATION
// ==========================================
const SUBSTANCES = [
    { 
        id: 'cigarettes', 
        label: 'NICOTINE/TOBACCO', 
        icon: '🚬',
        color: '#00F0FF',
        description: 'Cigarettes, vapes, nicotine patches, etc.'
    },
    { 
        id: 'cannabis', 
        label: 'CANNABIS/THC', 
        icon: '🌿',
        color: '#00FF88',
        description: 'Marijuana, edibles, concentrates, etc.'
    },
    { 
        id: 'alcohol', 
        label: 'ALCOHOL', 
        icon: '🍺',
        color: '#FF0064',
        description: 'Beer, wine, spirits, etc.'
    }
];

const FREQUENCY_OPTIONS = [
    { value: 'multiple-daily', label: 'Multiple times daily', severity: 1.0 },
    { value: 'daily', label: 'Once daily', severity: 0.8 },
    { value: 'weekly', label: 'Few times a week', severity: 0.5 },
    { value: 'monthly', label: 'Few times a month', severity: 0.2 },
    { value: 'rarely', label: 'Rarely/Socially', severity: 0.1 }
];

const AMOUNT_OPTIONS = [
    { value: 'heavy', label: 'Heavy', description: 'Above average consumption', severity: 1.0 },
    { value: 'moderate', label: 'Moderate', description: 'Average consumption', severity: 0.6 },
    { value: 'light', label: 'Light', description: 'Below average consumption', severity: 0.3 }
];

const AGE_STARTED_OPTIONS = [
    { value: 'under-15', label: 'Under 15', impact: 1.0 },
    { value: '15-18', label: '15-18 years', impact: 0.8 },
    { value: '18-21', label: '18-21 years', impact: 0.6 },
    { value: '21-25', label: '21-25 years', impact: 0.4 },
    { value: '25-30', label: '25-30 years', impact: 0.3 },
    { value: 'over-30', label: 'Over 30', impact: 0.2 }
];

// ==========================================
// ANIMATED OPTION BUTTON
// ==========================================
const OptionButton = ({ selected, onClick, children, color = '#00F0FF', className = '' }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative px-4 py-3 rounded-xl border text-left transition-all duration-300 ${className}
                    ${selected 
                        ? 'bg-white/10 border-white/30' 
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
        style={selected ? { 
            borderColor: color,
            boxShadow: `0 0 20px ${color}30, inset 0 0 20px ${color}10`
        } : {}}
    >
        {selected && (
            <motion.div
                layoutId="selected-indicator"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
            >
                ✓
            </motion.div>
        )}
        {children}
    </motion.button>
);

// ==========================================
// QUESTION STEP COMPONENT
// ==========================================
const QuestionStep = ({ 
    question, 
    description, 
    options, 
    value, 
    onChange, 
    color,
    showDescription = false
}) => (
    <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
    >
        <div className="mb-6">
            <h3 className="text-lg font-mono text-white mb-2">{question}</h3>
            {description && (
                <p className="text-sm text-white/50 font-mono">{description}</p>
            )}
        </div>
        
        <div className="grid gap-3">
            {options.map((option) => (
                <OptionButton
                    key={option.value}
                    selected={value === option.value}
                    onClick={() => onChange(option.value)}
                    color={color}
                >
                    <div className="font-mono text-sm text-white">{option.label}</div>
                    {showDescription && option.description && (
                        <div className="text-[11px] text-white/50 mt-1">{option.description}</div>
                    )}
                </OptionButton>
            ))}
        </div>
    </motion.div>
);

// ==========================================
// DATE INPUT COMPONENT
// ==========================================
const DateInputStep = ({ question, description, value, onChange, color, maxDate }) => (
    <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
    >
        <div className="mb-6">
            <h3 className="text-lg font-mono text-white mb-2">{question}</h3>
            {description && (
                <p className="text-sm text-white/50 font-mono">{description}</p>
            )}
        </div>
        
        <div className="relative">
            <input
                type="date"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                max={maxDate || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10
                           font-mono text-white text-lg focus:border-white/30 focus:outline-none
                           transition-all"
                style={{ colorScheme: 'dark' }}
            />
            <div 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl"
                style={{ color }}
            >
                📅
            </div>
        </div>
        
        {value && (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-mono text-white/50 text-center mt-4"
            >
                {(() => {
                    const years = (new Date() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000);
                    if (years < 1) return `${Math.round(years * 12)} months of usage`;
                    return `${years.toFixed(1)} years of usage`;
                })()}
            </motion.div>
        )}
    </motion.div>
);

// ==========================================
// PROGRESS INDICATOR
// ==========================================
const ProgressIndicator = ({ current, total, color }) => (
    <div className="flex items-center gap-2 mb-8">
        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
                className="h-full rounded-full"
                style={{ background: color }}
                initial={{ width: 0 }}
                animate={{ width: `${(current / total) * 100}%` }}
                transition={{ duration: 0.3 }}
            />
        </div>
        <span className="text-[11px] font-mono text-white/50">
            {current}/{total}
        </span>
    </div>
);

// ==========================================
// SUBSTANCE ASSESSMENT CARD
// ==========================================
const SubstanceAssessment = ({ 
    substance, 
    data, 
    onChange, 
    isActive,
    onActivate,
    onComplete 
}) => {
    const [step, setStep] = useState(0);
    const totalSteps = 4;
    
    const handleNext = () => {
        if (step < totalSteps - 1) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };
    
    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };
    
    const updateData = (field, value) => {
        onChange({ ...data, [field]: value });
    };
    
    const canProceed = useMemo(() => {
        switch (step) {
            case 0: return !!data.usageStartDate;
            case 1: return !!data.frequency;
            case 2: return !!data.amount;
            case 3: return !!data.ageStarted;
            default: return false;
        }
    }, [step, data]);
    
    const isComplete = data.usageStartDate && data.frequency && data.amount && data.ageStarted;
    
    if (!isActive) {
        return (
            <motion.div
                onClick={onActivate}
                whileHover={{ scale: 1.01 }}
                className={`p-4 rounded-xl border cursor-pointer transition-all
                           ${isComplete 
                               ? 'bg-white/5 border-white/20' 
                               : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                           }`}
                style={isComplete ? { borderColor: `${substance.color}50` } : {}}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{substance.icon}</span>
                        <div>
                            <div className="font-mono text-sm text-white">{substance.label}</div>
                            <div className="text-[10px] text-white/50">{substance.description}</div>
                        </div>
                    </div>
                    {isComplete ? (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono" style={{ color: substance.color }}>
                                ASSESSED
                            </span>
                            <span className="text-lg">✓</span>
                        </div>
                    ) : (
                        <span className="text-sm text-white/30">TAP TO ASSESS</span>
                    )}
                </div>
            </motion.div>
        );
    }
    
    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 rounded-xl border bg-black/40 backdrop-blur-xl"
            style={{ borderColor: `${substance.color}30` }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{substance.icon}</span>
                    <div>
                        <div className="font-mono text-white">{substance.label}</div>
                        <div className="text-[10px] text-white/50">USAGE ASSESSMENT</div>
                    </div>
                </div>
                <button 
                    onClick={() => onActivate()}
                    className="text-white/50 hover:text-white p-2"
                >
                    ✕
                </button>
            </div>
            
            {/* Progress */}
            <ProgressIndicator current={step + 1} total={totalSteps} color={substance.color} />
            
            {/* Steps */}
            <AnimatePresence mode="wait">
                {step === 0 && (
                    <DateInputStep
                        key="date"
                        question="When did you start using?"
                        description="Approximate date is fine"
                        value={data.usageStartDate}
                        onChange={(v) => updateData('usageStartDate', v)}
                        color={substance.color}
                    />
                )}
                
                {step === 1 && (
                    <QuestionStep
                        key="frequency"
                        question="How often did you use?"
                        description="Select your typical usage pattern"
                        options={FREQUENCY_OPTIONS}
                        value={data.frequency}
                        onChange={(v) => updateData('frequency', v)}
                        color={substance.color}
                    />
                )}
                
                {step === 2 && (
                    <QuestionStep
                        key="amount"
                        question="What was your typical consumption level?"
                        options={AMOUNT_OPTIONS}
                        value={data.amount}
                        onChange={(v) => updateData('amount', v)}
                        color={substance.color}
                        showDescription
                    />
                )}
                
                {step === 3 && (
                    <QuestionStep
                        key="age"
                        question="At what age did you first start?"
                        description="Earlier usage typically has greater impact"
                        options={AGE_STARTED_OPTIONS}
                        value={data.ageStarted}
                        onChange={(v) => updateData('ageStarted', v)}
                        color={substance.color}
                    />
                )}
            </AnimatePresence>
            
            {/* Navigation */}
            <div className="flex justify-between mt-8">
                <motion.button
                    onClick={handleBack}
                    disabled={step === 0}
                    whileHover={{ scale: step > 0 ? 1.02 : 1 }}
                    whileTap={{ scale: step > 0 ? 0.98 : 1 }}
                    className={`px-6 py-3 rounded-xl font-mono text-sm transition-all
                               ${step > 0 
                                   ? 'text-white/70 hover:text-white border border-white/20' 
                                   : 'text-white/20 border border-white/10 cursor-not-allowed'
                               }`}
                >
                    ← BACK
                </motion.button>
                
                <motion.button
                    onClick={handleNext}
                    disabled={!canProceed}
                    whileHover={{ scale: canProceed ? 1.02 : 1 }}
                    whileTap={{ scale: canProceed ? 0.98 : 1 }}
                    className={`px-6 py-3 rounded-xl font-mono text-sm font-bold transition-all
                               ${canProceed 
                                   ? 'text-black' 
                                   : 'text-white/30 border border-white/10 cursor-not-allowed'
                               }`}
                    style={canProceed ? { 
                        background: substance.color,
                        boxShadow: `0 0 30px ${substance.color}40`
                    } : {}}
                >
                    {step === totalSteps - 1 ? 'COMPLETE ✓' : 'NEXT →'}
                </motion.button>
            </div>
        </motion.div>
    );
};

// ==========================================
// MAIN EXPORT COMPONENT
// ==========================================
export default function UsageAssessmentForm({ onComplete, existingProfile = null }) {
    const { user, quitDates, updateUserSettings, userSettings } = useRecovery();
    const [activeSubstance, setActiveSubstance] = useState(null);
    const [showVisualization, setShowVisualization] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savedProfile, setSavedProfile] = useState(null);
    
    // Initialize profile from existing data or empty
    const [profile, setProfile] = useState(() => {
        if (existingProfile) return existingProfile;
        
        const initial = {};
        SUBSTANCES.forEach(s => {
            initial[s.id] = {
                usageStartDate: '',
                frequency: '',
                amount: '',
                ageStarted: ''
            };
        });
        return initial;
    });
    
    // Load existing profile from settings
    useEffect(() => {
        if (userSettings?.usageProfile) {
            setProfile(userSettings.usageProfile);
            setSavedProfile(userSettings.usageProfile);
            
            // Check if any substance has data
            const hasData = Object.values(userSettings.usageProfile).some(
                p => p.usageStartDate || p.frequency
            );
            if (hasData) {
                setShowVisualization(true);
            }
        }
    }, [userSettings]);
    
    const updateSubstanceProfile = useCallback((substanceId, data) => {
        setProfile(prev => ({
            ...prev,
            [substanceId]: data
        }));
    }, []);
    
    const completedCount = useMemo(() => {
        return Object.values(profile).filter(
            p => p.usageStartDate && p.frequency && p.amount && p.ageStarted
        ).length;
    }, [profile]);
    
    const handleSaveProfile = async () => {
        if (!user) return;
        
        setIsSaving(true);
        try {
            // Save to Firebase under user settings
            await setDoc(doc(db, 'users', user.uid), {
                settings: {
                    ...userSettings,
                    usageProfile: profile
                }
            }, { merge: true });
            
            setSavedProfile(profile);
            setShowVisualization(true);
            
            if (onComplete) {
                onComplete(profile);
            }
        } catch (error) {
            // Handle silently
        } finally {
            setIsSaving(false);
        }
    };
    
    const hasChanges = JSON.stringify(profile) !== JSON.stringify(savedProfile);
    const canSave = completedCount > 0 && hasChanges;
    
    return (
        <div className="max-w-6xl mx-auto p-4 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full 
                                bg-white/5 border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
                    <span className="text-[10px] font-mono text-white/60 tracking-widest">
                        BIOMETRIC ASSESSMENT PROTOCOL
                    </span>
                </div>
                <h1 className="text-3xl font-mono font-bold text-white mb-2">
                    NEURAL DAMAGE ANALYSIS
                </h1>
                <p className="text-sm font-mono text-white/50 max-w-xl mx-auto">
                    Complete the assessment for each substance to generate your personalized 
                    neural body visualization with real-time damage tracking.
                </p>
            </motion.div>
            
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Assessment Form */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-mono text-white/60">
                            SUBSTANCE PROFILES ({completedCount}/{SUBSTANCES.length})
                        </h2>
                        {completedCount > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-[10px] font-mono text-[#00FF88]"
                            >
                                {Math.round((completedCount / SUBSTANCES.length) * 100)}% COMPLETE
                            </motion.div>
                        )}
                    </div>
                    
                    <div className="space-y-3">
                        {SUBSTANCES.map((substance) => (
                            <SubstanceAssessment
                                key={substance.id}
                                substance={substance}
                                data={profile[substance.id]}
                                onChange={(data) => updateSubstanceProfile(substance.id, data)}
                                isActive={activeSubstance === substance.id}
                                onActivate={() => setActiveSubstance(
                                    activeSubstance === substance.id ? null : substance.id
                                )}
                                onComplete={() => setActiveSubstance(null)}
                            />
                        ))}
                    </div>
                    
                    {/* Save Button */}
                    <motion.button
                        onClick={handleSaveProfile}
                        disabled={!canSave || isSaving}
                        whileHover={{ scale: canSave ? 1.02 : 1 }}
                        whileTap={{ scale: canSave ? 0.98 : 1 }}
                        className={`w-full py-4 rounded-xl font-mono text-sm font-bold transition-all
                                   ${canSave 
                                       ? 'bg-gradient-to-r from-[#00F0FF] to-[#00FF88] text-black' 
                                       : 'bg-white/5 text-white/30 cursor-not-allowed'
                                   }`}
                        style={canSave ? { boxShadow: '0 0 40px rgba(0,240,255,0.3)' } : {}}
                    >
                        {isSaving ? (
                            <span className="flex items-center justify-center gap-2">
                                <motion.span
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                >
                                    ⟳
                                </motion.span>
                                ANALYZING...
                            </span>
                        ) : savedProfile && !hasChanges ? (
                            '✓ PROFILE SAVED'
                        ) : (
                            'GENERATE NEURAL MAP →'
                        )}
                    </motion.button>
                    
                    {savedProfile && (
                        <p className="text-[10px] font-mono text-white/30 text-center">
                            Profile auto-syncs with your recovery data
                        </p>
                    )}
                </div>
                
                {/* Visualization Preview */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-mono text-white/60">
                            NEURAL BODY PREVIEW
                        </h2>
                        {showVisualization && (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                                <span className="text-[10px] font-mono text-[#00FF88]">LIVE</span>
                            </div>
                        )}
                    </div>
                    
                    <AnimatePresence mode="wait">
                        {showVisualization ? (
                            <motion.div
                                key="visualization"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <NeuralBodyVisualization userProfile={profile} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-[600px] rounded-2xl border border-dashed border-white/20
                                          flex flex-col items-center justify-center bg-white/[0.02]"
                            >
                                <div className="text-6xl mb-4 opacity-20">🧬</div>
                                <div className="text-sm font-mono text-white/30 text-center">
                                    Complete at least one substance<br/>
                                    assessment to generate visualization
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            
            {/* Info Panel */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="p-6 rounded-xl bg-white/[0.02] border border-white/10"
            >
                <div className="flex items-start gap-4">
                    <span className="text-2xl">ℹ️</span>
                    <div className="flex-1">
                        <h3 className="font-mono text-white text-sm mb-2">HOW IT WORKS</h3>
                        <div className="grid md:grid-cols-3 gap-4 text-[11px] font-mono text-white/50">
                            <div className="flex gap-2">
                                <span className="text-[#FF0044]">●</span>
                                <div>
                                    <strong className="text-white/70">Damage Calculation</strong>
                                    <p className="mt-1">Usage history determines initial organ damage levels</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-[#FFFF00]">●</span>
                                <div>
                                    <strong className="text-white/70">Live Tracking</strong>
                                    <p className="mt-1">Recovery progress updates damage in real-time</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-[#00FF88]">●</span>
                                <div>
                                    <strong className="text-white/70">Healing Progress</strong>
                                    <p className="mt-1">Watch red areas turn green as you recover</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// Export for use in settings/onboarding
export { SUBSTANCES, FREQUENCY_OPTIONS, AMOUNT_OPTIONS };
