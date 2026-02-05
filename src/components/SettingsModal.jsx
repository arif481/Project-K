// SettingsModal.jsx - Enhanced System Configuration
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HudCard, HudButton } from './HudComponents';
import { useRecovery } from '../context/RecoveryContext';

const SUBSTANCE_CONFIG = {
    cigarettes: {
        label: 'NICOTINE',
        icon: '🚬',
        costLabel: 'Cost per Pack (₹)',
        costHint: 'Average price of a cigarette pack in your area',
        defaultCost: 350
    },
    cannabis: {
        label: 'CANNABIS',
        icon: '🌿',
        costLabel: 'Cost per Day (₹)',
        costHint: 'Average daily spending on cannabis',
        defaultCost: 500
    },
    alcohol: {
        label: 'ALCOHOL',
        icon: '🍺',
        costLabel: 'Cost per Day (₹)',
        costHint: 'Average daily spending on alcohol',
        defaultCost: 400
    }
};

export default function SettingsModal({ onClose }) {
    const { userSettings, updateUserSettings, quitDates } = useRecovery();
    const [costs, setCosts] = useState({
        cigarettes: 350,
        cannabis: 500,
        alcohol: 400
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (userSettings?.costs) {
            setCosts(prev => ({ ...prev, ...userSettings.costs }));
        }
    }, [userSettings]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateUserSettings({ costs });
            onClose();
        } catch (e) {
            console.error('Failed to save settings:', e);
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Not active';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const substances = ['cigarettes', 'cannabis', 'alcohol'];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 20 }}
            >
                <HudCard
                    title="SYSTEM CONFIGURATION"
                    className="w-full max-w-lg border-(--neon-magenta) shadow-[0_0_40px_rgba(255,0,60,0.15)]"
                >
                    <div className="space-y-6">

                        {/* Header */}
                        <p className="text-xs text-(--text-secondary) font-mono border-b border-(--border-dim) pb-3">
                            Calibrate your financial metrics for accurate recovery projections.
                            Enter your average costs to track real savings.
                        </p>

                        {/* Cost Configuration */}
                        <div className="space-y-4">
                            <div className="text-[10px] uppercase font-mono text-(--neon-cyan) tracking-widest">
                                FINANCIAL PARAMETERS
                            </div>

                            {substances.map(sub => {
                                const config = SUBSTANCE_CONFIG[sub];
                                const isActive = !!quitDates?.[sub];

                                return (
                                    <div
                                        key={sub}
                                        className={`p-3 rounded border ${isActive ? 'border-(--neon-green) bg-(--bg-grid)' : 'border-(--border-dim)'}`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{config.icon}</span>
                                                <span className="text-sm font-bold text-white uppercase tracking-wide">
                                                    {config.label}
                                                </span>
                                            </div>
                                            <div className={`text-[10px] px-2 py-0.5 rounded ${isActive ? 'bg-(--neon-green) text-black' : 'bg-(--border-dim) text-(--text-secondary)'}`}>
                                                {isActive ? 'ACTIVE' : 'INACTIVE'}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-mono text-(--text-secondary)">
                                                {config.costLabel}
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-mono">₹</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="10"
                                                    value={costs[sub]}
                                                    onChange={(e) => setCosts({ ...costs, [sub]: Number(e.target.value) })}
                                                    className="flex-1 bg-black border border-(--border-dim) p-2 text-white font-mono focus:border-(--neon-cyan) outline-none transition-colors"
                                                />
                                            </div>
                                            <div className="text-[9px] text-(--text-secondary) font-mono">
                                                {config.costHint}
                                            </div>
                                        </div>

                                        {isActive && (
                                            <div className="mt-2 pt-2 border-t border-(--border-dim)">
                                                <div className="flex justify-between text-[10px] font-mono">
                                                    <span className="text-(--text-secondary)">Protocol Started:</span>
                                                    <span className="text-(--neon-cyan)">{formatDate(quitDates[sub])}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Help Text */}
                        <div className="text-[10px] text-(--text-secondary) font-mono bg-(--bg-grid) p-3 rounded border border-(--border-dim)">
                            <div className="text-(--neon-yellow) mb-1">💡 TIP</div>
                            To change your quit date, you'll need to reset the protocol and reinitialize from the dashboard.
                            Your log entries will be preserved.
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-(--border-dim)">
                            <HudButton variant="ghost" onClick={onClose} disabled={isSaving}>
                                CANCEL
                            </HudButton>
                            <HudButton onClick={handleSave} disabled={isSaving}>
                                {isSaving ? 'SAVING...' : 'SAVE CONFIG'}
                            </HudButton>
                        </div>
                    </div>
                </HudCard>
            </motion.div>
        </motion.div>
    );
}
