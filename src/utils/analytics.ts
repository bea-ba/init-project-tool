import { SleepSession, SleepNote } from '@/types/sleep';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';

export interface TrendDataPoint {
  date: string;
  value: number;
  label: string;
}

export interface CorrelationInsight {
  activity: string;
  impact: number; // -100 to +100
  description: string;
  confidence: 'low' | 'medium' | 'high';
}

export interface WeekdayPattern {
  day: string;
  averageQuality: number;
  averageDuration: number;
  count: number;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: 'duration' | 'timing' | 'quality' | 'activities';
}

/**
 * Get sleep sessions for the last N days
 */
export const getSessionsInRange = (
  sessions: SleepSession[],
  days: number
): SleepSession[] => {
  const cutoffDate = subDays(new Date(), days);

  return sessions
    .filter(s => s.endTime && new Date(s.startTime) >= cutoffDate)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
};

/**
 * Generate trend data for sleep quality over time
 */
export const getSleepQualityTrend = (
  sessions: SleepSession[],
  days: number = 30
): TrendDataPoint[] => {
  const recentSessions = getSessionsInRange(sessions, days);

  return recentSessions.map(session => ({
    date: format(new Date(session.startTime), 'MMM d'),
    value: session.quality,
    label: `${session.quality}%`,
  }));
};

/**
 * Generate trend data for sleep duration over time
 */
export const getSleepDurationTrend = (
  sessions: SleepSession[],
  days: number = 30
): TrendDataPoint[] => {
  const recentSessions = getSessionsInRange(sessions, days);

  return recentSessions.map(session => ({
    date: format(new Date(session.startTime), 'MMM d'),
    value: session.duration / 60, // Convert to hours
    label: `${(session.duration / 60).toFixed(1)}h`,
  }));
};

/**
 * Calculate average sleep phases distribution
 */
export const getAveragePhasesDistribution = (
  sessions: SleepSession[]
): { name: string; value: number; percentage: number }[] => {
  if (sessions.length === 0) {
    return [
      { name: 'Light', value: 0, percentage: 0 },
      { name: 'Deep', value: 0, percentage: 0 },
      { name: 'REM', value: 0, percentage: 0 },
      { name: 'Awake', value: 0, percentage: 0 },
    ];
  }

  const totals = sessions.reduce(
    (acc, session) => ({
      light: acc.light + session.phases.light,
      deep: acc.deep + session.phases.deep,
      rem: acc.rem + session.phases.rem,
      awake: acc.awake + session.phases.awake,
    }),
    { light: 0, deep: 0, rem: 0, awake: 0 }
  );

  const total = totals.light + totals.deep + totals.rem + totals.awake;

  return [
    {
      name: 'Light',
      value: Math.round(totals.light / sessions.length),
      percentage: Math.round((totals.light / total) * 100),
    },
    {
      name: 'Deep',
      value: Math.round(totals.deep / sessions.length),
      percentage: Math.round((totals.deep / total) * 100),
    },
    {
      name: 'REM',
      value: Math.round(totals.rem / sessions.length),
      percentage: Math.round((totals.rem / total) * 100),
    },
    {
      name: 'Awake',
      value: Math.round(totals.awake / sessions.length),
      percentage: Math.round((totals.awake / total) * 100),
    },
  ];
};

/**
 * Analyze correlation between activities and sleep quality
 */
