import { Alarm, UserSettings } from '@/types/sleep';
import { toast } from 'sonner';

/**
 * Request notification permission from the user
 * @returns Promise with permission status
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
};

/**
 * Show a browser notification
 * @param title - Notification title
 * @param options - Notification options
 */
export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    toast.info(title, { description: options?.body });
    return;
  }

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options,
      });
    } catch (error) {
      console.error('Failed to show notification:', error);
      toast.info(title, { description: options?.body });
    }
  } else if (Notification.permission !== 'denied') {
    requestNotificationPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(title, {
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          ...options,
        });
      }
    });
  } else {
    // Fallback to toast notification
    toast.info(title, { description: options?.body });
  }
};

/**
 * Check if it's time for bedtime reminder
 * @param settings - User settings
 * @returns true if should show bedtime reminder
 */
export const shouldShowBedtimeReminder = (settings: UserSettings): boolean => {
  if (!settings.notifications.bedtimeReminder) {
    return false;
  }

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Parse ideal bedtime (HH:mm format)
  const [bedtimeHours, bedtimeMinutes] = settings.idealBedtime.split(':').map(Number);

  // Calculate reminder time (30 minutes before bedtime)
  const reminderDate = new Date();
  reminderDate.setHours(bedtimeHours, bedtimeMinutes - 30, 0, 0);

  const reminderTime = `${reminderDate.getHours().toString().padStart(2, '0')}:${reminderDate.getMinutes().toString().padStart(2, '0')}`;

  return currentTime === reminderTime;
};

/**
 * Show bedtime reminder notification
 * @param settings - User settings
 */
export const showBedtimeReminder = (settings: UserSettings): void => {
  showNotification('Time to Wind Down', {
    body: `Your ideal bedtime is ${settings.idealBedtime}. Start preparing for restful sleep!`,
    tag: 'bedtime-reminder',
    requireInteraction: false,
  });
};

/**
 * Check if alarm should trigger now
 * @param alarm - Alarm to check
 * @returns true if alarm should trigger
 */
export const shouldTriggerAlarm = (alarm: Alarm): boolean => {
  if (!alarm.enabled) {
    return false;
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Check if alarm is set for today
  if (!alarm.days[currentDay]) {
    return false;
  }

  // Check if current time matches alarm time
  return currentTime === alarm.time;
};

/**
 * Trigger an alarm notification
 * @param alarm - Alarm to trigger
 */
export const triggerAlarm = (alarm: Alarm): void => {
  // Request persistent notification permission
  requestNotificationPermission().then((permission) => {
    if (permission === 'granted') {
      showNotification(`⏰ ${alarm.label || 'Alarm'}`, {
        body: `Time to wake up! ${alarm.smartWake ? '(Smart wake enabled)' : ''}`,
        tag: `alarm-${alarm.id}`,
        requireInteraction: true,
        vibrate: alarm.vibration ? [200, 100, 200] : undefined,
      });

      // Play alarm sound (if browser supports it)
      playAlarmSound();
    } else {
      // Fallback to toast
      toast('⏰ Alarm!', {
        description: alarm.label || 'Time to wake up!',
        duration: 10000,
      });
    }
  });
};

/**
 * Play alarm sound using HTML5 Audio
 */
const playAlarmSound = (): void => {
  try {
    // Create audio element for alarm sound
    const audio = new Audio();

    // Use a data URI for a simple beep sound (since we don't have audio files yet)
    // This is a simple sine wave tone
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800; // Frequency in Hz
    gainNode.gain.value = 0.3; // Volume

    oscillator.start();

    // Beep pattern: on for 0.5s, off for 0.5s, repeat 3 times
    let beepCount = 0;
    const beepInterval = setInterval(() => {
      if (beepCount >= 3) {
        oscillator.stop();
        clearInterval(beepInterval);
        return;
      }

      if (beepCount % 2 === 0) {
        gainNode.gain.value = 0.3;
      } else {
        gainNode.gain.value = 0;
      }

      beepCount++;
    }, 500);
  } catch (error) {
    console.error('Failed to play alarm sound:', error);
  }
};

/**
 * Initialize notification service
 * Checks for alarms and bedtime reminders every minute
 * @param alarms - List of alarms
 * @param settings - User settings
 * @returns Cleanup function to stop the service
 */
export const initializeNotificationService = (
  getAlarms: () => Alarm[],
  getSettings: () => UserSettings
): (() => void) => {
  // Request permission on initialization
  if (Notification.permission === 'default') {
    requestNotificationPermission();
  }

  // Check every minute for alarms and bedtime reminders
  const checkInterval = setInterval(() => {
    const alarms = getAlarms();
    const settings = getSettings();

    // Check bedtime reminder
    if (shouldShowBedtimeReminder(settings)) {
      showBedtimeReminder(settings);
    }

    // Check alarms
    alarms.forEach((alarm) => {
      if (shouldTriggerAlarm(alarm) && settings.notifications.alarms) {
        triggerAlarm(alarm);
      }
    });
  }, 60000); // Check every minute

  // Also check immediately on initialization
  setTimeout(() => {
    const alarms = getAlarms();
    const settings = getSettings();

    if (shouldShowBedtimeReminder(settings)) {
      showBedtimeReminder(settings);
    }

    alarms.forEach((alarm) => {
      if (shouldTriggerAlarm(alarm) && settings.notifications.alarms) {
        triggerAlarm(alarm);
      }
    });
  }, 1000);

  // Return cleanup function
  return () => {
    clearInterval(checkInterval);
  };
};

/**
 * Show a notification to ask for permission
 */
export const promptForNotificationPermission = (): void => {
  if (!('Notification' in window)) {
    toast.error('Notifications not supported', {
      description: 'Your browser does not support notifications.',
    });
    return;
  }

  if (Notification.permission === 'granted') {
    toast.success('Notifications enabled', {
      description: 'You will receive alarm and bedtime reminders.',
    });
    return;
  }

  if (Notification.permission === 'denied') {
    toast.error('Notifications blocked', {
      description: 'Please enable notifications in your browser settings.',
    });
    return;
  }

  requestNotificationPermission().then((permission) => {
    if (permission === 'granted') {
      toast.success('Notifications enabled', {
        description: 'You will receive alarm and bedtime reminders.',
      });

      // Show test notification
      showNotification('Dreamwell Notifications Enabled', {
        body: 'You will now receive alarm and bedtime reminders.',
      });
    } else {
      toast.error('Notifications denied', {
        description: 'You won\'t receive alarm or bedtime reminders.',
      });
    }
  });
};
