import { useState, useMemo } from 'react';
import { useRecovery } from '../context/RecoveryContext';
import { formatDuration } from '../utils/calculations';
import { HudCard, HudButton } from './HudComponents';

export default function HistoryView() {
    const { entries, removeEntry } = useRecovery();
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEntries = useMemo(() => {
        return entries
            .filter(entry => {
                if (filter !== 'all' && entry.substance !== filter) return false;
                if (searchTerm && entry.notes && !entry.notes.toLowerCase().includes(searchTerm.toLowerCase())) return false;
                return true;
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [entries, filter, searchTerm]);

    const handleDelete = (id) => {
        if (confirm('CONFIRM DELETION: Purge this record?')) {
            removeEntry(id);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-mono text-white tracking-widest border-l-4 border-[var(--neon-cyan)] pl-4">
                    MISSION LOGS
                </h1>

                {/* Protocol Filters */}
                <div className="flex gap-2">
                    {['all', 'cigarettes', 'cannabis', 'alcohol'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 text-xs font-mono border ${filter === f
                                    ? 'border-[var(--neon-cyan)] text-[var(--neon-cyan)] bg-[rgba(0,240,255,0.1)]'
                                    : 'border-[var(--border-dim)] text-[var(--text-secondary)]'
                                } hover:border-white transition-colors`}
                        >
                            {f.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="SEARCH DATABASE..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black border border-[var(--border-dim)] p-3 text-[var(--neon-cyan)] font-mono text-sm focus:border-[var(--neon-cyan)] outline-none"
                />
            </div>

            <div className="space-y-4">
                {filteredEntries.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-[var(--border-dim)] text-[var(--text-secondary)] font-mono">
                        NO RECORDS FOUND IN ARCHIVE
                    </div>
                ) : (
                    filteredEntries.map(entry => (
                        <HudCard key={entry.id} className="relative group">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="text-2xl pt-1">
                                        {entry.type === 'quit' ? '🚀' : entry.type === 'relapse' ? '⚠️' : '📝'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`text-sm font-bold font-mono ${entry.type === 'quit' ? 'text-[var(--neon-green)]' :
                                                    entry.type === 'relapse' ? 'text-[var(--neon-magenta)]' : 'text-[var(--neon-cyan)]'
                                                }`}>
                                                {entry.type === 'quit' ? 'PROTOCOL INITIATED' :
                                                    entry.type === 'relapse' ? 'INCIDENT REPORT' : 'STATUS LOG'}
                                            </span>
                                            <span className="text-[10px] bg-[var(--border-dim)] px-2 py-0.5 rounded text-[var(--text-secondary)] uppercase">
                                                {entry.substance}
                                            </span>
                                        </div>

                                        <div className="text-xs text-[var(--text-secondary)] font-mono mb-2">
                                            TIMESTAMP: {new Date(entry.date).toLocaleString()}
                                        </div>

                                        {entry.notes && (
                                            <p className="text-sm text-gray-300 border-l-2 border-[var(--border-dim)] pl-3 py-1 font-mono">
                                                "{entry.notes}"
                                            </p>
                                        )}

                                        <div className="flex gap-4 mt-3 text-xs font-mono">
                                            {typeof entry.feeling === 'number' && (
                                                <span className="text-[var(--neon-cyan)]">MOOD: {entry.feeling}%</span>
                                            )}
                                            {typeof entry.craving === 'number' && (
                                                <span className="text-[var(--neon-magenta)]">CRAVING: {entry.craving}%</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(entry.id)}
                                    className="text-[var(--text-dim)] hover:text-[var(--neon-magenta)] transition-colors p-2"
                                    title="Purge Record"
                                >
                                    ✕
                                </button>
                            </div>
                        </HudCard>
                    ))
                )}
            </div>
        </div>
    );
}
