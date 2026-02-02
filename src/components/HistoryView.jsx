// HistoryView.jsx - Mission Logs Archive v4.0
import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecovery } from '../context/RecoveryContext';
import { formatDuration } from '../utils/calculations';
import { HudCard, HudButton } from './HudComponents';

const TYPE_CONFIG = {
    quit: { icon: '🚀', label: 'PROTOCOL INITIATED', color: '#00FF88', bgColor: 'rgba(0,255,136,0.1)' },
    relapse: { icon: '⚠️', label: 'INCIDENT REPORT', color: '#FF0064', bgColor: 'rgba(255,0,100,0.1)' },
    log: { icon: '📊', label: 'STATUS LOG', color: '#00F0FF', bgColor: 'rgba(0,240,255,0.1)' },
    progress: { icon: '✓', label: 'PROGRESS', color: '#00F0FF', bgColor: 'rgba(0,240,255,0.1)' }
};

const SUBSTANCE_CONFIG = {
    cigarettes: { icon: '🚬', label: 'NICOTINE', color: '#00F0FF' },
    cannabis: { icon: '🌿', label: 'CANNABIS', color: '#00FF88' },
    alcohol: { icon: '🍺', label: 'ALCOHOL', color: '#FF0064' }
};

// Animated stat badge
const StatBadge = ({ label, value, color, icon }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
    >
        <span className="text-lg">{icon}</span>
        <div>
            <div className="text-[9px] text-[var(--text-dim)] font-mono">{label}</div>
            <div className="text-sm font-mono font-bold" style={{ color }}>{value}</div>
        </div>
    </motion.div>
);

