// Recovery Tracker - Global State Context (Firebase Enabled)
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { calculateRecoveryProgress, getOverallHealth, getStreakInfo, getAdvancedAnalytics } from '../utils/calculations';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
    collection, doc, setDoc, addDoc, deleteDoc, updateDoc,
    onSnapshot, query, orderBy, serverTimestamp
} from 'firebase/firestore';

const RecoveryContext = createContext(null);

export function RecoveryProvider({ children }) {
    const [user, setUser] = useState(null);
    const [entries, setEntries] = useState([]);
    const [quitDates, setQuitDates] = useState({});
    const [progress, setProgress] = useState({ cigarettes: null, cannabis: null, alcohol: null });
    const [overallHealth, setOverallHealth] = useState(0);
    const [currentView, setCurrentView] = useState('dashboard');
    const [isLoading, setIsLoading] = useState(true);
    const [userSettings, setUserSettings] = useState({
        costs: {
            cigarettes: 350,
            cannabis: 500,
            alcohol: 400
        }
    });

    // Monitor Auth State
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                // Clear state on logout
                setEntries([]);
                setQuitDates({});
                setUserSettings({ costs: { cigarettes: 350, cannabis: 500, alcohol: 400 } });
                setIsLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // Real-time Data Sync (Firestore)
    useEffect(() => {
        if (!user) return;

        setIsLoading(true);

        // 1. Subscribe to User Settings/QuitDates
        const unsubUser = onSnapshot(doc(db, 'users', user.uid), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setQuitDates(data.quitDates || {});
                if (data.settings) {
                    setUserSettings(prev => ({ ...prev, ...data.settings }));
                }
            }
        });

        // 2. Subscribe to Entries Subcollection
        const q = query(
            collection(db, `users/${user.uid}/entries`),
            orderBy('timestamp', 'desc') // Ensure logs are time-ordered
        );

        const unsubEntries = onSnapshot(q, (snapshot) => {
            const syncedEntries = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEntries(syncedEntries);
            setIsLoading(false);
        });

        return () => {
            unsubUser();
            unsubEntries();
        };
    }, [user]);

    // Update Settings Handler
    const updateUserSettings = useCallback(async (newSettings) => {
        if (!user) return;
        try {
            await setDoc(doc(db, 'users', user.uid), {
                settings: newSettings
            }, { merge: true });
            // Optimistic update
            setUserSettings(prev => ({ ...prev, ...newSettings }));
        } catch (e) {
            console.error("Error saving settings:", e);
        }
    }, [user]);

    // Recalculate Logic (Same as before, just triggered by new data)
    useEffect(() => {
        if (!isLoading) updateProgress();
    }, [entries, quitDates, userSettings, isLoading]);

    // Live Tick for Progress Interpoloation
    useEffect(() => {
        const interval = setInterval(() => updateProgress(), 60000);
        return () => clearInterval(interval);
    }, [quitDates, entries, userSettings]);

    const updateProgress = useCallback(() => {
        const substances = ['cigarettes', 'cannabis', 'alcohol'];
        const newProgress = {};

        for (const substance of substances) {
            if (quitDates[substance]) {
                const substanceEntries = entries.filter(e => e.substance === substance && e.type === 'relapse');

                newProgress[substance] = calculateRecoveryProgress(
                    quitDates[substance],
                    substance,
                    substanceEntries
                );

                // Add streak info
                const streakInfo = getStreakInfo(quitDates[substance], substanceEntries, substance);
                newProgress[substance].streak = streakInfo;
            } else {
                newProgress[substance] = null;
            }
        }

        setProgress(newProgress);
        setOverallHealth(getOverallHealth(quitDates, entries));
    }, [quitDates, entries]);

    const advancedStats = useMemo(() => {
        return getAdvancedAnalytics(quitDates, entries, userSettings.costs);
    }, [quitDates, entries, userSettings]);

    // --- Actions (Write to Firestore) ---

    const addEntry = useCallback(async (entryData) => {
        if (!user) return; // Guard: Must be logged in

        try {
            // Add Log Entry
            await addDoc(collection(db, `users/${user.uid}/entries`), {
                ...entryData,
                timestamp: entryData.timestamp || Date.now(), // Ensure number format for sort
                createdAt: serverTimestamp()
            });

            // If Quit entry, update User Profile
            if (entryData.type === 'quit') {
                await setDoc(doc(db, 'users', user.uid), {
                    quitDates: {
                        ...quitDates,
                        [entryData.substance]: entryData.date
                    }
                }, { merge: true });
            }
        } catch (e) {
            console.error("Sync Error:", e);
        }
    }, [user, quitDates]);

    const removeEntry = useCallback(async (id) => {
        if (!user) return;
        await deleteDoc(doc(db, `users/${user.uid}/entries`, id));
    }, [user]);

    // Helper Wrappers
    const startQuit = useCallback((substance, date = new Date().toISOString()) => {
        addEntry({ type: 'quit', substance, date, notes: `Protocol Initiated: ${substance}` });
    }, [addEntry]);

    const value = {
        user, // Expose auth state
        entries,
        quitDates,
        progress,
        overallHealth,
        currentView,
        isLoading,
        advancedStats,
        userSettings, // Expose settings

        setCurrentView,
        addEntry,
        removeEntry,
        startQuit,
        updateUserSettings
    };

    return (
        <RecoveryContext.Provider value={value}>
            {children}
        </RecoveryContext.Provider>
    );
}

export function useRecovery() {
    return useContext(RecoveryContext);
}
