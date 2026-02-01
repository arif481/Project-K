import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecovery } from '../context/RecoveryContext';
import { formatDuration } from '../utils/calculations';
import { HudCard, HudButton } from './HudComponents';

const TYPE_CONFIG = {
    quit: { icon: '🚀', label: 'PROTOCOL INITIATED', color: 'var(--neon-green)' },
    relapse: { icon: '⚠️', label: 'INCIDENT REPORT', color: 'var(--neon-magenta)' },
    log: { icon: '📊', label: 'STATUS LOG', color: 'var(--neon-cyan)' },
    progress: { icon: '✓', label: 'PROGRESS', color: 'var(--neon-cyan)' }
};

const SUBSTANCE_CONFIG = {
    cigarettes: { icon: '🚬', label: 'NICOTINE' },
    cannabis: { icon: '🌿', label: 'CANNABIS' },
    alcohol: { icon: '🍺', label: 'ALCOHOL' }
};

export default function HistoryView() {
    const { entries, removeEntry } = useRecovery();
    const [filter, setFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(null);

    const filteredEntries = useMemo(() => {
        return entries
            .filter(entry => {
                if (filter !== 'all' && entry.substance !== filter) return false;
                if (typeFilter !== 'all' && entry.type !== typeFilter) return false;
                if (searchTerm && entry.notes && !entry.notes.toLowerCase().includes(searchTerm.toLowerCase())) return false;
                return true;
            })
            .sort((a, b) => {
                // Use timestamp first, fall back to date
                const timeA = a.timestamp || new Date(a.date).getTime();
                const timeB = b.timestamp || new Date(b.date).getTime();
                return timeB - timeA;
            });
    }, [entries, filter, typeFilter, searchTerm]);

    const handleDelete = (id) => {
        if (confirmDelete === id) {
            removeEntry(id);
            setConfirmDelete(null);
        } else {
            setConfirmDelete(id);
            // Auto-reset confirmation after 3 seconds
            setTimeout(() => setConfirmDelete(null), 3000);
        }
    };

    const formatEntryDate = (entry) => {
        const timestamp = entry.timestamp || new Date(entry.date).getTime();
        return new Date(timestamp).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeAgo = (entry) => {
        const timestamp = entry.timestamp || new Date(entry.date).getTime();
        const elapsed = Date.now() - timestamp;
        return formatDuration(elapsed) + ' ago';
    };

    // Stats summary
    const stats = useMemo(() => {
        const total = filteredEntries.length;
        const quits = filteredEntries.filter(e => e.type === 'quit').length;
        const relapses = filteredEntries.filter(e => e.type === 'relapse').length;
        const logs = filteredEntries.filter(e => e.type === 'log' || e.type === 'progress').length;
        return { total, quits, relapses, logs };
    }, [filteredEntries]);

    return (
        <div className="max-w-5xl mx-auto p-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-mono text-white tracking-widest border-l-4 border-[var(--neon-cyan)] pl-4">
                        MISSION LOGS
                    </h1>
                    <p className="text-xs text-[var(--text-secondary)] font-mono mt-1 pl-5">
                        {stats.total} RECORDS | {stats.quits} PROTOCOLS | {stats.relapses} INCIDENTS | {stats.logs} LOGS
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Substance Filter */}
                <div className="flex gap-2 flex-wrap">
                    {['all', 'cigarettes', 'cannabis', 'alcohol'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-xs font-mono border transition-all ${filter === f
                                    ? 'border-[var(--neon-cyan)] text-[var(--neon-cyan)] bg-[rgba(0,240,255,0.1)]'
                                    : 'border-[var(--border-dim)] text-[var(--text-secondary)] hover:border-white'
                                }`}
                        >
                            {f === 'all' ? 'ALL' : SUBSTANCE_CONFIG[f]?.icon} {f.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Type Filter */}
                <div className="flex gap-2 flex-wrap">
                    {['all', 'quit', 'relapse', 'log'].map(t => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={`px-3 py-1.5 text-xs font-mono border transition-all ${typeFilter === t
                                    ? 'border-[var(--neon-magenta)] text-[var(--neon-magenta)] bg-[rgba(255,0,60,0.1)]'
                                    : 'border-[var(--border-dim)] text-[var(--text-secondary)] hover:border-white'
                                }`}
                        >
                            {t === 'all' ? '📋 ALL TYPES' : `${TYPE_CONFIG[t]?.icon} ${t.toUpperCase()}`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <input
                    type="text"
                    placeholder="🔍 SEARCH DATABASE..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black border border-[var(--border-dim)] p-3 pl-4 text-[var(--neon-cyan)] font-mono text-sm focus:border-[var(--neon-cyan)] outline-none transition-colors"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-white"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Entry List */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {filteredEntries.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 border border-dashed border-[var(--border-dim)] text-[var(--text-secondary)] font-mono"
                        >
                            <div className="text-4xl mb-4">📭</div>
                            <div>NO RECORDS FOUND IN ARCHIVE</div>
                            <div className="text-xs mt-2">Try adjusting your filters or start logging your journey</div>
                        </motion.div>
                    ) : (
                        filteredEntries.map((entry, index) => {
                            const typeConfig = TYPE_CONFIG[entry.type] || TYPE_CONFIG.log;
                            const substanceConfig = SUBSTANCE_CONFIG[entry.substance] || {};
                            
                            return (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ delay: index * 0.03 }}
                                    layout
                                >
                                    <HudCard className="relative group hover:border-[var(--neon-cyan)] transition-colors">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex gap-4 flex-1">
                                                {/* Icon */}
                                                <div 
                                                    className="text-3xl flex-shrink-0 w-12 h-12 flex items-center justify-center rounded border"
                                                    style={{ 
                                                        borderColor: typeConfig.color,
                                                        backgroundColor: `${typeConfig.color}10`
                                                    }}
                                                >
                                                    {typeConfig.icon}
                                                </div>
                                                
                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                        <span 
                                                            className="text-sm font-bold font-mono"
                                                            style={{ color: typeConfig.color }}
                                                        >
                                                            {typeConfig.label}
                                                        </span>
                                                        <span className="text-[10px] bg-[var(--bg-grid)] px-2 py-0.5 text-[var(--text-secondary)] uppercase border border-[var(--border-dim)]">
                                                            {substanceConfig.icon} {entry.substance}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-[10px] text-[var(--text-secondary)] font-mono mb-2">
                                                        <span>📅 {formatEntryDate(entry)}</span>
                                                        <span className="text-[var(--neon-cyan)]">⏱ {getTimeAgo(entry)}</span>
                                                    </div>

                                                    {entry.notes && (
                                                        <p className="text-sm text-gray-300 border-l-2 border-[var(--border-dim)] pl-3 py-1 font-mono bg-[var(--bg-grid)] rounded-r">
                                                            "{entry.notes}"
                                                        </p>
                                                    )}

                                                    {/* Metrics */}
                                                    <div className="flex gap-4 mt-3 text-xs font-mono flex-wrap">
                                                        {typeof entry.feeling === 'number' && (
                                                            <span className="text-[var(--neon-cyan)] bg-[rgba(0,240,255,0.1)] px-2 py-0.5 rounded">
                                                                MOOD: {entry.feeling}%
                                                            </span>
                                                        )}
                                                        {typeof entry.craving === 'number' && entry.craving > 0 && (
                                                            <span className="text-[var(--neon-magenta)] bg-[rgba(255,0,60,0.1)] px-2 py-0.5 rounded">
                                                                CRAVING: {entry.craving}%
                                                            </span>
                                                        )}
                                                        {entry.amount && (
                                                            <span className="text-[var(--neon-yellow)] bg-[rgba(252,238,10,0.1)] px-2 py-0.5 rounded">
                                                                AMOUNT: {entry.amount}
                                                            </span>
                                                        )}
                                                        {entry.cost && (
                                                            <span className="text-[var(--neon-green)] bg-[rgba(0,255,159,0.1)] px-2 py-0.5 rounded">
                                                                COST: ₹{entry.cost}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDelete(entry.id)}
                                                className={`flex-shrink-0 transition-all p-2 ${
                                                    confirmDelete === entry.id 
                                                        ? 'text-white bg-[var(--neon-magenta)]' 
                                                        : 'text-[var(--text-dim)] hover:text-[var(--neon-magenta)]'
                                                }`}
                                                title={confirmDelete === entry.id ? 'Click again to confirm' : 'Purge Record'}
                                            >
                                                {confirmDelete === entry.id ? '⚠ CONFIRM' : '✕'}
                                            </button>
                                        </div>
                                    </HudCard>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