export const analyzeActivityCorrelations = (
  sessions: SleepSession[],
  notes: SleepNote[]
): CorrelationInsight[] => {
  const insights: CorrelationInsight[] = [];

  // Match sessions with notes from the same day
  const sessionNotes = sessions
    .filter(s => s.endTime)
    .map(session => {
      const sessionDate = startOfDay(new Date(session.startTime));
      const note = notes.find(n => isSameDay(new Date(n.date), sessionDate));
      return { session, note };
    })
    .filter(sn => sn.note);

  if (sessionNotes.length < 3) {
    return insights; // Not enough data for correlations
  }

  // Analyze caffeine impact
  const withCaffeine = sessionNotes.filter(
    sn => sn.note!.activities.caffeine.length > 0
  );
  const withoutCaffeine = sessionNotes.filter(
    sn => sn.note!.activities.caffeine.length === 0
  );

  if (withCaffeine.length > 0 && withoutCaffeine.length > 0) {
    const avgWithCaffeine =
      withCaffeine.reduce((sum, sn) => sum + sn.session.quality, 0) /
      withCaffeine.length;
    const avgWithoutCaffeine =
      withoutCaffeine.reduce((sum, sn) => sum + sn.session.quality, 0) /
      withoutCaffeine.length;

    const impact = Math.round(avgWithCaffeine - avgWithoutCaffeine);

    if (Math.abs(impact) > 5) {
      insights.push({
        activity: 'Caffeine',
        impact,
        description:
          impact < 0
            ? `Caffeine consumption reduces your sleep quality by ${Math.abs(impact)}%`
            : `Caffeine consumption improves your sleep quality by ${impact}%`,
        confidence: sessionNotes.length > 10 ? 'high' : sessionNotes.length > 5 ? 'medium' : 'low',
      });
    }
  }

  // Analyze exercise impact
  const withExercise = sessionNotes.filter(sn => sn.note!.activities.exercise !== null);
  const withoutExercise = sessionNotes.filter(sn => sn.note!.activities.exercise === null);

  if (withExercise.length > 0 && withoutExercise.length > 0) {
    const avgWithExercise =
      withExercise.reduce((sum, sn) => sum + sn.session.quality, 0) / withExercise.length;
    const avgWithoutExercise =
      withoutExercise.reduce((sum, sn) => sum + sn.session.quality, 0) /
      withoutExercise.length;

    const impact = Math.round(avgWithExercise - avgWithoutExercise);

    if (Math.abs(impact) > 5) {
      insights.push({
        activity: 'Exercise',
        impact,
        description:
          impact > 0
            ? `Exercise improves your sleep quality by ${impact}%`
            : `Exercise reduces your sleep quality by ${Math.abs(impact)}%`,
        confidence: sessionNotes.length > 10 ? 'high' : sessionNotes.length > 5 ? 'medium' : 'low',
      });
    }
  }

  // Analyze stress impact
  const highStress = sessionNotes.filter(sn => sn.note!.activities.stress >= 4);
  const lowStress = sessionNotes.filter(sn => sn.note!.activities.stress <= 2);

  if (highStress.length > 0 && lowStress.length > 0) {
    const avgHighStress =
      highStress.reduce((sum, sn) => sum + sn.session.quality, 0) / highStress.length;
    const avgLowStress =
      lowStress.reduce((sum, sn) => sum + sn.session.quality, 0) / lowStress.length;

    const impact = Math.round(avgHighStress - avgLowStress);

    if (Math.abs(impact) > 5) {
      insights.push({
        activity: 'High Stress',
        impact,
        description:
          impact < 0
            ? `High stress levels reduce your sleep quality by ${Math.abs(impact)}%`
            : `High stress levels improve your sleep quality by ${impact}%`,
        confidence: sessionNotes.length > 10 ? 'high' : sessionNotes.length > 5 ? 'medium' : 'low',
      });
    }
  }

  // Analyze screen time impact
  const highScreenTime = sessionNotes.filter(sn => sn.note!.activities.screenTime > 120);
  const lowScreenTime = sessionNotes.filter(sn => sn.note!.activities.screenTime < 60);

  if (highScreenTime.length > 0 && lowScreenTime.length > 0) {
    const avgHighScreen =
      highScreenTime.reduce((sum, sn) => sum + sn.session.quality, 0) / highScreenTime.length;
    const avgLowScreen =
      lowScreenTime.reduce((sum, sn) => sum + sn.session.quality, 0) / lowScreenTime.length;

    const impact = Math.round(avgHighScreen - avgLowScreen);

    if (Math.abs(impact) > 5) {
      insights.push({
        activity: 'Screen Time',
        impact,
        description:
          impact < 0
            ? `High screen time (>2h) reduces your sleep quality by ${Math.abs(impact)}%`
            : `High screen time improves your sleep quality by ${impact}%`,
        confidence: sessionNotes.length > 10 ? 'high' : sessionNotes.length > 5 ? 'medium' : 'low',
      });
    }
  }

  return insights.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
};

/**
 * Analyze weekday patterns
 */
