// Recovery Tracker - Complete Recovery Milestone Database
// Based on medical research data

// Time constants in milliseconds
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

// ==========================================
// 🚬 CIGARETTE RECOVERY MILESTONES
// ==========================================
export const CIGARETTE_MILESTONES = [
  // IMMEDIATE (Minutes to Hours)
  {
    id: 'cig_20min',
    time: 20 * MINUTE,
    label: '20 Minutes',
    category: 'immediate',
    physical: 'Heart rate drops to normal; Blood pressure starts decreasing',
    psychological: null,
    systems: ['heart'],
    progress: 1
  },
  {
    id: 'cig_1hr',
    time: 1 * HOUR,
    label: '1 Hour',
    category: 'immediate',
    physical: 'Circulation begins improving; Bronchial fibers start moving again',
    psychological: null,
    systems: ['lungs', 'blood'],
    progress: 2
  },
  {
    id: 'cig_8hr',
    time: 8 * HOUR,
    label: '8 Hours',
    category: 'immediate',
    physical: 'Carbon monoxide drops 50%; Oxygen levels rise significantly',
    psychological: null,
    systems: ['blood', 'brain'],
    progress: 3
  },
  {
    id: 'cig_12hr',
    time: 12 * HOUR,
    label: '12 Hours',
    category: 'immediate',
    physical: 'CO levels return to normal; Full oxygen capacity restored',
    psychological: null,
    systems: ['blood'],
    progress: 5
  },
  // SHORT-TERM (Days)
  {
    id: 'cig_24hr',
    time: 24 * HOUR,
    label: '24 Hours',
    category: 'days',
    physical: 'Heart attack risk decreases; Nicotine nearly eliminated; Veins/arteries relax',
    psychological: 'Withdrawal begins: anxiety, irritability',
    systems: ['heart', 'blood'],
    progress: 7
  },
  {
    id: 'cig_48hr',
    time: 48 * HOUR,
    label: '48 Hours',
    category: 'days',
    physical: 'Nerve endings regrow; Taste/smell senses sharpen',
    psychological: 'Cravings intensify; restlessness peaks',
    systems: ['nerves', 'senses'],
    progress: 10
  },
  {
    id: 'cig_72hr',
    time: 72 * HOUR,
    label: '72 Hours',
    category: 'days',
    physical: 'Bronchial tubes fully relax; Lung capacity increases; Energy improves',
    psychological: 'Peak withdrawal: irritability, anxiety, depression, headaches',
    systems: ['lungs'],
    progress: 12
  },
  // FIRST WEEKS
  {
    id: 'cig_week1',
    time: 1 * WEEK,
    label: 'Week 1',
    category: 'weeks',
    physical: 'Cilia regain function; Mucus clears; Breathing easier',
    psychological: 'Mental fog worst; difficulty concentrating',
    systems: ['lungs'],
    progress: 15
  },
  {
    id: 'cig_week2',
    time: 2 * WEEK,
    label: 'Week 2',
    category: 'weeks',
    physical: 'Circulation significantly improved; Walking easier',
    psychological: 'Symptoms starting to fade; mood stabilizing',
    systems: ['blood', 'heart'],
    progress: 20
  },
  {
    id: 'cig_week3',
    time: 3 * WEEK,
    label: 'Week 3',
    category: 'weeks',
    physical: 'Lung function +30%; Physical activity easier',
    psychological: 'Psychological addiction confrontation phase',
    systems: ['lungs'],
    progress: 25
  },
  {
    id: 'cig_week4',
    time: 4 * WEEK,
    label: 'Week 4',
    category: 'weeks',
    physical: 'Most physical symptoms resolved',
    psychological: 'Brain fog clears; thinking clearer',
    systems: ['brain'],
    progress: 30
  },
  // MONTHS
  {
    id: 'cig_1mo',
    time: 1 * MONTH,
    label: '1 Month',
    category: 'months',
    physical: 'Lung fibers regrow; Sinus congestion decreases; Infection risk drops',
    psychological: 'Mood improvements begin',
    systems: ['lungs', 'immune'],
    progress: 35
  },
  {
    id: 'cig_3mo',
    time: 3 * MONTH,
    label: '3 Months',
    category: 'months',
    physical: 'Circulation fully improved; Heart function enhanced',
    psychological: 'Dopamine normalizes; reward system heals',
    systems: ['heart', 'brain'],
    progress: 45
  },
  {
    id: 'cig_6mo',
    time: 6 * MONTH,
    label: '6 Months',
    category: 'months',
    physical: 'Airways less inflamed; Coughing/phlegm rare; Handles stress better',
    psychological: 'Anxiety/depression lower than when smoking',
    systems: ['lungs', 'brain'],
    progress: 55
  },
  {
    id: 'cig_9mo',
    time: 9 * MONTH,
    label: '9 Months',
    category: 'months',
    physical: 'Lung function +10%; Cilia fully restored',
    psychological: 'Significant quality of life improvement',
    systems: ['lungs'],
    progress: 65
  },
  // YEARS
  {
    id: 'cig_1yr',
    time: 1 * YEAR,
    label: '1 Year',
    category: 'years',
    physical: 'Heart disease risk halved; Cilia function like non-smoker',
    psychological: 'Full psychological recovery for most',
    systems: ['heart', 'lungs'],
    diseaseRisk: 'Coronary heart disease ↓50%',
    progress: 75
  },
  {
    id: 'cig_5yr',
    time: 5 * YEAR,
    label: '5 Years',
    category: 'years',
    physical: 'Stroke risk equals non-smoker; Blood vessels widened',
    psychological: null,
    systems: ['brain', 'blood'],
    diseaseRisk: 'Mouth/throat/esophageal/bladder cancer ↓50%',
    progress: 85
  },
  {
    id: 'cig_10yr',
    time: 10 * YEAR,
    label: '10 Years',
    category: 'years',
    physical: 'Lung function nearly normal',
    psychological: null,
    systems: ['lungs'],
    diseaseRisk: 'Lung cancer risk halved; Pancreas/larynx cancer ↓',
    progress: 95
  },
  {
    id: 'cig_15yr',
    time: 15 * YEAR,
    label: '15 Years',
    category: 'years',
    physical: 'Cardiovascular health equals non-smoker',
    psychological: null,
    systems: ['heart'],
    diseaseRisk: 'Heart attack risk same as never-smoker',
    progress: 100
  }
];

