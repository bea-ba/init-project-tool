import { SleepSession, Alarm, SleepNote, UserSettings } from '@/types/sleep';
import { SerializedSleepSession, SerializedSleepNote, SerializedUserSettings } from '@/types/serialized';
import { encryptData, decryptData } from './encryption';
import {
  validateSleepSession,
  validateAlarm,
  validateSleepNote,
  validateUserSettings
} from './validation';
import { toast } from 'sonner';

const STORAGE_KEYS = {
  SLEEP_SESSIONS: 'dreamwell_sessions',
  ALARMS: 'dreamwell_alarms',
  NOTES: 'dreamwell_notes',
  SETTINGS: 'dreamwell_settings',
};

// Enable encryption for sensitive data
const ENCRYPT_SENSITIVE_DATA = true;

/**
 * Safely parse JSON with error handling
 */
const safeJSONParse = <T>(data: string, fallback: T): T => {
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('JSON parse error:', error);
    toast.error('Failed to load data. Using default values.');
    return fallback;
  }
};

/**
 * Safely get data from localStorage with decryption and error handling
 */
const safeGetItem = (key: string, shouldDecrypt: boolean = false): string | null => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;

    if (shouldDecrypt && ENCRYPT_SENSITIVE_DATA) {
      return decryptData(data);
    }

    return data;
  } catch (error) {
    console.error(`Error getting item from localStorage (${key}):`, error);
    toast.error('Failed to load data from storage.');
    return null;
  }
};

/**
 * Safely set data to localStorage with encryption and error handling
 */
const safeSetItem = (key: string, value: string, shouldEncrypt: boolean = false): void => {
  try {
    const dataToStore = shouldEncrypt && ENCRYPT_SENSITIVE_DATA
      ? encryptData(value)
      : value;

    localStorage.setItem(key, dataToStore);
  } catch (error) {
    console.error(`Error setting item to localStorage (${key}):`, error);

    // Check if it's a quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      toast.error('Storage quota exceeded. Please clear old data.');
    } else {
      toast.error('Failed to save data to storage.');
    }

    throw error;
  }
};

