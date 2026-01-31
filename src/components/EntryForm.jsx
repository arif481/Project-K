import { useState } from 'react';
import { useRecovery } from '../context/RecoveryContext';
import { HudButton } from './HudComponents';

export default function EntryForm({ initialSubstance = 'cigarettes', initialType = 'log', onClose }) {
    const { addEntry } = useRecovery();

    const [formData, setFormData] = useState({
        substance: initialSubstance,
        type: initialType === 'progress' ? 'log' : initialType, // Normalize 'progress' to 'log' if needed
        date: new Date().toISOString().slice(0, 16),
        amount: '',
        unit: initialSubstance === 'cigarettes' ? 'cigarettes' : initialSubstance === 'alcohol' ? 'drinks' : 'grams',
        cost: '',
        feeling: 50,
        craving: 0,
        notes: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.substance || !formData.date) return;

        addEntry({
            ...formData,
            id: Date.now(),
            timestamp: new Date(formData.date).getTime()
        });

        if (onClose) onClose();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Substance & Type Selection */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="hud-label block mb-1">PROTOCOL</label>
                    <select
                        name="substance"
                        value={formData.substance}
                        onChange={handleChange}
                        className="w-full bg-[var(--bg-grid)] border border-[var(--border-dim)] text-white p-2 font-mono text-sm focus:border-[var(--neon-cyan)] outline-none"
                    >
                        <option value="cigarettes">CIGARETTES</option>
                        <option value="cannabis">CANNABIS</option>
                        <option value="alcohol">ALCOHOL</option>
                    </select>
                </div>
                <div>
                    <label className="hud-label block mb-1">ENTRY TYPE</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full bg-[var(--bg-grid)] border border-[var(--border-dim)] text-white p-2 font-mono text-sm focus:border-[var(--neon-cyan)] outline-none"
                    >
                        <option value="quit">INITIATE QUIT</option>
                        <option value="relapse">RELAPSE INCIDENT</option>
                        <option value="log">DAILY LOG</option>
                    </select>
                </div>
            </div>

            {/* Timestamp */}
            <div>
                <label className="hud-label block mb-1">TIMESTAMP</label>
                <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full bg-[var(--bg-grid)] border border-[var(--border-dim)] text-white p-2 font-mono text-sm focus:border-[var(--neon-cyan)] outline-none"
                />
            </div>

            {/* Metrics: Logic based on type */}
            {formData.type !== 'quit' && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="hud-label block mb-1">AMOUNT</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                name="amount"
                                placeholder="0.0"
                                value={formData.amount}
                                onChange={handleChange}
                                className="w-full bg-[var(--bg-grid)] border border-[var(--border-dim)] text-white p-2 font-mono text-sm focus:border-[var(--neon-cyan)] outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="hud-label block mb-1">COST ($Estimate)</label>
                        <input
                            type="number"
                            name="cost"
                            placeholder="0.00"
                            value={formData.cost}
                            onChange={handleChange}
                            className="w-full bg-[var(--bg-grid)] border border-[var(--border-dim)] text-white p-2 font-mono text-sm focus:border-[var(--neon-cyan)] outline-none"
                        />
                    </div>
                </div>
            )}

            {/* Sliders */}
            <div className="space-y-4 border-t border-[var(--border-dim)] pt-4 mt-2">
                <div>
                    <div className="flex justify-between mb-1">
                        <label className="hud-label">MOOD STATUS</label>
                        <span className="text-[var(--neon-cyan)] font-mono text-xs">{formData.feeling}%</span>
                    </div>
                    <input
                        type="range"
                        name="feeling"
                        min="0" max="100"
                        value={formData.feeling}
                        onChange={handleChange}
                        className="w-full h-1 bg-[var(--border-dim)] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[var(--neon-cyan)]"
                    />
                </div>

                <div>
                    <div className="flex justify-between mb-1">
                        <label className="hud-label text-[var(--neon-magenta)]">CRAVING INTENSITY</label>
                        <span className="text-[var(--neon-magenta)] font-mono text-xs">{formData.craving}%</span>
                    </div>
                    <input
                        type="range"
                        name="craving"
                        min="0" max="100"
                        value={formData.craving}
                        onChange={handleChange}
                        className="w-full h-1 bg-[var(--border-dim)] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[var(--neon-magenta)]"
                    />
                </div>
            </div>

            {/* Notes */}
            <div>
                <label className="hud-label block mb-1">OFFICER NOTES</label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full bg-[var(--bg-grid)] border border-[var(--border-dim)] text-white p-2 font-mono text-sm focus:border-[var(--neon-cyan)] outline-none resize-none"
                    placeholder="Enter observation details..."
                />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
                <HudButton type="button" onClick={onClose} variant="danger">CANCEL</HudButton>
                <HudButton type="submit" variant="primary">CONFIRM DATA</HudButton>
            </div>
        </form>
    );
}