// Filter button component
const FilterButton = ({ active, onClick, children, color = 'var(--neon-cyan)' }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all ${
            active
                ? 'text-black font-bold'
                : 'border-[var(--border-dim)] text-[var(--text-secondary)] hover:border-white hover:text-white'
        }`}
        style={active ? { 
            background: color, 
            borderColor: color,
            boxShadow: `0 0 20px ${color}40`
        } : {}}
    >
        {children}
    </motion.button>
);

// Entry card component
const EntryCard = ({ entry, onDelete, confirmDelete, setConfirmDelete, index }) => {
    const typeConfig = TYPE_CONFIG[entry.type] || TYPE_CONFIG.log;
    const substanceConfig = SUBSTANCE_CONFIG[entry.substance] || {};

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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100, scale: 0.9 }}
            transition={{ delay: index * 0.02, type: 'spring', stiffness: 300, damping: 30 }}
            layout
            className="group"
        >
            <div 
                className="relative overflow-hidden rounded-xl border transition-all duration-300 bg-[rgba(255,255,255,0.02)]
                           hover:bg-[rgba(255,255,255,0.04)] border-[var(--border-dim)] hover:border-opacity-50"
                style={{ '--hover-color': typeConfig.color }}
            >
                {/* Colored accent line */}
                <div 
                    className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ background: typeConfig.color }}
                />

                <div className="p-4">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-4 flex-1">
                            {/* Icon */}
                            <motion.div 
                                className="text-2xl flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl"
                                style={{ 
                                    background: typeConfig.bgColor,
                                    boxShadow: `0 0 20px ${typeConfig.color}20`
                                }}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                                {typeConfig.icon}
                            </motion.div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <span 
                                        className="text-sm font-bold font-mono"
                                        style={{ color: typeConfig.color }}
                                    >
                                        {typeConfig.label}
                                    </span>
                                    <span 
                                        className="text-[10px] px-2 py-0.5 rounded-full uppercase font-mono flex items-center gap-1"
                                        style={{ 
                                            background: `${substanceConfig.color}15`,
                                            color: substanceConfig.color,
                                            border: `1px solid ${substanceConfig.color}30`
                                        }}
                                    >
                                        {substanceConfig.icon} {entry.substance}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 text-[10px] text-[var(--text-dim)] font-mono mb-2">
                                    <span className="flex items-center gap-1">
                                        <span>📅</span> {formatEntryDate(entry)}
                                    </span>
                                    <span className="text-[var(--neon-cyan)] flex items-center gap-1">
                                        <span>⏱</span> {getTimeAgo(entry)}
                                    </span>
                                </div>

                                {entry.notes && (
                                    <motion.p 
                                        className="text-sm text-gray-300 border-l-2 pl-3 py-2 font-mono bg-[rgba(0,0,0,0.2)] rounded-r-lg"
                                        style={{ borderColor: typeConfig.color }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        "{entry.notes}"
                                    </motion.p>
                                )}

                                {/* Metrics */}
                                <div className="flex gap-2 mt-3 text-xs font-mono flex-wrap">
                                    {typeof entry.feeling === 'number' && (
                                        <span className="px-2 py-1 rounded-md bg-[rgba(0,240,255,0.1)] text-[#00F0FF] border border-[rgba(0,240,255,0.2)]">
                                            😊 MOOD: {entry.feeling}%
                                        </span>
                                    )}
                                    {typeof entry.craving === 'number' && entry.craving > 0 && (
                                        <span className="px-2 py-1 rounded-md bg-[rgba(255,0,100,0.1)] text-[#FF0064] border border-[rgba(255,0,100,0.2)]">
                                            🔥 CRAVING: {entry.craving}%
                                        </span>
                                    )}
                                    {entry.amount && (
                                        <span className="px-2 py-1 rounded-md bg-[rgba(255,230,0,0.1)] text-[#FFE600] border border-[rgba(255,230,0,0.2)]">
                                            📊 AMOUNT: {entry.amount}
                                        </span>
                                    )}
                                    {entry.cost && (
                                        <span className="px-2 py-1 rounded-md bg-[rgba(0,255,136,0.1)] text-[#00FF88] border border-[rgba(0,255,136,0.2)]">
                                            💰 COST: ₹{entry.cost}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Delete Button */}
                        <motion.button
                            onClick={() => onDelete(entry.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`flex-shrink-0 transition-all p-2 rounded-lg ${
                                confirmDelete === entry.id 
                                    ? 'text-white bg-[#FF0064]' 
                                    : 'text-[var(--text-dim)] hover:text-[#FF0064] hover:bg-[rgba(255,0,100,0.1)]'
                            }`}
                            title={confirmDelete === entry.id ? 'Click again to confirm' : 'Purge Record'}
                        >
                            {confirmDelete === entry.id ? (
                                <span className="text-[10px] font-mono font-bold">⚠ CONFIRM</span>
                            ) : (
                                <span>🗑️</span>
                            )}
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default function HistoryView() {
    const { entries, removeEntry } = useRecovery();
    const [filter, setFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(null);
    const searchRef = useRef(null);

    const filteredEntries = useMemo(() => {
        return entries
            .filter(entry => {
                if (filter !== 'all' && entry.substance !== filter) return false;
                if (typeFilter !== 'all' && entry.type !== typeFilter) return false;
                if (searchTerm && entry.notes && !entry.notes.toLowerCase().includes(searchTerm.toLowerCase())) return false;
                return true;
            })
            .sort((a, b) => {
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
            setTimeout(() => setConfirmDelete(null), 3000);
        }
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
        <div className="max-w-5xl mx-auto p-4 space-y-6">
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1 h-8 bg-gradient-to-b from-[var(--neon-cyan)] to-[var(--neon-purple)] rounded-full" />
                        <h1 className="text-2xl font-mono text-white tracking-wider font-bold">
                            MISSION LOGS
                        </h1>
                    </div>
                    <p className="text-xs text-[var(--text-dim)] font-mono ml-4">
                        Complete archive of your recovery journey
                    </p>
                </div>
                
                {/* Quick Stats */}
                <div className="flex gap-2 flex-wrap">
                    <StatBadge label="TOTAL" value={stats.total} color="#00F0FF" icon="📋" />
                    <StatBadge label="PROTOCOLS" value={stats.quits} color="#00FF88" icon="🚀" />
                    <StatBadge label="INCIDENTS" value={stats.relapses} color="#FF0064" icon="⚠️" />
                </div>
            </motion.div>

            {/* Filters Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
            >
                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)]">
                        🔍
                    </div>
                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="Search database..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[rgba(255,255,255,0.02)] border border-[var(--border-dim)] rounded-xl
                                   p-3 pl-12 text-white font-mono text-sm 
                                   focus:border-[var(--neon-cyan)] focus:bg-[rgba(0,240,255,0.02)]
                                   outline-none transition-all placeholder:text-[var(--text-dim)]"
                    />
                    {searchTerm && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setSearchTerm('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)] 
                                       hover:text-white transition-colors p-1"
                        >
                            ✕
                        </motion.button>
                    )}
                </div>

                {/* Filter Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Substance Filter */}
                    <div className="flex gap-2 flex-wrap">
                        <span className="text-[9px] font-mono text-[var(--text-dim)] w-full mb-1">SUBSTANCE FILTER</span>
                        <FilterButton 
                            active={filter === 'all'} 
                            onClick={() => setFilter('all')}
                        >
                            ALL
                        </FilterButton>
                        {Object.entries(SUBSTANCE_CONFIG).map(([key, config]) => (
                            <FilterButton
                                key={key}
                                active={filter === key}
                                onClick={() => setFilter(key)}
                                color={config.color}
                            >
                                {config.icon} {key.toUpperCase()}
                            </FilterButton>
                        ))}
                    </div>

                    {/* Type Filter */}
                    <div className="flex gap-2 flex-wrap">
                        <span className="text-[9px] font-mono text-[var(--text-dim)] w-full mb-1">TYPE FILTER</span>
                        <FilterButton 
                            active={typeFilter === 'all'} 
                            onClick={() => setTypeFilter('all')}
                            color="#9333EA"
                        >
                            📋 ALL TYPES
                        </FilterButton>
                        {['quit', 'relapse', 'log'].map(t => (
                            <FilterButton
                                key={t}
                                active={typeFilter === t}
                                onClick={() => setTypeFilter(t)}
                                color={TYPE_CONFIG[t]?.color}
                            >
                                {TYPE_CONFIG[t]?.icon} {t.toUpperCase()}
                            </FilterButton>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Results Summary */}
            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-dim)] py-2 border-y border-[var(--border-dim)]">
                <span>Showing {filteredEntries.length} of {entries.length} records</span>
                <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--neon-green)] animate-pulse" />
                    DATABASE SYNCED
                </span>
            </div>

            {/* Entry List */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {filteredEntries.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-16 border border-dashed border-[var(--border-dim)] rounded-xl 
                                       text-[var(--text-secondary)] font-mono bg-[rgba(255,255,255,0.01)]"
                        >
                            <motion.div 
                                className="text-5xl mb-4"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                📭
                            </motion.div>
                            <div className="text-lg mb-2">NO RECORDS FOUND</div>
                            <div className="text-xs text-[var(--text-dim)]">
                                {searchTerm || filter !== 'all' || typeFilter !== 'all' 
                                    ? 'Try adjusting your filters' 
                                    : 'Start logging your journey to see records here'}
                            </div>
                        </motion.div>
                    ) : (
                        filteredEntries.map((entry, index) => (
                            <EntryCard
                                key={entry.id}
                                entry={entry}
                                onDelete={handleDelete}
                                confirmDelete={confirmDelete}
                                setConfirmDelete={setConfirmDelete}
                                index={index}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            {filteredEntries.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-4 text-[10px] font-mono text-[var(--text-dim)]"
                >
                    End of archive • {filteredEntries.length} records displayed
                </motion.div>
            )}
        </div>
    );
}