// ==========================================
// 🌿 CANNABIS RECOVERY MILESTONES
// ==========================================
export const CANNABIS_MILESTONES = [
  // FIRST WEEK (Day-by-Day)
  {
    id: 'can_day1',
    time: 1 * DAY,
    label: 'Day 1',
    category: 'days',
    physical: 'Headaches begin; Appetite decreases',
    psychological: 'Irritability starts; Mild anxiety',
    systems: ['brain', 'digestive'],
    progress: 3
  },
  {
    id: 'can_day2',
    time: 2 * DAY,
    label: 'Day 2',
    category: 'days',
    physical: 'Sweating increases; Stomach discomfort',
    psychological: 'Restlessness; Cravings intensify',
    systems: ['skin', 'digestive'],
    progress: 5
  },
  {
    id: 'can_day3',
    time: 3 * DAY,
    label: 'Day 3',
    category: 'days',
    physical: 'Physical symptoms peak: Chills, tremors, nausea',
    psychological: 'Psychological peak: Anger, depression, mood swings',
    systems: ['brain', 'nerves'],
    progress: 8
  },
  {
    id: 'can_day4',
    time: 4 * DAY,
    label: 'Day 4',
    category: 'days',
    physical: 'Physical symptoms begin tapering; CB-1 receptors healing',
    psychological: 'Depression may intensify as brain adjusts',
    systems: ['brain'],
    progress: 12
  },
  {
    id: 'can_day5_6',
    time: 6 * DAY,
    label: 'Day 5-6',
    category: 'days',
    physical: 'Shakiness/chills decreasing',
    psychological: 'Sleep disturbances begin; Strange dreams',
    systems: ['nerves'],
    progress: 15
  },
  {
    id: 'can_day7',
    time: 7 * DAY,
    label: 'Day 7',
    category: 'days',
    physical: 'Most physical discomfort subsiding',
    psychological: 'Irritability persists; Anxiety fluctuates',
    systems: ['brain'],
    progress: 18
  },
  // SECOND WEEK
  {
    id: 'can_day8_10',
    time: 10 * DAY,
    label: 'Day 8-10',
    category: 'weeks',
    physical: 'Energy slowly returning; Appetite improving',
    psychological: 'Mood stabilizing; Anger diminishing',
    systems: ['digestive', 'brain'],
    progress: 22
  },
  {
    id: 'can_day11_14',
    time: 14 * DAY,
    label: 'Day 11-14',
    category: 'weeks',
    physical: 'Physical symptoms largely resolved',
    psychological: 'Sleep issues persist; Mental fog beginning to clear',
    systems: ['brain'],
    progress: 28
  },
  // WEEKS 3-4
  {
    id: 'can_week3',
    time: 3 * WEEK,
    label: 'Week 3',
    category: 'weeks',
    physical: 'Body detox continuing; THC still excreting',
    psychological: 'Emotional stability improving; Fatigue persists',
    systems: ['liver', 'brain'],
    progress: 35
  },
  {
    id: 'can_week4',
    time: 4 * WEEK,
    label: 'Week 4',
    category: 'weeks',
    physical: 'CB-1 receptors fully normalized',
    psychological: 'Memory function improving; Focus better',
    systems: ['brain'],
    progress: 42
  },
  // MONTHS
  {
    id: 'can_30days',
    time: 30 * DAY,
    label: '30 Days',
    category: 'months',
    physical: 'THC fully excreted; Lungs healing',
    psychological: 'Acute withdrawal resolved; Some anxiety may linger',
    systems: ['lungs', 'brain'],
    progress: 50
  },
  {
    id: 'can_45days',
    time: 45 * DAY,
    label: '45 Days',
    category: 'months',
    physical: 'Sleep patterns normalizing',
    psychological: 'Insomnia resolves for most; Strange dreams end',
    systems: ['brain'],
    progress: 58
  },
  {
    id: 'can_2mo',
    time: 2 * MONTH,
    label: '2 Months',
    category: 'months',
    physical: 'Improved breathing; Better physical stamina',
    psychological: 'Mental clarity significantly improved',
    systems: ['lungs', 'brain'],
    progress: 68
  },
  {
    id: 'can_3mo',
    time: 3 * MONTH,
    label: '3 Months',
    category: 'months',
    physical: 'Cardiovascular health stabilizing; Immune stronger',
    psychological: 'Cognitive function returns; Concentration normal',
    systems: ['heart', 'immune', 'brain'],
    progress: 80
  },
  {
    id: 'can_6mo',
    time: 6 * MONTH,
    label: '6 Months',
    category: 'months',
    physical: 'Lung function substantially improved',
    psychological: 'Emotional resilience strong; Depression/anxiety resolved',
    systems: ['lungs', 'brain'],
    progress: 92
  },
  {
    id: 'can_1yr',
    time: 1 * YEAR,
    label: '1 Year',
    category: 'years',
    physical: 'Full physical recovery for most',
    psychological: 'Optimal mental clarity; Long-term memory restored',
    systems: ['brain', 'lungs', 'heart'],
    progress: 100
  }
];

