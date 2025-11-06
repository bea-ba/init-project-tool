import { Alarm, SleepSession } from '@/types/sleep';
import { triggerAlarmNotification } from './notifications';
import { retryOperation, CircuitBreaker } from './errorRecovery';
import { toast } from 'sonner';

interface ActiveAlarm {
  alarm: Alarm;
  triggeredAt: Date;
  snoozeCount: number;
  snoozedUntil?: Date;
}

class AlarmScheduler {
  private checkInterval: NodeJS.Timeout | null = null;
  private activeAlarms: Map<string, ActiveAlarm> = new Map();
  private alarms: Alarm[] = [];
  private activeSleep: SleepSession | null = null;
  private onAlarmTrigger?: (alarm: Alarm) => void;
  private notificationCircuitBreaker = new CircuitBreaker(3, 60000);

  /**
   * Initialize the alarm scheduler
   * @param alarms - Array of alarms to monitor
   * @param onTrigger - Callback when alarm triggers
   */
  start(alarms: Alarm[], onTrigger?: (alarm: Alarm) => void) {
    this.alarms = alarms;
    this.onAlarmTrigger = onTrigger;

    // Clear existing interval if any
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check alarms every 30 seconds
    this.checkInterval = setInterval(() => {
      this.checkAlarms();
    }, 30000);

    // Initial check
    this.checkAlarms();
  }

  /**
   * Stop the alarm scheduler
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Update the list of alarms
   */
  updateAlarms(alarms: Alarm[]) {
    this.alarms = alarms;
  }

  /**
   * Update the active sleep session
   * Used for intelligent smart wake timing based on sleep cycles
   */
  updateActiveSleep(activeSleep: SleepSession | null) {
    this.activeSleep = activeSleep;
  }

