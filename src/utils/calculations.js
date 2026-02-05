// Recovery Tracker - Calculation Utilities
// Core logic for progress tracking and recovery calculations

import { getMilestones, MOOD_INDICATORS, NEUROTRANSMITTER_RECOVERY, ANALYTICS_CONFIG } from '../data/recoveryData';

/**
 * Calculate recovery progress percentage for a substance
 * @param {Date} quitDate - When the user quit
 * @param {string} substance - 'cigarettes', 'cannabis', or 'alcohol'
 * @param {Array} relapseEntries - Array of relapse entries
 * @returns {Object} Progress data
 */
export function calculateRecoveryProgress(quitDate, substance, relapseEntries = []) {
    if (!quitDate) return { progress: 0, currentMilestone: null, nextMilestone: null };

    const now = new Date();
    const milestones = getMilestones(substance);

    // Get effective quit date (accounting for relapses)
    const effectiveQuitDate = getEffectiveQuitDate(quitDate, relapseEntries, substance);
    const elapsedTime = now - effectiveQuitDate;

    if (elapsedTime < 0) {
        return { progress: 0, currentMilestone: null, nextMilestone: milestones[0] };
    }

    // Find current and next milestones
    let currentMilestone = null;
    let nextMilestone = null;
    let progress = 0;

    for (let i = 0; i < milestones.length; i++) {
        if (elapsedTime >= milestones[i].time) {
            currentMilestone = milestones[i];
            nextMilestone = milestones[i + 1] || null;
            progress = milestones[i].progress;
        } else {
            if (!currentMilestone) {
                nextMilestone = milestones[i];
            }
            break;
        }
    }

    // Calculate interpolated progress between milestones
    if (currentMilestone && nextMilestone) {
        const timeSinceCurrent = elapsedTime - currentMilestone.time;
        const timeToNext = nextMilestone.time - currentMilestone.time;
        const progressRange = nextMilestone.progress - currentMilestone.progress;
        const interpolatedProgress = (timeSinceCurrent / timeToNext) * progressRange;
        progress = Math.min(currentMilestone.progress + interpolatedProgress, nextMilestone.progress);
    }

    // Calculate time until next milestone
    let timeToNextMilestone = null;
    if (nextMilestone) {
        timeToNextMilestone = nextMilestone.time - elapsedTime;
    }

    return {
        progress: Math.min(Math.max(progress, 0), 100),
        currentMilestone,
        nextMilestone,
        elapsedTime,
        effectiveQuitDate,
        timeToNextMilestone,
        completedMilestones: milestones.filter(m => elapsedTime >= m.time),
        upcomingMilestones: milestones.filter(m => elapsedTime < m.time).slice(0, 5)
    };
}

/**
 * Get effective quit date accounting for relapses
 * Uses a weighted system where relapses push back progress
 * @export
 */
export function getEffectiveQuitDate(originalQuitDate, relapseEntries, substance) {
    if (!relapseEntries || relapseEntries.length === 0) {
        return new Date(originalQuitDate);
    }

    // Filter relapses for this substance after quit date
    const relevantRelapses = relapseEntries.filter(
        e => e.substance === substance &&
            e.type === 'relapse' &&
            new Date(e.date) > new Date(originalQuitDate)
    );

    if (relevantRelapses.length === 0) {
        return new Date(originalQuitDate);
    }

    // Get most recent relapse
    const lastRelapse = relevantRelapses.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    )[0];

    // Calculate impact based on amount and frequency
    const impactFactor = calculateRelapseImpact(lastRelapse);

    // Push back effective quit date based on impact
    const daysPushedBack = impactFactor * 3; // Up to 3 days pushback per relapse
    const effectiveDate = new Date(lastRelapse.date);
    effectiveDate.setDate(effectiveDate.getDate() + daysPushedBack);

    return effectiveDate;
}

/**
 * Calculate the impact of a relapse (0-1 scale)
 */
function calculateRelapseImpact(relapse) {
    let impact = 0.5; // Base impact

    // Adjust based on amount
    if (relapse.amount) {
        if (relapse.amount === 'heavy') impact = 1;
        else if (relapse.amount === 'moderate') impact = 0.7;
        else if (relapse.amount === 'light') impact = 0.3;
    }

    return impact;
}

/**
 * Calculate mood indicator progress
 */