// ==========================================
// 🍺 ALCOHOL RECOVERY MILESTONES
// ==========================================
export const ALCOHOL_MILESTONES = [
  // ACUTE WITHDRAWAL (Hour-by-Hour)
  {
    id: 'alc_6hr',
    time: 6 * HOUR,
    label: '6 Hours',
    category: 'hours',
    physical: 'Early symptoms may begin',
    psychological: 'Anxiety starting',
    systems: ['brain'],
    riskLevel: 'low',
    progress: 1
  },
  {
    id: 'alc_12hr',
    time: 12 * HOUR,
    label: '12 Hours',
    category: 'hours',
    physical: 'Headaches; Sweating; Tremors; Nausea; Rapid heart rate',
    psychological: 'Anxiety; Insomnia begins',
    systems: ['heart', 'nerves'],
    riskLevel: 'moderate',
    progress: 3
  },
  {
    id: 'alc_24hr',
    time: 24 * HOUR,
    label: '24 Hours',
    category: 'hours',
    physical: 'Symptoms intensify: Vomiting; Increased BP',
    psychological: 'Agitation; Paranoia; Nightmares; 25% may hallucinate',
    systems: ['brain', 'heart'],
    riskLevel: 'high',
    progress: 5
  },
  {
    id: 'alc_48hr',
    time: 48 * HOUR,
    label: '48 Hours',
    category: 'hours',
    physical: 'Peak symptoms: Fever; Irregular heartbeat',
    psychological: 'Confusion; Severe anxiety; Depression',
    systems: ['heart', 'brain'],
    riskLevel: 'critical',
    warning: 'Highest seizure risk',
    progress: 8
  },
  {
    id: 'alc_72hr',
    time: 72 * HOUR,
    label: '72 Hours',
    category: 'hours',
    physical: 'Symptoms peak or begin subsiding',
    psychological: 'Delirium Tremens risk (5-15%): Severe confusion, hallucinations',
    systems: ['brain'],
    riskLevel: 'critical',
    warning: 'DT risk period',
    progress: 10
  },
  // FIRST WEEK (Day-by-Day)
  {
    id: 'alc_day4',
    time: 4 * DAY,
    label: 'Day 4',
    category: 'days',
    physical: 'Shaking decreases; Heart rate stabilizing',
    psychological: 'Anxiety still high but manageable',
    systems: ['heart', 'liver'],
    organProgress: 'Liver beginning detox',
    progress: 15
  },
  {
    id: 'alc_day5',
    time: 5 * DAY,
    label: 'Day 5',
    category: 'days',
    physical: 'Nausea subsiding; Appetite returning',
    psychological: 'Sleep slightly improving',
    systems: ['digestive', 'liver'],
    organProgress: 'Liver enzymes dropping',
    progress: 18
  },
  {
    id: 'alc_day6',
    time: 6 * DAY,
    label: 'Day 6',
    category: 'days',
    physical: 'Energy slowly returning; Sweating decreases',
    psychological: 'Mood swings; Irritability',
    systems: ['skin'],
    organProgress: 'Hydration improving',
    progress: 20
  },
  {
    id: 'alc_day7',
    time: 7 * DAY,
    label: 'Day 7',
    category: 'days',
    physical: 'Most physical symptoms resolved',
    psychological: 'Depression emerging; Cravings strong',
    systems: ['liver'],
    organProgress: 'Liver enzymes normalizing',
    progress: 25
  },
  // WEEKS 2-4
  {
    id: 'alc_week2',
    time: 2 * WEEK,
    label: 'Week 2',
    category: 'weeks',
    physical: 'Heart rate/BP normalized; Skin improving',
    psychological: 'Brain fog clearing; Sleep better',
    systems: ['heart', 'skin', 'brain'],
    brainProgress: 'Grey matter recovery begins',
    progress: 32
  },
  {
    id: 'alc_week3',
    time: 3 * WEEK,
    label: 'Week 3',
    category: 'weeks',
    physical: 'Digestion improving; Weight stabilizing',
    psychological: 'Dopamine crash: emptiness, low motivation',
    systems: ['digestive', 'brain'],
    brainProgress: 'Receptors healing',
    progress: 38
  },
  {
    id: 'alc_week4',
    time: 4 * WEEK,
    label: 'Week 4',
    category: 'weeks',
    physical: 'Liver inflammation resolving; Clearer skin/hair',
    psychological: 'Memory/concentration improving',
    systems: ['liver', 'skin', 'brain'],
    brainProgress: 'Neural pathways healing',
    progress: 45
  },
  // MONTHS
  {
    id: 'alc_1mo',
    time: 1 * MONTH,
    label: '1 Month',
    category: 'months',
    physical: 'Fatty liver reversing; Enzyme levels normal',
    psychological: 'Mental clarity emerging; Emotional stability beginning',
    systems: ['liver', 'brain'],
    progress: 50
  },
  {
    id: 'alc_6wk',
    time: 6 * WEEK,
    label: '6 Weeks',
    category: 'months',
    physical: 'Fat deposits significantly reduced',
    psychological: 'Focus improving; Fewer cravings',
    systems: ['liver', 'brain'],
    progress: 55
  },
  {
    id: 'alc_2mo',
    time: 2 * MONTH,
    label: '2 Months',
    category: 'months',
    physical: 'Liver regenerating damaged cells',
    psychological: 'Working memory improved',
    systems: ['liver', 'brain'],
    progress: 62
  },
  {
    id: 'alc_3mo',
    time: 3 * MONTH,
    label: '3 Months',
    category: 'months',
    physical: 'Liver function greatly improved',
    psychological: 'Dopamine stabilized; Serotonin normalizing; Mood stable',
    systems: ['liver', 'brain'],
    neurotransmitter: 'dopamine',
    progress: 72
  },
  {
    id: 'alc_6mo',
    time: 6 * MONTH,
    label: '6 Months',
    category: 'months',
    physical: 'Liver healing significant; Energy high',
    psychological: 'Grey matter volume increasing; Problem-solving improved',
    systems: ['liver', 'brain'],
    neurotransmitter: 'serotonin',
    progress: 85
  },
  {
    id: 'alc_1yr',
    time: 1 * YEAR,
    label: '1 Year',
    category: 'years',
    physical: 'Full liver recovery (if no cirrhosis)',
    psychological: 'Full brain chemistry balance; Natural joy returns',
    systems: ['liver', 'brain', 'heart'],
    progress: 100
  }
];

