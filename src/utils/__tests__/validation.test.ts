import { describe, it, expect } from 'vitest';
import {
  SleepSessionSchema,
  AlarmSchema,
  SleepNoteSchema,
  UserSettingsSchema,
  validateSleepSession,
  validateAlarm,
  validateSleepNote,
  validateUserSettings,
  sanitizeString,
  sanitizeNoteText,
  sanitizeAlarmLabel,
} from '../validation';

describe('validation schemas', () => {
  describe('SleepSessionSchema', () => {
    it('should validate a correct sleep session', () => {
      const validSession = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        startTime: new Date('2024-01-01T22:00:00'),
        endTime: new Date('2024-01-02T06:00:00'),
        duration: 480,
        quality: 85,
        phases: { awake: 10, light: 200, deep: 150, rem: 120 },
        interruptions: 2,
        notes: 'Slept well',
        soundRecordings: [],
        environment: { noise: 20, temperature: 22 },
      };

      const result = SleepSessionSchema.safeParse(validSession);
      expect(result.success).toBe(true);
    });

    it('should reject session with invalid UUID', () => {
      const invalidSession = {
        id: 'not-a-uuid',
        startTime: new Date(),
        endTime: new Date(),
        duration: 480,
        quality: 85,
        phases: { awake: 10, light: 200, deep: 150, rem: 120 },
        interruptions: 2,
        notes: '',
        soundRecordings: [],
        environment: { noise: 20 },
      };

      const result = SleepSessionSchema.safeParse(invalidSession);
      expect(result.success).toBe(false);
    });

    it('should reject session with quality > 100', () => {
      const invalidSession = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        startTime: new Date(),
        endTime: new Date(),
        duration: 480,
        quality: 150, // Invalid
        phases: { awake: 10, light: 200, deep: 150, rem: 120 },
        interruptions: 2,
        notes: '',
        soundRecordings: [],
        environment: { noise: 20 },
      };

      const result = SleepSessionSchema.safeParse(invalidSession);
      expect(result.success).toBe(false);
    });

    it('should reject session with notes > 1000 characters', () => {
      const invalidSession = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        startTime: new Date(),
        endTime: new Date(),
        duration: 480,
        quality: 85,
        phases: { awake: 10, light: 200, deep: 150, rem: 120 },
        interruptions: 2,
        notes: 'a'.repeat(1001), // Too long
        soundRecordings: [],
        environment: { noise: 20 },
      };

      const result = SleepSessionSchema.safeParse(invalidSession);
      expect(result.success).toBe(false);
    });

    it('should accept null endTime for active sessions', () => {
      const activeSession = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        startTime: new Date(),
        endTime: null,
        duration: 0,
        quality: 0,
        phases: { awake: 0, light: 0, deep: 0, rem: 0 },
        interruptions: 0,
        notes: '',
        soundRecordings: [],
        environment: { noise: 0 },
      };

      const result = SleepSessionSchema.safeParse(activeSession);
      expect(result.success).toBe(true);
    });
  });

  describe('AlarmSchema', () => {
    it('should validate a correct alarm', () => {
      const validAlarm = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        time: '07:30',
        label: 'Morning alarm',
        days: [false, true, true, true, true, true, false],
        enabled: true,
        soundId: 'gentle-wake',
        smartWake: true,
        wakeWindow: 30,
        vibration: true,
        snooze: { duration: 5, maxCount: 3 },
      };

      const result = AlarmSchema.safeParse(validAlarm);
      expect(result.success).toBe(true);
    });

    it('should reject alarm with invalid time format', () => {
      const invalidAlarm = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        time: '25:00', // Invalid hour
        label: 'Test',
        days: [false, true, true, true, true, true, false],
        enabled: true,
        soundId: 'gentle-wake',
        smartWake: true,
        wakeWindow: 30,
        vibration: true,
        snooze: { duration: 5, maxCount: 3 },
      };

      const result = AlarmSchema.safeParse(invalidAlarm);
      expect(result.success).toBe(false);
    });

    it('should reject alarm with label > 100 characters', () => {
      const invalidAlarm = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        time: '07:30',
        label: 'a'.repeat(101), // Too long
        days: [false, true, true, true, true, true, false],
        enabled: true,
        soundId: 'gentle-wake',
        smartWake: true,
        wakeWindow: 30,
        vibration: true,
        snooze: { duration: 5, maxCount: 3 },
      };

      const result = AlarmSchema.safeParse(invalidAlarm);
      expect(result.success).toBe(false);
    });

    it('should reject alarm with wrong days array length', () => {
      const invalidAlarm = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        time: '07:30',
        label: 'Test',
        days: [true, true, true], // Only 3 days instead of 7
        enabled: true,
        soundId: 'gentle-wake',
        smartWake: true,
        wakeWindow: 30,
        vibration: true,
        snooze: { duration: 5, maxCount: 3 },
      };

      const result = AlarmSchema.safeParse(invalidAlarm);
      expect(result.success).toBe(false);
    });

    it('should accept valid time formats', () => {
      const times = ['00:00', '23:59', '7:30', '12:00'];

      times.forEach((time) => {
        const alarm = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          time,
          label: 'Test',
          days: [false, true, true, true, true, true, false],
          enabled: true,
          soundId: 'gentle-wake',
          smartWake: true,
          wakeWindow: 30,
          vibration: true,
          snooze: { duration: 5, maxCount: 3 },
        };

        const result = AlarmSchema.safeParse(alarm);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('SleepNoteSchema', () => {
    it('should validate a correct sleep note', () => {
      const validNote = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        date: new Date(),
        text: 'Felt great after sleep',
        tags: ['good', 'refreshed'],
        activities: {
          exercise: 'morning' as const,
          caffeine: ['coffee'],
          alcohol: false,
          heavyMeal: false,
          stress: 2,
          screenTime: 60,
          nap: false,
        },
        moodBefore: 3,
        moodAfter: 4,
      };

      const result = SleepNoteSchema.safeParse(validNote);
      expect(result.success).toBe(true);
    });

    it('should reject note with empty text', () => {
      const invalidNote = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        date: new Date(),
        text: '', // Empty text
        tags: [],
        activities: {
          exercise: null,
          caffeine: [],
          alcohol: false,
          heavyMeal: false,
          stress: 3,
          screenTime: 0,
          nap: false,
        },
        moodBefore: 3,
        moodAfter: 4,
      };

      const result = SleepNoteSchema.safeParse(invalidNote);
      expect(result.success).toBe(false);
    });

    it('should reject note with > 10 tags', () => {
      const invalidNote = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        date: new Date(),
        text: 'Test',
        tags: Array(11).fill('tag'), // 11 tags
        activities: {
          exercise: null,
          caffeine: [],
          alcohol: false,
          heavyMeal: false,
          stress: 3,
          screenTime: 0,
          nap: false,
        },
        moodBefore: 3,
        moodAfter: 4,
      };

      const result = SleepNoteSchema.safeParse(invalidNote);
      expect(result.success).toBe(false);
    });

    it('should reject note with stress outside 1-5 range', () => {
      const invalidNote = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        date: new Date(),
        text: 'Test',
        tags: [],
        activities: {
          exercise: null,
          caffeine: [],
          alcohol: false,
          heavyMeal: false,
          stress: 6, // Invalid
          screenTime: 0,
          nap: false,
        },
        moodBefore: 3,
        moodAfter: 4,
      };

      const result = SleepNoteSchema.safeParse(invalidNote);
      expect(result.success).toBe(false);
    });
  });

  describe('UserSettingsSchema', () => {
    it('should validate correct user settings', () => {
      const validSettings = {
        sleepGoal: 480,
        idealBedtime: '23:00',
        idealWakeTime: '07:00',
        theme: 'dark' as const,
        notifications: {
          alarms: true,
          bedtimeReminder: true,
          weeklyReport: false,
        },
        premium: false,
        soundRecording: false,
        dataBackup: null,
      };

      const result = UserSettingsSchema.safeParse(validSettings);
      expect(result.success).toBe(true);
    });

    it('should reject settings with sleepGoal < 180 minutes', () => {
      const invalidSettings = {
        sleepGoal: 120, // Too low
        idealBedtime: '23:00',
        idealWakeTime: '07:00',
        theme: 'dark' as const,
        notifications: { alarms: true, bedtimeReminder: true, weeklyReport: false },
        premium: false,
        soundRecording: false,
        dataBackup: null,
      };

      const result = UserSettingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
    });

    it('should accept all theme options', () => {
      const themes = ['dark', 'light', 'auto'] as const;

      themes.forEach((theme) => {
        const settings = {
          sleepGoal: 480,
          idealBedtime: '23:00',
          idealWakeTime: '07:00',
          theme,
          notifications: { alarms: true, bedtimeReminder: true, weeklyReport: false },
          premium: false,
          soundRecording: false,
          dataBackup: null,
        };

        const result = UserSettingsSchema.safeParse(settings);
        expect(result.success).toBe(true);
      });
    });
  });
});

