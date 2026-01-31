import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRecovery } from '../context/RecoveryContext';

export default function ExportImport() {
    const { entries, quitDates, loadData } = useRecovery();
    const [status, setStatus] = useState('');

    const handleExport = () => {
        const data = {
            entries,
            quitDates,
            exportedAt: new Date().toISOString(),
            version: '2.0-premium'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `recovery_data_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        setStatus('Protocol: Export Successful');
        setTimeout(() => setStatus(''), 3000);
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.entries && data.quitDates) {
                    localStorage.setItem('recovery_entries', JSON.stringify(data.entries));
                    localStorage.setItem('recovery_quit_dates', JSON.stringify(data.quitDates));
                    loadData(); // Reload context
                    setStatus('Protocol: Data Restoration Complete');
                } else {
                    setStatus('Error: Integrity Check Failed');
                }
            } catch (err) {
                setStatus('Error: Archive Corruption Detected');
            }
            setTimeout(() => setStatus(''), 3000);
        };
        reader.readAsText(file);
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
