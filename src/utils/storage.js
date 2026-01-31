// Recovery Tracker - LocalStorage Utility
// Handles persistence of user data

const STORAGE_KEYS = {
    ENTRIES: 'recovery_tracker_entries',
    QUIT_DATES: 'recovery_tracker_quit_dates',
    SETTINGS: 'recovery_tracker_settings'
};

/**
 * Save an entry to storage
 */
export function saveEntry(entry) {
    const entries = getEntries();
    const newEntry = {
        ...entry,
        id: entry.id || generateId(),
        createdAt: entry.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    entries.push(newEntry);
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));

    // If it's a quit entry, also update quit dates
    if (entry.type === 'quit') {
        updateQuitDate(entry.substance, entry.date);
    }

    return newEntry;
}

/**
 * Get all entries
 */
export function getEntries() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error reading entries:', e);
        return [];
    }
}

/**
 * Get entries by substance
 */
export function getEntriesBySubstance(substance) {
    return getEntries().filter(e => e.substance === substance);
}

/**
 * Get entries by type
 */
export function getEntriesByType(type) {
    return getEntries().filter(e => e.type === type);
}

/**
 * Update an existing entry
 */
export function updateEntry(id, updates) {
    const entries = getEntries();
    const index = entries.findIndex(e => e.id === id);

    if (index === -1) return null;

    entries[index] = {
        ...entries[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
    return entries[index];
}

/**
 * Delete an entry
 */
export function deleteEntry(id) {
    const entries = getEntries();
    const filtered = entries.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(filtered));
    return true;
}

/**
 * Get quit dates for all substances
 */
export function getQuitDates() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.QUIT_DATES);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error('Error reading quit dates:', e);
        return {};
    }
}

/**
 * Update quit date for a substance
 */
export function updateQuitDate(substance, date) {
    const quitDates = getQuitDates();
    quitDates[substance] = date;
    localStorage.setItem(STORAGE_KEYS.QUIT_DATES, JSON.stringify(quitDates));
    return quitDates;
}

/**
 * Clear quit date for a substance
 */
export function clearQuitDate(substance) {
    const quitDates = getQuitDates();
    delete quitDates[substance];
    localStorage.setItem(STORAGE_KEYS.QUIT_DATES, JSON.stringify(quitDates));
    return quitDates;
}

/**
 * Get relapse entries for a substance
 */
export function getRelapseEntries(substance = null) {
    const entries = getEntries().filter(e => e.type === 'relapse');
    if (substance) {
        return entries.filter(e => e.substance === substance);
    }
    return entries;
}

/**
 * Get settings
 */
export function getSettings() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return data ? JSON.parse(data) : getDefaultSettings();
    } catch (e) {
        console.error('Error reading settings:', e);
        return getDefaultSettings();
    }
}

/**
 * Update settings
 */
export function updateSettings(updates) {
    const settings = getSettings();
    const newSettings = { ...settings, ...updates };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
    return newSettings;
}

/**
 * Get default settings
 */
function getDefaultSettings() {
    return {
        notifications: true,
        theme: 'dark',
        showMoodTracking: true,
        showBrainVisualization: true
    };
}

/**
 * Generate a unique ID
 */
function generateId() {
    return `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Export all data
 */
export function exportData() {
    return {
        entries: getEntries(),
        quitDates: getQuitDates(),
        settings: getSettings(),
        exportedAt: new Date().toISOString()
    };
}

/**
 * Import data
 */
export function importData(data) {
    if (data.entries) {
        localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(data.entries));
    }
    if (data.quitDates) {
        localStorage.setItem(STORAGE_KEYS.QUIT_DATES, JSON.stringify(data.quitDates));
    }
    if (data.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    }
    return true;
}

/**
 * Clear all data
 */
export function clearAllData() {
    localStorage.removeItem(STORAGE_KEYS.ENTRIES);
    localStorage.removeItem(STORAGE_KEYS.QUIT_DATES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    return true;
}