export function calculateMoodProgress(quitDate, substance, indicator) {
    if (!quitDate) return { severity: 100, phase: 'not_started' };

    const now = new Date();
    const elapsedTime = now - new Date(quitDate);
    const moodData = MOOD_INDICATORS[indicator];

    if (!moodData) return { severity: 0, phase: 'unknown' };

    const peakTime = moodData.peakTimes[substance];
    const recoveryTime = moodData.recoveryTime[substance];

    if (!peakTime || !recoveryTime) return { severity: 0, phase: 'not_affected' };

    let severity = 0;
    let phase = '';

    if (elapsedTime < peakTime) {
        // Building up to peak
        severity = (elapsedTime / peakTime) * 100;
        phase = 'building';
    } else if (elapsedTime < recoveryTime) {
        // Declining from peak
        const declineProgress = (elapsedTime - peakTime) / (recoveryTime - peakTime);
        severity = 100 - (declineProgress * 100);
        phase = 'declining';
    } else {
        // Recovered
        severity = 0;
        phase = 'recovered';
    }

    return {
        severity: Math.max(0, Math.min(100, severity)),
        phase,
        peakTime,
        recoveryTime,
        elapsedTime
    };
}

/**
 * Calculate neurotransmitter recovery progress
 */
export function calculateNeurotransmitterProgress(quitDate, substance, neurotransmitter) {
    if (!quitDate) return { progress: 0, phase: 'not_started' };

    const now = new Date();
    const elapsedTime = now - new Date(quitDate);
    const ntData = NEUROTRANSMITTER_RECOVERY[neurotransmitter];

    if (!ntData || !ntData.affectedBy.includes(substance)) {
        return { progress: 100, phase: 'not_affected' };
    }

    const recoveryTime = ntData.timeMs;
    const progress = Math.min((elapsedTime / recoveryTime) * 100, 100);

    let phase = 'recovering';
    if (progress >= 100) phase = 'recovered';
    else if (progress < 25) phase = 'early';
    else if (progress < 75) phase = 'progressing';

    return {
        progress,
        phase,
        recoveryTime,
        elapsedTime,
        effect: ntData.effect,
        name: ntData.name
    };
}

/**
 * Calculate organ/system health
 */
export function calculateSystemHealth(quitDates, substance, systemId) {
    const quitDate = quitDates[substance];
    if (!quitDate) return { health: 0, status: 'damaged' };

    const now = new Date();
    const elapsedTime = now - new Date(quitDate);
    const milestones = getMilestones(substance);

    // Filter milestones that affect this system
    const relevantMilestones = milestones.filter(m =>
        m.systems && m.systems.includes(systemId)
    );

    if (relevantMilestones.length === 0) {
        return { health: 100, status: 'not_affected' };
    }

    // Calculate health based on completed milestones for this system
    const completedMilestones = relevantMilestones.filter(m => elapsedTime >= m.time);
    const health = (completedMilestones.length / relevantMilestones.length) * 100;

    let status = 'damaged';
    if (health >= 100) status = 'healed';
    else if (health >= 75) status = 'mostly_healed';
    else if (health >= 50) status = 'healing';
    else if (health >= 25) status = 'early_healing';

    const lastCompleted = completedMilestones[completedMilestones.length - 1];
    const nextMilestone = relevantMilestones.find(m => elapsedTime < m.time);

    return {
        health,
        status,
        lastMilestone: lastCompleted,
        nextMilestone,
        completedCount: completedMilestones.length,
        totalCount: relevantMilestones.length
    };
}

/**
 * Format time duration for display
 */