export const getWeekdayPatterns = (sessions: SleepSession[]): WeekdayPattern[] => {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const patterns = weekdays.map((day, index) => {
    const daySessions = sessions.filter(
      s => s.endTime && new Date(s.startTime).getDay() === index
    );

    if (daySessions.length === 0) {
      return {
        day,
        averageQuality: 0,
        averageDuration: 0,
        count: 0,
      };
    }

    const avgQuality =
      daySessions.reduce((sum, s) => sum + s.quality, 0) / daySessions.length;
    const avgDuration =
      daySessions.reduce((sum, s) => sum + s.duration, 0) / daySessions.length;

    return {
      day,
      averageQuality: Math.round(avgQuality),
      averageDuration: Math.round(avgDuration),
      count: daySessions.length,
    };
  });

  return patterns;
};

/**
 * Generate personalized recommendations
 */
export const generateRecommendations = (
  sessions: SleepSession[],
  notes: SleepNote[],
  goalMinutes: number
): Recommendation[] => {
  const recommendations: Recommendation[] = [];

  if (sessions.length === 0) {
    return recommendations;
  }

  const recentSessions = getSessionsInRange(sessions, 7);

  // Check average duration
  const avgDuration =
    recentSessions.reduce((sum, s) => sum + s.duration, 0) / recentSessions.length;

  if (avgDuration < goalMinutes - 60) {
    recommendations.push({
      title: 'Increase Sleep Duration',
      description: `You're sleeping ${Math.round((goalMinutes - avgDuration) / 60)} hours less than your goal. Try going to bed 30 minutes earlier.`,
      priority: 'high',
      category: 'duration',
    });
  }

  // Check quality
  const avgQuality =
    recentSessions.reduce((sum, s) => sum + s.quality, 0) / recentSessions.length;

  if (avgQuality < 70) {
    recommendations.push({
      title: 'Improve Sleep Quality',
      description: 'Your sleep quality is below optimal. Consider reviewing your bedtime routine and sleep environment.',
      priority: 'high',
      category: 'quality',
    });
  }

  // Check interruptions
  const avgInterruptions =
    recentSessions.reduce((sum, s) => sum + s.interruptions, 0) / recentSessions.length;

  if (avgInterruptions > 5) {
    recommendations.push({
      title: 'Reduce Sleep Interruptions',
      description: `You average ${Math.round(avgInterruptions)} interruptions per night. Try reducing noise and light in your bedroom.`,
      priority: 'medium',
      category: 'quality',
    });
  }

  // Check correlations
  const correlations = analyzeActivityCorrelations(sessions, notes);

  correlations.forEach(insight => {
    if (insight.impact < -10 && insight.confidence !== 'low') {
      if (insight.activity === 'Caffeine') {
        recommendations.push({
          title: 'Reduce Late Caffeine',
          description: 'Caffeine is negatively impacting your sleep. Try avoiding it after 2 PM.',
          priority: 'medium',
          category: 'activities',
        });
      } else if (insight.activity === 'High Stress') {
        recommendations.push({
          title: 'Manage Stress Levels',
          description: 'High stress is affecting your sleep. Consider meditation or relaxation techniques.',
          priority: 'high',
          category: 'activities',
        });
      } else if (insight.activity === 'Screen Time') {
        recommendations.push({
          title: 'Reduce Evening Screen Time',
          description: 'Excessive screen time before bed is hurting your sleep quality. Try a digital curfew 1 hour before bed.',
          priority: 'medium',
          category: 'activities',
        });
      }
    }
  });

  // Check weekday patterns
  const patterns = getWeekdayPatterns(recentSessions);
  const worstDay = patterns
    .filter(p => p.count > 0)
    .sort((a, b) => a.averageQuality - b.averageQuality)[0];

  if (worstDay && worstDay.averageQuality < avgQuality - 10) {
    recommendations.push({
      title: `Improve ${worstDay.day} Sleep`,
      description: `Your sleep quality on ${worstDay.day}s is ${Math.round(avgQuality - worstDay.averageQuality)}% below average. Review what's different on those days.`,
      priority: 'low',
      category: 'timing',
    });
  }

  return recommendations.slice(0, 5); // Return top 5 recommendations
};
