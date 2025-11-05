import { SleepSession } from '@/types/sleep';

export const calculateSleepQuality = (
  session: SleepSession,
  allSessions: SleepSession[] = []
): number => {
  // Duration Score (30%)
  const durationScore = calculateDurationScore(session.duration);

  // Efficiency Score (25%) - simplified for now
  const efficiencyScore = 100;

  // Interruption Score (20%)
  const interruptionScore = Math.max(0, 100 - (session.interruptions * 10));

  // Phase Distribution Score (15%)
  const phaseScore = calculatePhaseScore(session.phases);

  // Consistency Score (10%) - based on sleep schedule regularity
  const consistencyScore = calculateConsistencyScore(allSessions);

  const quality = (
    durationScore * 0.3 +
    efficiencyScore * 0.25 +
    interruptionScore * 0.2 +
    phaseScore * 0.15 +
    consistencyScore * 0.1
  );

  return Math.round(quality);
};

const calculateDurationScore = (minutes: number): number => {
  const hours = minutes / 60;
  if (hours >= 7 && hours <= 9) return 100;
  if (hours >= 6 && hours < 7) return 80;
  if (hours >= 5 && hours < 6) return 60;
  if (hours > 9 && hours <= 10) return 80;
  return 40;
};

const calculatePhaseScore = (phases: SleepSession['phases']): number => {
  const total = phases.light + phases.deep + phases.rem + phases.awake;
  if (total === 0) return 100;

  const lightPercent = (phases.light / total) * 100;
  const deepPercent = (phases.deep / total) * 100;
  const remPercent = (phases.rem / total) * 100;

  // Ideal: 50% light, 30% deep, 20% REM
  const lightDiff = Math.abs(lightPercent - 50);
  const deepDiff = Math.abs(deepPercent - 30);
  const remDiff = Math.abs(remPercent - 20);

  const avgDiff = (lightDiff + deepDiff + remDiff) / 3;
  return Math.max(0, 100 - avgDiff * 2);
};

export const generateSleepPhases = (duration: number): SleepSession['phases'] => {
  const cycles = Math.floor(duration / 90);
  const phases = {
    awake: 0,
    light: 0,
    deep: 0,
    rem: 0,
  };

  for (let i = 0; i < cycles; i++) {
    if (i === 0) {
      // First cycle: more deep sleep
      phases.light += 15;
      phases.deep += 50;
      phases.rem += 15;
    } else if (i === cycles - 1) {
      // Last cycle: more REM and light
      phases.light += 25;
      phases.deep += 20;
      phases.rem += 35;
    } else {
      // Middle cycles
      phases.light += 20;
      phases.deep += 35;
      phases.rem += 25;
    }
    
    // Random micro-awakenings
    if (Math.random() > 0.7) {
      phases.awake += Math.floor(Math.random() * 3) + 1;
    }
  }

  return phases;
};

export const calculateSleepDebt = (sessions: SleepSession[], goalMinutes: number): number => {
  const last7Days = sessions
    .filter(s => s.endTime)
    .slice(-7);

  const totalDebt = last7Days.reduce((debt, session) => {
    return debt + (goalMinutes - session.duration);
  }, 0);

  // Cap at ±600 minutes (10 hours)
  return Math.max(-600, Math.min(600, totalDebt));
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export const getQualityColor = (quality: number): string => {
  if (quality >= 80) return 'text-success';
  if (quality >= 60) return 'text-warning';
  return 'text-destructive';
};

export const getSleepDebtColor = (debtMinutes: number): string => {
  const hours = Math.abs(debtMinutes) / 60;
  if (hours <= 2) return 'text-success';
  if (hours <= 5) return 'text-warning';
  if (hours <= 8) return 'text-orange-500';
  return 'text-destructive';
};

const calculateConsistencyScore = (sessions: SleepSession[]): number => {
  // Get last 7 completed sessions
  const completedSessions = sessions
    .filter(s => s.endTime !== null)
    .slice(-7);

  // Need at least 3 sessions to calculate consistency
  if (completedSessions.length < 3) {
    return 100; // Default to perfect score for new users
  }

  // Extract bedtime and wake time hours (as decimal, e.g., 22.5 = 10:30 PM)
  const bedtimes = completedSessions.map(s => {
    const date = new Date(s.startTime);
    return date.getHours() + date.getMinutes() / 60;
  });

  const wakeTimes = completedSessions.map(s => {
    const date = new Date(s.endTime!);
    return date.getHours() + date.getMinutes() / 60;
  });

  // Calculate standard deviation for both
  const bedtimeStdDev = calculateStandardDeviation(bedtimes);
  const wakeTimeStdDev = calculateStandardDeviation(wakeTimes);

  // Average the two standard deviations
  const avgStdDev = (bedtimeStdDev + wakeTimeStdDev) / 2;

  // Convert to 0-100 score
  // 0 hours deviation = 100 score
  // 2+ hours deviation = 0 score
  // Linear interpolation between
  const score = Math.max(0, Math.min(100, 100 - (avgStdDev / 2) * 100));

  return Math.round(score);
};

const calculateStandardDeviation = (values: number[]): number => {
  if (values.length === 0) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;

  return Math.sqrt(variance);
};