export const storage = {
  // Sleep Sessions (encrypted)
  getSleepSessions: (): SleepSession[] => {
    const data = safeGetItem(STORAGE_KEYS.SLEEP_SESSIONS, true);
    if (!data) return [];

    const serializedSessions = safeJSONParse<SerializedSleepSession[]>(data, []);

    const validSessions: SleepSession[] = [];
    const invalidSessions: any[] = [];

    serializedSessions.forEach((session, index) => {
      const sessionWithDates = {
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : null,
      };

      const validation = validateSleepSession(sessionWithDates);
      if (validation.success) {
        validSessions.push(sessionWithDates);
      } else {
        invalidSessions.push({ index, session, errors: validation.error.issues });
        console.warn(`Invalid sleep session at index ${index}:`, validation.error.issues);
      }
    });

    if (invalidSessions.length > 0) {
      console.warn(`Filtered out ${invalidSessions.length} invalid sleep sessions`);
      toast.warning(`Some sleep sessions were corrupted and have been removed (${invalidSessions.length} items)`);
    }

    return validSessions;
  },

  saveSleepSession: (session: SleepSession): void => {
    // Validate session data before saving
    const validation = validateSleepSession(session);
    if (!validation.success) {
      const errorMessages = validation.error.issues.map(i => i.message).join(', ');
      toast.error(`Invalid sleep session data: ${errorMessages}`);
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    try {
      const sessions = storage.getSleepSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);

      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }

      safeSetItem(STORAGE_KEYS.SLEEP_SESSIONS, JSON.stringify(sessions), true);
    } catch (error) {
      console.error('Error saving sleep session:', error);
      throw error;
    }
  },

  deleteSleepSession: (id: string): void => {
    try {
      const sessions = storage.getSleepSessions();
      const filtered = sessions.filter(s => s.id !== id);
      safeSetItem(STORAGE_KEYS.SLEEP_SESSIONS, JSON.stringify(filtered), true);
    } catch (error) {
      console.error('Error deleting sleep session:', error);
      throw error;
    }
  },

  // Alarms (encrypted)
  getAlarms: (): Alarm[] => {
    const data = safeGetItem(STORAGE_KEYS.ALARMS, true);
    if (!data) return [];

    const alarms = safeJSONParse<Alarm[]>(data, []);
    const validAlarms: Alarm[] = [];
    const invalidAlarms: any[] = [];

    alarms.forEach((alarm, index) => {
      const validation = validateAlarm(alarm);
      if (validation.success) {
        validAlarms.push(alarm);
      } else {
        invalidAlarms.push({ index, alarm, errors: validation.error.issues });
        console.warn(`Invalid alarm at index ${index}:`, validation.error.issues);
      }
    });

    if (invalidAlarms.length > 0) {
      console.warn(`Filtered out ${invalidAlarms.length} invalid alarms`);
      toast.warning(`Some alarms were corrupted and have been removed (${invalidAlarms.length} items)`);
    }

    return validAlarms;
  },

  saveAlarm: (alarm: Alarm): void => {
    // Validate alarm data before saving
    const validation = validateAlarm(alarm);
    if (!validation.success) {
      const errorMessages = validation.error.issues.map(i => i.message).join(', ');
      toast.error(`Invalid alarm data: ${errorMessages}`);
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    try {
      const alarms = storage.getAlarms();
      const existingIndex = alarms.findIndex(a => a.id === alarm.id);

      if (existingIndex >= 0) {
        alarms[existingIndex] = alarm;
      } else {
        alarms.push(alarm);
      }

      safeSetItem(STORAGE_KEYS.ALARMS, JSON.stringify(alarms), true);
    } catch (error) {
      console.error('Error saving alarm:', error);
      throw error;
    }
  },

  deleteAlarm: (id: string): void => {
    try {
      const alarms = storage.getAlarms();
      const filtered = alarms.filter(a => a.id !== id);
      safeSetItem(STORAGE_KEYS.ALARMS, JSON.stringify(filtered), true);
    } catch (error) {
      console.error('Error deleting alarm:', error);
      throw error;
    }
  },

  // Notes (encrypted)
  getNotes: (): SleepNote[] => {
    const data = safeGetItem(STORAGE_KEYS.NOTES, true);
    if (!data) return [];

    const serializedNotes = safeJSONParse<SerializedSleepNote[]>(data, []);
    const validNotes: SleepNote[] = [];
    const invalidNotes: any[] = [];

    serializedNotes.forEach((note, index) => {
      const noteWithDate = {
        ...note,
        date: new Date(note.date),
      };

      const validation = validateSleepNote(noteWithDate);
      if (validation.success) {
        validNotes.push(noteWithDate);
      } else {
        invalidNotes.push({ index, note, errors: validation.error.issues });
        console.warn(`Invalid sleep note at index ${index}:`, validation.error.issues);
      }
    });

    if (invalidNotes.length > 0) {
      console.warn(`Filtered out ${invalidNotes.length} invalid sleep notes`);
      toast.warning(`Some sleep notes were corrupted and have been removed (${invalidNotes.length} items)`);
    }

    return validNotes;
  },

  saveNote: (note: SleepNote): void => {
    // Validate note data before saving
    const validation = validateSleepNote(note);
    if (!validation.success) {
      const errorMessages = validation.error.issues.map(i => i.message).join(', ');
      toast.error(`Invalid sleep note data: ${errorMessages}`);
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    try {
      const notes = storage.getNotes();
      const existingIndex = notes.findIndex(n => n.id === note.id);

      if (existingIndex >= 0) {
        notes[existingIndex] = note;
      } else {
        notes.push(note);
      }

      safeSetItem(STORAGE_KEYS.NOTES, JSON.stringify(notes), true);
    } catch (error) {
      console.error('Error saving note:', error);
      throw error;
    }
  },

  deleteNote: (id: string): void => {
    try {
      const notes = storage.getNotes();
      const filtered = notes.filter(n => n.id !== id);
      safeSetItem(STORAGE_KEYS.NOTES, JSON.stringify(filtered), true);
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },

  // Settings (encrypted)
  getSettings: (): UserSettings => {
    const data = safeGetItem(STORAGE_KEYS.SETTINGS, true);

    if (!data) {
      return {
        sleepGoal: 480, // 8 hours
        idealBedtime: '22:00',
        idealWakeTime: '06:00',
        theme: 'dark',
        notifications: {
          alarms: true,
          bedtimeReminder: true,
          weeklyReport: true,
        },
        premium: false,
        soundRecording: false,
        dataBackup: null,
      };
    }

    const serializedSettings = safeJSONParse<SerializedUserSettings>(data, {
      sleepGoal: 480,
      idealBedtime: '22:00',
      idealWakeTime: '06:00',
      theme: 'dark' as const,
      notifications: {
        alarms: true,
        bedtimeReminder: true,
        weeklyReport: true,
      },
      premium: false,
      soundRecording: false,
      dataBackup: null,
    });

    const settings = {
      ...serializedSettings,
      dataBackup: serializedSettings.dataBackup ? new Date(serializedSettings.dataBackup) : null,
    };

    const validation = validateUserSettings(settings);
    if (!validation.success) {
      console.warn('Invalid settings found in storage:', validation.error.issues);
      toast.warning('Settings were corrupted and have been reset to defaults');
      return {
        sleepGoal: 480, // 8 hours
        idealBedtime: '22:00',
        idealWakeTime: '06:00',
        theme: 'dark',
        notifications: {
          alarms: true,
          bedtimeReminder: true,
          weeklyReport: true,
        },
        premium: false,
        soundRecording: false,
        dataBackup: null,
      };
    }

    return settings;
  },

  saveSettings: (settings: UserSettings): void => {
    // Validate settings data before saving
    const validation = validateUserSettings(settings);
    if (!validation.success) {
      const errorMessages = validation.error.issues.map(i => i.message).join(', ');
      toast.error(`Invalid settings data: ${errorMessages}`);
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    try {
      safeSetItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings), true);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  },
};
