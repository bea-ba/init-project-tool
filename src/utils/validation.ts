import { z } from 'zod';

// Sleep Session Schema
export const SleepPhasesSchema = z.object({
  awake: z.number().min(0),
  light: z.number().min(0),
  deep: z.number().min(0),
  rem: z.number().min(0),
});

export const SleepSessionSchema = z.object({
  id: z.string().uuid(),
  startTime: z.date(),
  endTime: z.date().nullable(),
  duration: z.number().min(0).max(24 * 60), // Max 24 hours
  quality: z.number().min(0).max(100),
  phases: SleepPhasesSchema,
  interruptions: z.number().min(0).max(100),
  notes: z.string().max(1000), // Limit notes to 1000 characters
  soundRecordings: z.array(z.string()),
  environment: z.object({
    noise: z.number().min(0).max(100),
    temperature: z.number().optional(),
  }),
});

// Alarm Schema
export const AlarmSchema = z.object({
  id: z.string().uuid(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:mm format
  label: z.string().max(100), // Limit label to 100 characters
  days: z.array(z.boolean()).length(7),
  enabled: z.boolean(),
  soundId: z.string(),
  smartWake: z.boolean(),
  wakeWindow: z.number().min(0).max(60), // Max 60 minutes
  vibration: z.boolean(),
  snooze: z.object({
    duration: z.number().min(1).max(30),
    maxCount: z.number().min(1).max(10),
  }),
});

// Sleep Note Schema
export const SleepNoteSchema = z.object({
  id: z.string().uuid(),
  date: z.date(),
  text: z.string().min(1).max(1000), // 1-1000 characters
  tags: z.array(z.string().max(50)).max(10), // Max 10 tags, 50 chars each
  activities: z.object({
    exercise: z.enum(['morning', 'afternoon', 'evening']).nullable(),
    caffeine: z.array(z.string()).max(10),
    alcohol: z.boolean(),
    heavyMeal: z.boolean(),
    stress: z.number().min(1).max(5),
    screenTime: z.number().min(0).max(1440), // Max 24 hours
    nap: z.boolean(),
  }),
  moodBefore: z.number().min(1).max(5),
  moodAfter: z.number().min(1).max(5),
});

// User Settings Schema
export const UserSettingsSchema = z.object({
  sleepGoal: z.number().min(180).max(720), // 3-12 hours in minutes
  idealBedtime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  idealWakeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  theme: z.enum(['dark', 'light', 'auto']),
  notifications: z.object({
    alarms: z.boolean(),
    bedtimeReminder: z.boolean(),
    weeklyReport: z.boolean(),
  }),
  premium: z.boolean(),
  soundRecording: z.boolean(),
  dataBackup: z.date().nullable(),
});

// Export types from schemas
export type ValidatedSleepSession = z.infer<typeof SleepSessionSchema>;
export type ValidatedAlarm = z.infer<typeof AlarmSchema>;
export type ValidatedSleepNote = z.infer<typeof SleepNoteSchema>;
export type ValidatedUserSettings = z.infer<typeof UserSettingsSchema>;

// Validation helper functions
export const validateSleepSession = (data: unknown) => {
  return SleepSessionSchema.safeParse(data);
};

export const validateAlarm = (data: unknown) => {
  return AlarmSchema.safeParse(data);
};

export const validateSleepNote = (data: unknown) => {
  return SleepNoteSchema.safeParse(data);
};

export const validateUserSettings = (data: unknown) => {
  return UserSettingsSchema.safeParse(data);
};

// Input sanitization
export const sanitizeString = (input: string, maxLength: number = 1000): string => {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Remove potential HTML tags
};

export const sanitizeNoteText = (text: string): string => {
  return sanitizeString(text, 1000);
};

export const sanitizeAlarmLabel = (label: string): string => {
  return sanitizeString(label, 100);
};