// ==========================================
// NEUROTRANSMITTER RECOVERY
// ==========================================
export const NEUROTRANSMITTER_RECOVERY = {
  gaba: {
    name: 'GABA',
    fullName: 'Gamma-Aminobutyric Acid',
    timeline: '1-4 weeks',
    timeMs: 4 * WEEK,
    effect: 'Anxiety reduces; Sleep normalizes',
    affectedBy: ['alcohol']
  },
  dopamine: {
    name: 'Dopamine',
    fullName: 'Dopamine Receptors',
    timeline: '2 weeks → 90 days',
    timeMs: 90 * DAY,
    effect: 'Pleasure response returns; Motivation rebuilds',
    affectedBy: ['alcohol', 'cannabis', 'cigarettes']
  },
  serotonin: {
    name: 'Serotonin',
    fullName: 'Serotonin Levels',
    timeline: '3-6 months',
    timeMs: 6 * MONTH,
    effect: 'Depression lifts; Mood regulation restored',
    affectedBy: ['alcohol']
  },
  greyMatter: {
    name: 'Grey Matter',
    fullName: 'Grey Matter Volume',
    timeline: '3 months → 1+ year',
    timeMs: 1 * YEAR,
    effect: 'Memory improves; Learning ability returns',
    affectedBy: ['alcohol']
  },
  corticalThickness: {
    name: 'Cortical Thickness',
    fullName: 'Cortical Thickness',
    timeline: '6-7 months',
    timeMs: 7 * MONTH,
    effect: 'Approaches non-drinker levels',
    affectedBy: ['alcohol']
  },
  cb1Receptors: {
    name: 'CB-1 Receptors',
    fullName: 'Cannabinoid 1 Receptors',
    timeline: '4 weeks',
    timeMs: 4 * WEEK,
    effect: 'Normal brain signaling restored',
    affectedBy: ['cannabis']
  }
};