export function formatDuration(ms) {
    if (ms < 0) return 'Not started';

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
        const remainingMonths = Math.floor((days % 365) / 30);
        return remainingMonths > 0
            ? `${years}y ${remainingMonths}mo`
            : `${years} year${years > 1 ? 's' : ''}`;
    }
    if (months > 0) {
        const remainingDays = days % 30;
        return remainingDays > 0
            ? `${months}mo ${remainingDays}d`
            : `${months} month${months > 1 ? 's' : ''}`;
    }
    if (weeks > 0) {
        const remainingDays = days % 7;
        return remainingDays > 0
            ? `${weeks}w ${remainingDays}d`
            : `${weeks} week${weeks > 1 ? 's' : ''}`;
    }
    if (days > 0) {
        const remainingHours = hours % 24;
        return remainingHours > 0
            ? `${days}d ${remainingHours}h`
            : `${days} day${days > 1 ? 's' : ''}`;
    }
    if (hours > 0) {
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0
            ? `${hours}h ${remainingMinutes}m`
            : `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return 'Just now';
}

/**
 * Get overall combined health score
 */
export function getOverallHealth(quitDates, entries = []) {
    const substances = ['cigarettes', 'cannabis', 'alcohol'];
    let totalProgress = 0;
    let activeCount = 0;

    for (const substance of substances) {
        if (quitDates[substance]) {
            const { progress } = calculateRecoveryProgress(
                quitDates[substance],
                substance,
                entries
            );
            totalProgress += progress;
            activeCount++;
        }
    }

    return activeCount > 0 ? totalProgress / activeCount : 0;
}

/**
 * Get streak information
 */
export function getStreakInfo(quitDate, relapseEntries = [], substance) {
    if (!quitDate) return { days: 0, isActive: false };

    const now = new Date();
    const effectiveDate = getEffectiveQuitDate(quitDate, relapseEntries, substance);
    const elapsedMs = now - effectiveDate;
    const days = Math.floor(elapsedMs / (24 * 60 * 60 * 1000));

    return {
        days: Math.max(0, days),
        isActive: days >= 0,
        effectiveDate
    };
}

/**
 * Get a combined timeline of milestones across all substances
 */
export function getCombinedTimeline(quitDates, entries = [], maxItems = 10) {
    const substances = ['cigarettes', 'cannabis', 'alcohol'];
    let allProcessedMilestones = [];

    for (const substance of substances) {
        if (quitDates[substance]) {
            const milestones = getMilestones(substance);
            const { elapsedTime } = calculateRecoveryProgress(quitDates[substance], substance, entries);

            milestones.forEach(m => {
                allProcessedMilestones.push({
                    ...m,
                    substance,
                    isCompleted: elapsedTime >= m.time,
                    timeToEvent: m.time - elapsedTime,
                    actualTime: m.time
                });
            });
        }
    }

    // Sort: Completed (most recent first) then Upcoming (soonest first)
    const completed = allProcessedMilestones
        .filter(m => m.isCompleted)
        .sort((a, b) => b.actualTime - a.actualTime);

    const upcoming = allProcessedMilestones
        .filter(m => !m.isCompleted)
        .sort((a, b) => a.timeToEvent - b.timeToEvent);

    // Return a mix based on maxItems
    const result = [];
    if (completed.length > 0) result.push(...completed.slice(0, 3));
    result.push(...upcoming);

    return result.slice(0, maxItems);
}

/**
 * Calculate Advanced Analytics (Financial & Health)
 * Protected against NaN with proper default values
 */
export function getAdvancedAnalytics(quitDates = {}, entries = [], userCosts = null) {
    const substances = ['cigarettes', 'cannabis', 'alcohol'];
    let totalMoneySaved = 0;
    let totalLifeMinutesRegained = 0;
    let totalHeartbeatsSaved = 0;

    for (const substance of substances) {
        if (quitDates && quitDates[substance]) {
            const config = ANALYTICS_CONFIG[substance];
            if (!config) continue;
            
            // Use custom cost if provided, otherwise default - ensure valid number
            const rawCost = (userCosts && userCosts[substance]) ? Number(userCosts[substance]) : config.costPerDay;
            const costPerDay = isNaN(rawCost) || rawCost < 0 ? 0 : rawCost;

            const progressData = calculateRecoveryProgress(quitDates[substance], substance, entries);
            const elapsedTime = progressData?.elapsedTime || 0;
            const totalDays = Math.max(0, elapsedTime / (1000 * 60 * 60 * 24));

            // Financial - ensure no NaN
            const saved = totalDays * costPerDay;
            totalMoneySaved += isNaN(saved) ? 0 : saved;

            // Health - ensure no NaN
            const unitsNotConsumed = totalDays * (config.usagePerDay || 0);
            const lifeMinutes = unitsNotConsumed * (config.lifeMinutesPerUnit || 0);
            const heartbeats = unitsNotConsumed * (config.heartbeatsPerUnit || 0);
            
            totalLifeMinutesRegained += isNaN(lifeMinutes) ? 0 : lifeMinutes;
            totalHeartbeatsSaved += isNaN(heartbeats) ? 0 : heartbeats;
        }
    }

    // Final NaN protection
    totalMoneySaved = isNaN(totalMoneySaved) ? 0 : totalMoneySaved;
    totalLifeMinutesRegained = isNaN(totalLifeMinutesRegained) ? 0 : totalLifeMinutesRegained;
    totalHeartbeatsSaved = isNaN(totalHeartbeatsSaved) ? 0 : totalHeartbeatsSaved;

    return {
        moneySaved: totalMoneySaved,
        lifeRegainedMinutes: totalLifeMinutesRegained,
        heartbeatsSaved: totalHeartbeatsSaved,
        moneySavedFormatted: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalMoneySaved),
        lifeRegainedFormatted: formatDuration(totalLifeMinutesRegained * 60 * 1000) || '0 mins'
    };
}
