import { SleepSession, Alarm, SleepNote, UserSettings } from '@/types/sleep';

const STORAGE_KEYS = {
  SLEEP_SESSIONS: 'dreamwell_sessions',
  ALARMS: 'dreamwell_alarms',
  NOTES: 'dreamwell_notes',
  SETTINGS: 'dreamwell_settings',
};

export const storage = {
  // Sleep Sessions
  getSleepSessions: (): SleepSession[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SLEEP_SESSIONS);
    if (!data) return [];
    return JSON.parse(data).map((session: any) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: session.endTime ? new Date(session.endTime) : null,
    }));
  },

  saveSleepSession: (session: SleepSession): void => {
    const sessions = storage.getSleepSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    localStorage.setItem(STORAGE_KEYS.SLEEP_SESSIONS, JSON.stringify(sessions));
  },

  deleteSleepSession: (id: string): void => {
    const sessions = storage.getSleepSessions();
    const filtered = sessions.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SLEEP_SESSIONS, JSON.stringify(filtered));
  },

  // Alarms
  getAlarms: (): Alarm[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ALARMS);
    return data ? JSON.parse(data) : [];
  },

  saveAlarm: (alarm: Alarm): void => {
    const alarms = storage.getAlarms();
    const existingIndex = alarms.findIndex(a => a.id === alarm.id);
    if (existingIndex >= 0) {
      alarms[existingIndex] = alarm;
    } else {
      alarms.push(alarm);
    }
    localStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(alarms));
  },

  deleteAlarm: (id: string): void => {
    const alarms = storage.getAlarms();
    const filtered = alarms.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(filtered));
  },

  // Notes
  getNotes: (): SleepNote[] => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!data) return [];
    return JSON.parse(data).map((note: any) => ({
      ...note,
      date: new Date(note.date),
    }));
  },

  saveNote: (note: SleepNote): void => {
    const notes = storage.getNotes();
    const existingIndex = notes.findIndex(n => n.id === note.id);
    if (existingIndex >= 0) {
      notes[existingIndex] = note;
    } else {
      notes.push(note);
    }
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  },

  deleteNote: (id: string): void => {
    const notes = storage.getNotes();
    const filtered = notes.filter(n => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(filtered));
  },

  // Settings
  getSettings: (): UserSettings => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
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
    const settings = JSON.parse(data);
    return {
      ...settings,
      dataBackup: settings.dataBackup ? new Date(settings.dataBackup) : null,
    };
  },

  saveSettings: (settings: UserSettings): void => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },
};
