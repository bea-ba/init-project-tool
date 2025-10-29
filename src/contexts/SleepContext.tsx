import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SleepSession, Alarm, SleepNote, UserSettings } from '@/types/sleep';
import { storage } from '@/utils/localStorage';

interface SleepContextType {
  sessions: SleepSession[];
  alarms: Alarm[];
  notes: SleepNote[];
  settings: UserSettings;
  activeSleep: SleepSession | null;
  addSession: (session: SleepSession) => void;
  updateSession: (session: SleepSession) => void;
  deleteSession: (id: string) => void;
  addAlarm: (alarm: Alarm) => void;
  updateAlarm: (alarm: Alarm) => void;
  deleteAlarm: (id: string) => void;
  addNote: (note: SleepNote) => void;
  updateNote: (note: SleepNote) => void;
  deleteNote: (id: string) => void;
  updateSettings: (settings: UserSettings) => void;
  startSleep: (session: SleepSession) => void;
  stopSleep: () => void;
}

const SleepContext = createContext<SleepContextType | undefined>(undefined);

export const SleepProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<SleepSession[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [notes, setNotes] = useState<SleepNote[]>([]);
  const [settings, setSettings] = useState<UserSettings>(() => storage.getSettings());
  const [activeSleep, setActiveSleep] = useState<SleepSession | null>(null);

  useEffect(() => {
    setSessions(storage.getSleepSessions());
    setAlarms(storage.getAlarms());
    setNotes(storage.getNotes());
  }, []);

  useEffect(() => {
    if (settings.theme === 'dark' || (settings.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const addSession = (session: SleepSession) => {
    storage.saveSleepSession(session);
    setSessions(storage.getSleepSessions());
  };

  const updateSession = (session: SleepSession) => {
    storage.saveSleepSession(session);
    setSessions(storage.getSleepSessions());
  };

  const deleteSession = (id: string) => {
    storage.deleteSleepSession(id);
    setSessions(storage.getSleepSessions());
  };

  const addAlarm = (alarm: Alarm) => {
    storage.saveAlarm(alarm);
    setAlarms(storage.getAlarms());
  };

  const updateAlarm = (alarm: Alarm) => {
    storage.saveAlarm(alarm);
    setAlarms(storage.getAlarms());
  };

  const deleteAlarm = (id: string) => {
    storage.deleteAlarm(id);
    setAlarms(storage.getAlarms());
  };

  const addNote = (note: SleepNote) => {
    storage.saveNote(note);
    setNotes(storage.getNotes());
  };

  const updateNote = (note: SleepNote) => {
    storage.saveNote(note);
    setNotes(storage.getNotes());
  };

  const deleteNote = (id: string) => {
    storage.deleteNote(id);
    setNotes(storage.getNotes());
  };

  const updateSettings = (newSettings: UserSettings) => {
    storage.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const startSleep = (session: SleepSession) => {
    setActiveSleep(session);
  };

  const stopSleep = () => {
    setActiveSleep(null);
  };

  return (
    <SleepContext.Provider
      value={{
        sessions,
        alarms,
        notes,
        settings,
        activeSleep,
        addSession,
        updateSession,
        deleteSession,
        addAlarm,
        updateAlarm,
        deleteAlarm,
        addNote,
        updateNote,
        deleteNote,
        updateSettings,
        startSleep,
        stopSleep,
      }}
    >
      {children}
    </SleepContext.Provider>
  );
};

export const useSleep = () => {
  const context = useContext(SleepContext);
  if (context === undefined) {
    throw new Error('useSleep must be used within a SleepProvider');
  }
  return context;
};
