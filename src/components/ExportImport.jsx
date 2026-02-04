import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRecovery } from '../context/RecoveryContext';

export default function ExportImport() {
    const { entries, quitDates, userSettings } = useRecovery();
    const [status, setStatus] = useState('');
    const statusTimeoutRef = useRef(null);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (statusTimeoutRef.current) {
                clearTimeout(statusTimeoutRef.current);
            }
        };
    }, []);

    const setStatusWithTimeout = (message) => {
        setStatus(message);
        if (statusTimeoutRef.current) {
            clearTimeout(statusTimeoutRef.current);
        }
        statusTimeoutRef.current = setTimeout(() => setStatus(''), 3000);
    };

    const handleExport = () => {
        const data = {
            entries,
            quitDates,
            settings: userSettings,
            exportedAt: new Date().toISOString(),
            version: '4.0'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `recovery_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url); // Clean up URL object
        setStatusWithTimeout('Protocol: Export Successful');
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.entries && data.quitDates) {
                    // Note: Import to Firebase requires re-authentication flow
                    // For now, show info about cloud sync
                    setStatusWithTimeout('Info: Data is synced via Firebase. Manual import disabled.');
                } else {
                    setStatusWithTimeout('Error: Integrity Check Failed');
                }
            } catch {
                setStatusWithTimeout('Error: Archive Corruption Detected');
            }
        };
        reader.readAsText(file);
        // Reset file input
        e.target.value = '';
    };

    return (
        <div className="export-import-premium bento-item bento-item--md" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h4 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>
                <span>💾</span> Data Preservation & Sync
            </h4>

            <div style={{ display: 'flex', gap: '16px' }}>
                <button
                    className="btn-premium btn-premium--primary"
                    style={{ flex: 1 }}
                    onClick={handleExport}
                >
                    Backup Archive
                </button>

                <label className="btn-premium" style={{ flex: 1, display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
                    Restore Archive
                    <input type="file" hidden onChange={handleImport} accept=".json" />
                </label>
            </div>

            {status && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        marginTop: '24px',
                        padding: '12px',
                        background: status.startsWith('Error') ? 'var(--color-danger)' : 'var(--color-success)',
                        color: 'black',
                        fontWeight: 800,
                        textAlign: 'center',
                        borderRadius: '8px',
                        fontSize: '0.8rem'
                    }}
                >
                    {status}
                </motion.div>
            )}

            <p style={{ marginTop: '24px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Cloud synchronization is currently offline. Local backups are highly recommended after significant milestones.
            </p>
        </div>
    );
}
