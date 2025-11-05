import { useState, useEffect } from 'react';
import { alarmScheduler, type ActiveAlarm } from '@/utils/alarmScheduler';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bell, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Shows active alarm notifications with snooze and dismiss options
 */
export const AlarmNotificationBar = () => {
  const [activeAlarms, setActiveAlarms] = useState<ActiveAlarm[]>([]);

  useEffect(() => {
    // Check for active alarms every second
    const interval = setInterval(() => {
      const alarms = alarmScheduler.getActiveAlarms();
      setActiveAlarms(alarms);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSnooze = (alarmId: string) => {
    alarmScheduler.snoozeAlarm(alarmId);
  };

  const handleDismiss = (alarmId: string) => {
    alarmScheduler.dismissAlarm(alarmId);
  };

  if (activeAlarms.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <AnimatePresence mode="popLayout">
        {activeAlarms.map((activeAlarm) => {
          const { alarm, snoozeCount, snoozedUntil } = activeAlarm;
          const isSnoozed = !!snoozedUntil && new Date() < snoozedUntil;

          return (
            <motion.div
              key={alarm.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="mb-2"
            >
              <Card className="p-4 bg-primary/10 border-primary shadow-lg animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Bell className="w-6 h-6 text-primary animate-bounce" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">
                        {alarm.label || 'Alarm'}
                      </h3>
                      {alarm.smartWake && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                          Smart Wake
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                      {alarm.time}
                      {isSnoozed && snoozedUntil && (
                        <span className="ml-2 text-warning">
                          Snoozed until {new Date(snoozedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </p>

                    {snoozeCount > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Snoozed {snoozeCount}/{alarm.snooze.maxCount} times
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDismiss(alarm.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Dismiss alarm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => handleDismiss(alarm.id)}
                    variant="default"
                    size="sm"
                    className="flex-1"
                  >
                    Dismiss
                  </Button>

                  {snoozeCount < alarm.snooze.maxCount && (
                    <Button
                      onClick={() => handleSnooze(alarm.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={isSnoozed}
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Snooze ({alarm.snooze.duration}m)
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
