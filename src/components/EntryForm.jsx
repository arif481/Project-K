import { useState, useEffect } from 'react';
import { useRecovery } from '../context/RecoveryContext';
import { HudButton } from './HudComponents';
import { motion } from 'framer-motion';

const SUBSTANCE_INFO = {
    cigarettes: { icon: '🚬', label: 'NICOTINE', unit: 'cigarettes' },
    cannabis: { icon: '🌿', label: 'CANNABIS', unit: 'grams' },
    alcohol: { icon: '🍺', label: 'ALCOHOL', unit: 'drinks' }
};

export default function EntryForm({ initialSubstance = 'cigarettes', initialType = 'log', onClose }) {
    const { addEntry, quitDates } = useRecovery();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

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
            
            // Auto close after success
            setTimeout(() => {
                if (onClose) onClose();
            }, 800);
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

    const getTypeDescription = () => {
        switch (formData.type) {
            case 'quit': return 'Start a new recovery protocol';
            case 'relapse': return 'Record a setback incident';
            case 'log': return 'Daily check-in & mood tracking';
            default: return '';
        }
    };

    return (
        <motion.form 
            onSubmit={handleSubmit} 
            className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Type Indicator Header */}
            <div className={`p-3 border-l-4 bg-[var(--bg-grid)] mb-2 ${
                formData.type === 'quit' ? 'border-[var(--neon-green)]' :
                formData.type === 'relapse' ? 'border-[var(--neon-magenta)]' :
                'border-[var(--neon-cyan)]'
            }`}>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{SUBSTANCE_INFO[formData.substance]?.icon}</span>
                    <span className="text-sm font-bold text-white uppercase tracking-wider">
                        {SUBSTANCE_INFO[formData.substance]?.label}
                    </span>
                </div>
                <p className="text-[10px] text-[var(--text-secondary)] font-mono">{getTypeDescription()}</p>
            </div>

            {/* Substance & Type Selection */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] text-[var(--neon-cyan)] font-mono mb-1 block tracking-wider">PROTOCOL</label>
                    <select
                        name="substance"
                        value={formData.substance}
                        onChange={handleChange}
                        className="w-full bg-[var(--bg-grid)] border border-[var(--border-dim)] text-white p-2 font-mono text-sm focus:border-[var(--neon-cyan)] outline-none transition-colors"
                    >
                        <option value="cigarettes">🚬 NICOTINE</option>
                        <option value="cannabis">🌿 CANNABIS</option>
                        <option value="alcohol">🍺 ALCOHOL</option>
                    </select>
                </div>
                <div>
                    <label className="text-[10px] text-[var(--neon-cyan)] font-mono mb-1 block tracking-wider">ENTRY TYPE</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full bg-[var(--bg-grid)] border border-[var(--border-dim)] text-white p-2 font-mono text-sm focus:border-[var(--neon-cyan)] outline-none transition-colors"
                    >
                        <option value="quit">🚀 INITIATE QUIT</option>
                        <option value="relapse">⚠️ RELAPSE</option>
                        <option value="log">📊 DAILY LOG</option>
                    </select>
                </div>
            </div>

            {/* Warning for existing quit */}
            {formData.type === 'quit' && hasExistingQuit && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-[10px] text-[var(--neon-yellow)] font-mono bg-[rgba(252,238,10,0.1)] p-2 border border-[var(--neon-yellow)]"
                >
                    ⚠ PROTOCOL ALREADY ACTIVE — This will reset your current {formData.substance} streak
                </motion.div>
            )}

            {/* Timestamp */}
            <div>
                <label className="text-[10px] text-[var(--neon-cyan)] font-mono mb-1 block tracking-wider">TIMESTAMP</label>
                <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full bg-[var(--bg-grid)] border border-[var(--border-dim)] text-white p-2 font-mono text-sm focus:border-[var(--neon-cyan)] outline-none transition-colors"
                />
            </div>

            {/* Metrics: Logic based on type */}
            {formData.type !== 'quit' && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] text-[var(--neon-cyan)] font-mono mb-1 block tracking-wider">
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
                            className="w-full bg-[var(--bg-grid)] border border-[var(--border-dim)] text-white p-2 font-mono text-sm focus:border-[var(--neon-cyan)] outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-[var(--neon-cyan)] font-mono mb-1 block tracking-wider">COST (₹)</label>
                        <input
                            type="number"
                            name="cost"
                            placeholder="0"
                            min="0"
                            value={formData.cost}
                            onChange={handleChange}
                            className="w-full bg-[var(--bg-grid)] border border-[var(--border-dim)] text-white p-2 font-mono text-sm focus:border-[var(--neon-cyan)] outline-none transition-colors"
                        />
                    </div>
                </div>
            )}

            {/* Sliders */}
            <div className="space-y-4 border-t border-[var(--border-dim)] pt-4 mt-2">
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-[10px] text-[var(--neon-cyan)] font-mono tracking-wider">MOOD STATUS</label>
                        <span className="text-[var(--neon-cyan)] font-mono text-xs font-bold">{formData.feeling}%</span>
                    </div>
                    <div className="relative">
                        <input
                            type="range"
                            name="feeling"
                            min="0" max="100"
                            value={formData.feeling}
                            onChange={handleChange}
                            className="w-full h-2 bg-[var(--bg-grid)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[var(--neon-cyan)] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_var(--neon-cyan)]"
                        />
                        <div className="flex justify-between text-[8px] text-[var(--text-dim)] mt-1">
                            <span>CRITICAL</span>
                            <span>OPTIMAL</span>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-[10px] text-[var(--neon-magenta)] font-mono tracking-wider">CRAVING INTENSITY</label>
                        <span className="text-[var(--neon-magenta)] font-mono text-xs font-bold">{formData.craving}%</span>
                    </div>
                    <div className="relative">
                        <input
                            type="range"
                            name="craving"
                            min="0" max="100"
                            value={formData.craving}
                            onChange={handleChange}
                            className="w-full h-2 bg-[var(--bg-grid)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[var(--neon-magenta)] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_var(--neon-magenta)]"
                        />
                        <div className="flex justify-between text-[8px] text-[var(--text-dim)] mt-1">
                            <span>NONE</span>
                            <span>SEVERE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div>
                <label className="text-[10px] text-[var(--neon-cyan)] font-mono mb-1 block tracking-wider">MISSION NOTES</label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full bg-[var(--bg-grid)] border border-[var(--border-dim)] text-white p-2 font-mono text-sm focus:border-[var(--neon-cyan)] outline-none resize-none transition-colors"
                    placeholder="Document your observations, triggers, or victories..."
                />
            </div>

            {/* Status Message */}
            {submitStatus && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-center py-2 font-mono text-sm ${
                        submitStatus === 'success' 
                            ? 'text-[var(--neon-green)] bg-[rgba(0,255,159,0.1)] border border-[var(--neon-green)]' 
                            : 'text-[var(--neon-magenta)] bg-[rgba(255,0,60,0.1)] border border-[var(--neon-magenta)]'
                    }`}
                >
                    {submitStatus === 'success' ? '✓ DATA LOGGED SUCCESSFULLY' : '✕ TRANSMISSION FAILED'}
                </motion.div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mt-2">
                <HudButton type="button" onClick={onClose} variant="danger" disabled={isSubmitting}>
                    ABORT
                </HudButton>
                <HudButton type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? 'TRANSMITTING...' : 'CONFIRM'}
                </HudButton>
            </div>
        </motion.form>
    );
}
