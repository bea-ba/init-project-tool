import { SleepSession, Alarm, SleepNote, UserSettings } from '@/types/sleep';
import { SerializedSleepSession, SerializedSleepNote, SerializedUserSettings } from '@/types/serialized';
import { encryptData, decryptData } from './encryption';
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

    const sessions = safeJSONParse<SerializedSleepSession[]>(data, []);

    return sessions.map((session) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: session.endTime ? new Date(session.endTime) : null,
    }));
  },

  saveSleepSession: (session: SleepSession): void => {
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

    return safeJSONParse<Alarm[]>(data, []);
  },

  saveAlarm: (alarm: Alarm): void => {
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

    const notes = safeJSONParse<SerializedSleepNote[]>(data, []);

    return notes.map((note) => ({
      ...note,
      date: new Date(note.date),
    }));
  },

  saveNote: (note: SleepNote): void => {
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

    const settings = safeJSONParse<SerializedUserSettings>(data, {
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

    return {
      ...settings,
      dataBackup: settings.dataBackup ? new Date(settings.dataBackup) : null,
    };
  },

  saveSettings: (settings: UserSettings): void => {
    try {
      safeSetItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings), true);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  },
};
