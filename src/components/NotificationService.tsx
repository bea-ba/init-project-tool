import { useEffect } from 'react';
import { useSleep } from '@/contexts/SleepContext';
import { initializeNotificationService } from '@/utils/notifications';
import { storage } from '@/utils/localStorage';

/**
 * NotificationService component
 * Initializes and manages alarm and bedtime notification checks
 */
export const NotificationService = () => {
  const { settings } = useSleep();

  useEffect(() => {
    // Only initialize if notifications are enabled
    if (!settings.notifications.alarms && !settings.notifications.bedtimeReminder) {
      return;
    }

    // Initialize the notification service
    const cleanup = initializeNotificationService(
      () => storage.getAlarms(),
      () => storage.getSettings()
    );

    // Cleanup on unmount
    return cleanup;
  }, [settings.notifications.alarms, settings.notifications.bedtimeReminder]);

  // This component doesn't render anything
  return null;
};
