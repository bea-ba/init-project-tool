import { SleepSession } from '@/types/sleep';

export const calculateSleepQuality = (session: SleepSession): number => {
  // Duration Score (30%)
  const durationScore = calculateDurationScore(session.duration);
  
  // Efficiency Score (25%) - simplified for now
  const efficiencyScore = 100;
  
  // Interruption Score (20%)
  const interruptionScore = Math.max(0, 100 - (session.interruptions * 10));
  
  // Phase Distribution Score (15%)
  const phaseScore = calculatePhaseScore(session.phases);
  
  // Consistency Score (10%) - simplified for now
  const consistencyScore = 100;

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