// ==========================================
// BODY SYSTEMS MAPPING
// ==========================================
export const BODY_SYSTEMS = {
  heart: {
    name: 'Heart',
    icon: '❤️',
    affectedBy: ['cigarettes', 'alcohol'],
    position: { x: 50, y: 35 }
  },
  lungs: {
    name: 'Lungs',
    icon: '🫁',
    affectedBy: ['cigarettes', 'cannabis'],
    position: { x: 50, y: 40 }
  },
  brain: {
    name: 'Brain',
    icon: '🧠',
    affectedBy: ['cigarettes', 'cannabis', 'alcohol'],
    position: { x: 50, y: 15 }
  },
  liver: {
    name: 'Liver',
    icon: '🫘',
    affectedBy: ['alcohol'],
    position: { x: 40, y: 50 }
  },
  blood: {
    name: 'Blood',
    icon: '🩸',
    affectedBy: ['cigarettes'],
    position: { x: 50, y: 45 }
  },
  nerves: {
    name: 'Nerves',
    icon: '⚡',
    affectedBy: ['cigarettes', 'cannabis'],
    position: { x: 50, y: 55 }
  },
  immune: {
    name: 'Immune System',
    icon: '🛡️',
    affectedBy: ['cigarettes', 'cannabis', 'alcohol'],
    position: { x: 60, y: 50 }
  },
  digestive: {
    name: 'Digestive System',
    icon: '🍃',
    affectedBy: ['cannabis', 'alcohol'],
    position: { x: 50, y: 60 }
  },
  skin: {
    name: 'Skin',
    icon: '✨',
    affectedBy: ['alcohol'],
    position: { x: 30, y: 30 }
  },
  senses: {
    name: 'Taste & Smell',
    icon: '👃',
    affectedBy: ['cigarettes'],
    position: { x: 50, y: 20 }
  }
};