describe('validation helper functions', () => {
  it('validateSleepSession should return success for valid data', () => {
    const validSession = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      startTime: new Date(),
      endTime: new Date(),
      duration: 480,
      quality: 85,
      phases: { awake: 10, light: 200, deep: 150, rem: 120 },
      interruptions: 2,
      notes: '',
      soundRecordings: [],
      environment: { noise: 20 },
    };

    const result = validateSleepSession(validSession);
    expect(result.success).toBe(true);
  });

  it('validateAlarm should return error for invalid data', () => {
    const invalidAlarm = { id: 'not-uuid', time: 'invalid' };

    const result = validateAlarm(invalidAlarm);
    expect(result.success).toBe(false);
  });
});

describe('sanitization functions', () => {
  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      const result = sanitizeString('  hello world  ');
      expect(result).toBe('hello world');
    });

    it('should remove HTML tags', () => {
      const result = sanitizeString('hello <script>alert("xss")</script> world');
      expect(result).toBe('hello scriptalert("xss")/script world');
    });

    it('should limit to maxLength', () => {
      const result = sanitizeString('hello world', 5);
      expect(result).toBe('hello');
    });

    it('should handle empty strings', () => {
      const result = sanitizeString('');
      expect(result).toBe('');
    });

    it('should remove < and > characters', () => {
      const result = sanitizeString('test<>test');
      expect(result).toBe('testtest');
    });

    it('should default to 1000 character limit', () => {
      const longString = 'a'.repeat(2000);
      const result = sanitizeString(longString);
      expect(result.length).toBe(1000);
    });
  });

  describe('sanitizeNoteText', () => {
    it('should sanitize and limit to 1000 characters', () => {
      const longText = 'a'.repeat(2000);
      const result = sanitizeNoteText(longText);
      expect(result.length).toBe(1000);
    });

    it('should remove HTML and trim', () => {
      const result = sanitizeNoteText('  <div>test</div>  ');
      expect(result).toBe('divtest/div');
    });
  });

  describe('sanitizeAlarmLabel', () => {
    it('should sanitize and limit to 100 characters', () => {
      const longLabel = 'a'.repeat(200);
      const result = sanitizeAlarmLabel(longLabel);
      expect(result.length).toBe(100);
    });

    it('should remove HTML and trim', () => {
      const result = sanitizeAlarmLabel('  <span>Morning</span>  ');
      expect(result).toBe('spanMorning/span');
    });
  });
});
