import { SleepSession, SleepNote, UserSettings } from './sleep';

// Serialized types for localStorage (Dates are strings)
export type SerializedSleepSession = Omit<SleepSession, 'startTime' | 'endTime'> & {
  startTime: string;
  endTime: string | null;
};

export type SerializedSleepNote = Omit<SleepNote, 'date'> & {
  date: string;
};

export type SerializedUserSettings = Omit<UserSettings, 'dataBackup'> & {
  dataBackup: string | null;
};