// ==========================================
// MOOD INDICATORS
// ==========================================
export const MOOD_INDICATORS = {
  anxiety: {
    name: 'Anxiety',
    icon: '😰',
    peakTimes: {
      cigarettes: 3 * DAY,
      cannabis: 3 * DAY,
      alcohol: 48 * HOUR
    },
    recoveryTime: {
      cigarettes: 4 * WEEK,
      cannabis: 3 * WEEK,
      alcohol: 3 * MONTH
    }
  },
  depression: {
    name: 'Depression',
    icon: '😔',
    peakTimes: {
      cigarettes: 1 * WEEK,
      cannabis: 1 * WEEK,
      alcohol: 3 * WEEK
    },
    recoveryTime: {
      cigarettes: 3 * MONTH,
      cannabis: 3 * MONTH,
      alcohol: 6 * MONTH
    }
  },
  irritability: {
    name: 'Irritability',
    icon: '😤',
    peakTimes: {
      cigarettes: 3 * DAY,
      cannabis: 3 * DAY,
      alcohol: 72 * HOUR
    },
    recoveryTime: {
      cigarettes: 2 * WEEK,
      cannabis: 2 * WEEK,
      alcohol: 1 * MONTH
    }
  },
  focus: {
    name: 'Focus',
    icon: '🎯',
    peakTimes: {
      cigarettes: 1 * WEEK,
      cannabis: 1 * WEEK,
      alcohol: 2 * WEEK
    },
    recoveryTime: {
      cigarettes: 4 * WEEK,
      cannabis: 1 * MONTH,
      alcohol: 3 * MONTH
    }
  },
  cravings: {
    name: 'Cravings',
    icon: '🔥',
    peakTimes: {
      cigarettes: 3 * DAY,
      cannabis: 3 * DAY,
      alcohol: 1 * WEEK
    },
    recoveryTime: {
      cigarettes: 3 * MONTH,
      cannabis: 1 * MONTH,
      alcohol: 3 * MONTH
    }
  }
};

/**
 * Substance Configuration for Analytics
 */
export const ANALYTICS_CONFIG = {
  cigarettes: {
    costPerDay: 350.0, // Average cost of a premium pack (INR)
    usagePerDay: 20, // Average cigs per pack
    lifeMinutesPerUnit: 11, // Minutes of life lost per cigarette
    heartbeatsPerUnit: 1500, // Extra heartbeats per cig due to heart rate spike
  },
  cannabis: {
    costPerDay: 500.0, // Average daily usage cost (INR)
    usagePerDay: 1, // Joints/bowls
    lifeMinutesPerUnit: 0, // Debatable, focusing on cognitive impact
    heartbeatsPerUnit: 1000,
  },
  alcohol: {
    costPerDay: 400.0, // Average drink cost (INR)
    usagePerDay: 2, // Standard drinks
    lifeMinutesPerUnit: 15, // Minutes lost per heavy drink
    heartbeatsPerUnit: 2000, // Chronic drinking increases RHR
  }
};

/**
 * Get milestones for a specific substance
 */
export function getMilestones(substance) {
  switch (substance) {
    case 'cigarettes':
      return CIGARETTE_MILESTONES;
    case 'cannabis':
      return CANNABIS_MILESTONES;
    case 'alcohol':
      return ALCOHOL_MILESTONES;
    default:
      return [];
  }
}

// Helper to get all milestones sorted by time
export function getAllMilestonesSorted() {
  return [
    ...CIGARETTE_MILESTONES.map(m => ({ ...m, substance: 'cigarettes' })),
    ...CANNABIS_MILESTONES.map(m => ({ ...m, substance: 'cannabis' })),
    ...ALCOHOL_MILESTONES.map(m => ({ ...m, substance: 'alcohol' }))
  ].sort((a, b) => a.time - b.time);
}
