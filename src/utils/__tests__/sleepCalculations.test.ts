import { describe, it, expect } from 'vitest';
import {
  calculateSleepQuality,
  generateSleepPhases,
  calculateSleepDebt,
  formatDuration,
  getQualityColor,
  getSleepDebtColor,
} from '../sleepCalculations';
import { SleepSession } from '@/types/sleep';

describe('sleepCalculations', () => {
  describe('calculateSleepQuality', () => {
    const createMockSession = (overrides: Partial<SleepSession> = {}): SleepSession => ({
      id: '123e4567-e89b-12d3-a456-426614174000',
      startTime: new Date('2024-01-01T22:00:00'),
      endTime: new Date('2024-01-02T06:00:00'),
      duration: 480,
      quality: 0,
      phases: { awake: 10, light: 200, deep: 150, rem: 120 },
      interruptions: 2,
      notes: '',
      soundRecordings: [],
      environment: { noise: 20 },
      ...overrides,
    });

    it('should calculate high quality for optimal sleep (7-9 hours, ideal phases, few interruptions)', () => {
      const session = createMockSession({
        duration: 480, // 8 hours
        phases: { awake: 10, light: 240, deep: 144, rem: 96 }, // Close to ideal 50/30/20
        interruptions: 1,
      });

      const quality = calculateSleepQuality(session);
      expect(quality).toBeGreaterThanOrEqual(80);
      expect(quality).toBeLessThanOrEqual(100);
    });

    it('should calculate lower quality for short sleep duration', () => {
      const session = createMockSession({
        duration: 240, // 4 hours - significantly short
        phases: { awake: 10, light: 100, deep: 70, rem: 60 },
        interruptions: 3,
      });

      const quality = calculateSleepQuality(session);
      expect(quality).toBeLessThan(80);
    });

    it('should penalize many interruptions', () => {
      const session = createMockSession({
        duration: 300, // Shorter duration
        phases: { awake: 50, light: 120, deep: 70, rem: 60 }, // Poor distribution
        interruptions: 10, // Many interruptions
      });

      const quality = calculateSleepQuality(session);
      expect(quality).toBeLessThan(80);
    });

    it('should handle zero interruptions', () => {
      const session = createMockSession({
        duration: 480,
        phases: { awake: 10, light: 240, deep: 144, rem: 96 },
        interruptions: 0,
      });

      const quality = calculateSleepQuality(session);
      expect(quality).toBeGreaterThanOrEqual(80);
    });

    it('should calculate quality for very short sleep', () => {
      const session = createMockSession({
        duration: 180, // 3 hours
        phases: { awake: 20, light: 80, deep: 40, rem: 40 },
        interruptions: 5, // Some interruptions
      });

      const quality = calculateSleepQuality(session);
      expect(quality).toBeGreaterThanOrEqual(0);
      expect(quality).toBeLessThanOrEqual(100);
      expect(quality).toBeLessThanOrEqual(70); // Not great quality for short sleep
    });

    it('should return value between 0 and 100', () => {
      const session = createMockSession({
        duration: 1000, // Extreme duration
        phases: { awake: 100, light: 400, deep: 300, rem: 200 },
        interruptions: 20, // Many interruptions
      });

      const quality = calculateSleepQuality(session);
      expect(quality).toBeGreaterThanOrEqual(0);
      expect(quality).toBeLessThanOrEqual(100);
    });
  });

  describe('generateSleepPhases', () => {
    it('should generate phases for typical 8-hour sleep', () => {
      const phases = generateSleepPhases(480); // 8 hours = 480 minutes

      expect(phases.awake).toBeGreaterThanOrEqual(0);
      expect(phases.light).toBeGreaterThan(0);
      expect(phases.deep).toBeGreaterThan(0);
      expect(phases.rem).toBeGreaterThan(0);
    });

    it('should generate phases for short sleep', () => {
      const phases = generateSleepPhases(90); // 1 cycle

      expect(phases.awake).toBeGreaterThanOrEqual(0);
      expect(phases.light).toBeGreaterThan(0);
      expect(phases.deep).toBeGreaterThan(0);
      expect(phases.rem).toBeGreaterThan(0);
    });

    it('should handle zero duration', () => {
      const phases = generateSleepPhases(0);

      expect(phases.awake).toBe(0);
      expect(phases.light).toBe(0);
      expect(phases.deep).toBe(0);
      expect(phases.rem).toBe(0);
    });

    it('should generate more deep sleep in first cycle', () => {
      const phases = generateSleepPhases(90); // Exactly 1 cycle

      // First cycle should have more deep sleep (50) than REM (15)
      expect(phases.deep).toBeGreaterThan(phases.rem);
    });

    it('should scale with duration', () => {
      const shortPhases = generateSleepPhases(180); // 2 hours
      const longPhases = generateSleepPhases(480); // 8 hours

      const shortTotal = shortPhases.light + shortPhases.deep + shortPhases.rem;
      const longTotal = longPhases.light + longPhases.deep + longPhases.rem;

      expect(longTotal).toBeGreaterThan(shortTotal);
    });

    it('should have reasonable phase distribution', () => {
      const phases = generateSleepPhases(480);
      const total = phases.light + phases.deep + phases.rem;

      // All phases should exist
      expect(phases.light).toBeGreaterThan(0);
      expect(phases.deep).toBeGreaterThan(0);
      expect(phases.rem).toBeGreaterThan(0);

      // Total should be reasonable
      expect(total).toBeGreaterThan(0);
      expect(total).toBeLessThanOrEqual(480);

      // All phases should be reasonable percentages
      expect(phases.light / total).toBeGreaterThan(0.15);
      expect(phases.deep / total).toBeGreaterThan(0.15);
      expect(phases.rem / total).toBeGreaterThan(0.10);
    });
  });

  describe('calculateSleepDebt', () => {
    const createSession = (duration: number, daysAgo: number = 0): SleepSession => {
      const endTime = new Date();
      endTime.setDate(endTime.getDate() - daysAgo);

      return {
        id: `session-${daysAgo}`,
        startTime: new Date(endTime.getTime() - duration * 60 * 1000),
        endTime,
        duration,
        quality: 80,
        phases: { awake: 10, light: 200, deep: 150, rem: 120 },
        interruptions: 2,
        notes: '',
        soundRecordings: [],
        environment: { noise: 20 },
      };
    };

    it('should calculate zero debt when meeting sleep goal', () => {
      const sessions = [
        createSession(480, 0), // 8 hours
        createSession(480, 1),
        createSession(480, 2),
      ];

      const debt = calculateSleepDebt(sessions, 480);
      expect(debt).toBe(0);
    });

    it('should calculate positive debt when sleeping less than goal', () => {
      const sessions = [
        createSession(360, 0), // 6 hours (2 hours short)
        createSession(360, 1),
        createSession(360, 2),
      ];

      const debt = calculateSleepDebt(sessions, 480); // Goal: 8 hours
      expect(debt).toBeGreaterThan(0);
      expect(debt).toBe(360); // 120 minutes * 3 days
    });

    it('should calculate negative debt when sleeping more than goal', () => {
      const sessions = [
        createSession(600, 0), // 10 hours (2 hours extra)
        createSession(600, 1),
      ];

      const debt = calculateSleepDebt(sessions, 480); // Goal: 8 hours
      expect(debt).toBeLessThan(0);
      expect(debt).toBe(-240); // -120 minutes * 2 days
    });

    it('should only consider last 7 days', () => {
      const sessions = [
        ...Array(10).fill(0).map((_, i) => createSession(360, i)),
      ];

      const debt = calculateSleepDebt(sessions, 480);
      // Should only count 7 sessions (120 * 7 = 840), but capped at 600
      expect(debt).toBe(600); // Capped at maximum debt
    });

    it('should cap debt at 600 minutes', () => {
      const sessions = Array(10).fill(0).map((_, i) => createSession(180, i)); // 3 hours each

      const debt = calculateSleepDebt(sessions, 480);
      expect(debt).toBe(600); // Capped at 600
      expect(debt).not.toBeGreaterThan(600);
    });

    it('should cap surplus at -600 minutes', () => {
      const sessions = Array(10).fill(0).map((_, i) => createSession(720, i)); // 12 hours each

      const debt = calculateSleepDebt(sessions, 480);
      expect(debt).toBe(-600); // Capped at -600
      expect(debt).not.toBeLessThan(-600);
    });

    it('should filter out sessions without endTime', () => {
      const sessions: SleepSession[] = [
        createSession(480, 0),
        { ...createSession(480, 1), endTime: null }, // Active session
        createSession(360, 2),
      ];

      const debt = calculateSleepDebt(sessions, 480);
      // Should only count 2 completed sessions
      expect(debt).toBe(120); // Only one session is 120 minutes short
    });

    it('should handle empty sessions array', () => {
      const debt = calculateSleepDebt([], 480);
      expect(debt).toBe(0);
    });
  });

  describe('formatDuration', () => {
    it('should format hours and minutes', () => {
      expect(formatDuration(125)).toBe('2h 5m');
    });

    it('should format whole hours', () => {
      expect(formatDuration(120)).toBe('2h');
    });

    it('should format only minutes', () => {
      expect(formatDuration(45)).toBe('45m');
    });

    it('should handle zero duration', () => {
      expect(formatDuration(0)).toBe('0m');
    });

    it('should format large durations', () => {
      expect(formatDuration(1440)).toBe('24h'); // 1 day
    });

    it('should format typical sleep duration', () => {
      expect(formatDuration(480)).toBe('8h'); // 8 hours
      expect(formatDuration(420)).toBe('7h'); // 7 hours
      expect(formatDuration(495)).toBe('8h 15m'); // 8 hours 15 minutes
    });
  });

  describe('getQualityColor', () => {
    it('should return success color for high quality (>= 80)', () => {
      expect(getQualityColor(100)).toBe('text-success');
      expect(getQualityColor(85)).toBe('text-success');
      expect(getQualityColor(80)).toBe('text-success');
    });

    it('should return warning color for medium quality (60-79)', () => {
      expect(getQualityColor(79)).toBe('text-warning');
      expect(getQualityColor(70)).toBe('text-warning');
      expect(getQualityColor(60)).toBe('text-warning');
    });

    it('should return destructive color for low quality (< 60)', () => {
      expect(getQualityColor(59)).toBe('text-destructive');
      expect(getQualityColor(40)).toBe('text-destructive');
      expect(getQualityColor(0)).toBe('text-destructive');
    });
  });

  describe('getSleepDebtColor', () => {
    it('should return success color for minimal debt (<= 2 hours)', () => {
      expect(getSleepDebtColor(0)).toBe('text-success');
      expect(getSleepDebtColor(60)).toBe('text-success'); // 1 hour
      expect(getSleepDebtColor(120)).toBe('text-success'); // 2 hours
      expect(getSleepDebtColor(-120)).toBe('text-success'); // -2 hours (surplus)
    });

    it('should return warning color for moderate debt (2-5 hours)', () => {
      expect(getSleepDebtColor(150)).toBe('text-warning'); // 2.5 hours
      expect(getSleepDebtColor(240)).toBe('text-warning'); // 4 hours
      expect(getSleepDebtColor(300)).toBe('text-warning'); // 5 hours
    });

    it('should return orange color for high debt (5-8 hours)', () => {
      expect(getSleepDebtColor(330)).toBe('text-orange-500'); // 5.5 hours
      expect(getSleepDebtColor(420)).toBe('text-orange-500'); // 7 hours
      expect(getSleepDebtColor(480)).toBe('text-orange-500'); // 8 hours
    });

    it('should return destructive color for extreme debt (> 8 hours)', () => {
      expect(getSleepDebtColor(500)).toBe('text-destructive'); // 8.3 hours
      expect(getSleepDebtColor(600)).toBe('text-destructive'); // 10 hours
    });

    it('should handle negative debt (surplus) with same logic', () => {
      expect(getSleepDebtColor(-600)).toBe('text-destructive');
      expect(getSleepDebtColor(-500)).toBe('text-destructive');
    });
  });
});
