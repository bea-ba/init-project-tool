export interface SleepSession {
  id: string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // minutes
  quality: number; // 0-100
  phases: {
    awake: number;
    light: number;
    deep: number;
    rem: number;
  };
  interruptions: number;
  notes: string;
  soundRecordings: string[];
  environment: {
    noise: number;
    temperature?: number;
  };
}

export interface Alarm {
  id: string;
  time: string; // HH:mm format
  label: string;
  days: boolean[]; // [sun, mon, tue, wed, thu, fri, sat]
  enabled: boolean;
  soundId: string;
  smartWake: boolean;
  wakeWindow: number; // minutes
  vibration: boolean;
  snooze: {
    duration: number;
    maxCount: number;
  };
}

export interface SleepNote {
  id: string;
  date: Date;
  text: string;
  tags: string[];
  activities: {
    exercise: 'morning' | 'afternoon' | 'evening' | null;
    caffeine: string[];
    alcohol: boolean;
    heavyMeal: boolean;
    stress: number; // 1-5
    screenTime: number; // minutes
    nap: boolean;
  };
  moodBefore: number; // 1-5
  moodAfter: number; // 1-5
}

export interface UserSettings {
  sleepGoal: number; // minutes
  idealBedtime: string;
  idealWakeTime: string;
  theme: 'dark' | 'light' | 'auto';
  notifications: {
    alarms: boolean;
    bedtimeReminder: boolean;
    weeklyReport: boolean;
  };
  premium: boolean;
  soundRecording: boolean;
  dataBackup: Date | null;
}

export interface RelaxationSound {
  id: string;
  name: string;
  category: 'nature' | 'noise' | 'classical' | 'asmr' | 'binaural';
  url: string;
  duration: number;
  premium: boolean;
}