  /**
   * Check if any alarms should trigger
   */
  private checkAlarms() {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    this.alarms.forEach(alarm => {
      // Skip if alarm is disabled or not scheduled for today
      if (!alarm.enabled || !alarm.days[currentDay]) {
        return;
      }

      // Skip if alarm is already active
      if (this.activeAlarms.has(alarm.id)) {
        const activeAlarm = this.activeAlarms.get(alarm.id)!;

        // Check if snoozed alarm should trigger again
        if (activeAlarm.snoozedUntil && now >= activeAlarm.snoozedUntil) {
          this.triggerAlarm(alarm);
          activeAlarm.snoozedUntil = undefined;
        }
        return;
      }

      // Check if it's time to trigger the alarm
      if (this.shouldTriggerAlarm(alarm, currentTime, now)) {
        this.triggerAlarm(alarm);
        this.activeAlarms.set(alarm.id, {
          alarm,
          triggeredAt: now,
          snoozeCount: 0,
        });
      }
    });

    // Clean up old active alarms (older than 1 hour)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    this.activeAlarms.forEach((activeAlarm, id) => {
      if (activeAlarm.triggeredAt < oneHourAgo) {
        this.activeAlarms.delete(id);
      }
    });
  }

  /**
   * Determine if alarm should trigger based on time and smart wake window
   * Enhanced with sleep cycle detection for optimal wake timing
   */
  private shouldTriggerAlarm(alarm: Alarm, currentTime: string, now: Date): boolean {
    if (!alarm.smartWake) {
      // Simple exact time match (within 1 minute)
      return currentTime === alarm.time;
    }

    // Smart wake with sleep cycle optimization
    const [alarmHour, alarmMinute] = alarm.time.split(':').map(Number);
    const alarmDate = new Date(now);
    alarmDate.setHours(alarmHour, alarmMinute, 0, 0);

    const windowStart = new Date(alarmDate.getTime() - alarm.wakeWindow * 60000);

    // Check if we're within the wake window
    if (now < windowStart || now > alarmDate) {
      return false;
    }

    // If actively tracking sleep, use sleep cycle optimization
    if (this.activeSleep) {
      const optimalWakeTime = this.calculateOptimalWakeTime(alarm, now);

      if (optimalWakeTime) {
        // Trigger if we've reached the optimal wake time (within 30 seconds)
        const timeDiff = Math.abs(now.getTime() - optimalWakeTime.getTime());
        return timeDiff <= 30000;
      }
    }

    // Fallback: trigger at the start of the window (original behavior)
    // Only trigger once when entering the window
    const justEnteredWindow = now.getTime() - windowStart.getTime() < 30000;
    return justEnteredWindow;
  }

  /**
   * Calculate optimal wake time based on 90-minute sleep cycles
   * Finds the closest light sleep period within the wake window
   */
  private calculateOptimalWakeTime(alarm: Alarm, now: Date): Date | null {
    if (!this.activeSleep) {
      return null;
    }

    const sleepStart = new Date(this.activeSleep.startTime);
    const [alarmHour, alarmMinute] = alarm.time.split(':').map(Number);
    const alarmTime = new Date(now);
    alarmTime.setHours(alarmHour, alarmMinute, 0, 0);

    const windowStart = new Date(alarmTime.getTime() - alarm.wakeWindow * 60000);

    // Calculate sleep cycles (90 minutes each)
    const CYCLE_DURATION = 90 * 60 * 1000; // 90 minutes in milliseconds
    const cycleStarts: Date[] = [];

    let currentCycle = new Date(sleepStart);

    // Generate cycle start times up to alarm time
    while (currentCycle <= alarmTime) {
      cycleStarts.push(new Date(currentCycle));
      currentCycle = new Date(currentCycle.getTime() + CYCLE_DURATION);
    }

    // Find cycles that fall within the wake window
    // At the start of each cycle, user is likely in light sleep (easier to wake)
    const cyclesInWindow = cycleStarts.filter(
      cycleStart => cycleStart >= windowStart && cycleStart <= alarmTime
    );

    if (cyclesInWindow.length === 0) {
      return null;
    }

    // Return the first cycle in the window that we haven't passed yet
    const upcomingCycle = cyclesInWindow.find(cycle => cycle >= now);

    if (upcomingCycle) {
      return upcomingCycle;
    }

    // If we've passed all cycles, trigger now
    return now;
  }

  /**
   * Trigger an alarm with error recovery
   */
  private async triggerAlarm(alarm: Alarm) {
    try {
      // Use circuit breaker for notifications to prevent cascading failures
      await this.notificationCircuitBreaker.execute(async () => {
        // Retry notification with exponential backoff
        return retryOperation(async () => {
          triggerAlarmNotification(alarm);
          return true;
        }, { maxRetries: 3, initialDelay: 500 });
      });

      // Call custom trigger callback if provided
      if (this.onAlarmTrigger) {
        try {
          this.onAlarmTrigger(alarm);
        } catch (error) {
          console.error('Custom alarm trigger failed:', error);
          // Don't rethrow - the alarm still triggered
        }
      }

      console.log(`Alarm triggered: ${alarm.label} at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error('Failed to trigger alarm notifications:', error);
      toast.error(`Alarm triggered but notifications failed. Please check your browser settings.`);

      // Still mark alarm as triggered even if notification fails
      this.activeAlarms.set(alarm.id, {
        ...this.activeAlarms.get(alarm.id)!,
        triggeredAt: new Date(),
      });
    }
  }

  /**
   * Snooze an active alarm
   */
  snoozeAlarm(alarmId: string) {
    const activeAlarm = this.activeAlarms.get(alarmId);
    if (!activeAlarm) {
      console.warn(`Cannot snooze alarm ${alarmId}: not active`);
      return;
    }

    // Check if max snooze count reached
    if (activeAlarm.snoozeCount >= activeAlarm.alarm.snooze.maxCount) {
      console.warn(`Cannot snooze alarm ${alarmId}: max snooze count reached`);
      this.dismissAlarm(alarmId);
      return;
    }

    // Calculate snooze time
    const snoozeDuration = activeAlarm.alarm.snooze.duration;
    const snoozedUntil = new Date(Date.now() + snoozeDuration * 60000);

    activeAlarm.snoozeCount++;
    activeAlarm.snoozedUntil = snoozedUntil;

    console.log(`Alarm ${alarmId} snoozed until ${snoozedUntil.toLocaleTimeString()} (${activeAlarm.snoozeCount}/${activeAlarm.alarm.snooze.maxCount})`);
  }

  /**
   * Dismiss an active alarm
   */
  dismissAlarm(alarmId: string) {
    const activeAlarm = this.activeAlarms.get(alarmId);
    if (!activeAlarm) {
      console.warn(`Cannot dismiss alarm ${alarmId}: not active`);
      return;
    }

    this.activeAlarms.delete(alarmId);
    console.log(`Alarm ${alarmId} dismissed`);
  }

  /**
   * Get all currently active alarms
   */
  getActiveAlarms(): ActiveAlarm[] {
    return Array.from(this.activeAlarms.values());
  }

  /**
   * Check if an alarm is currently active
   */
  isAlarmActive(alarmId: string): boolean {
    return this.activeAlarms.has(alarmId);
  }
}

// Export singleton instance
export const alarmScheduler = new AlarmScheduler();

// Export types
export type { ActiveAlarm };
