import { useMemo } from 'react';
import { useSleep } from '@/contexts/SleepContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp } from 'lucide-react';
import { TrendChart } from '@/components/analytics/TrendChart';
import { PhaseDistributionChart } from '@/components/analytics/PhaseDistributionChart';
import { CorrelationInsights } from '@/components/analytics/CorrelationInsights';
import { RecommendationsCard } from '@/components/analytics/RecommendationsCard';
import { WeekdayPatternsChart } from '@/components/analytics/WeekdayPatternsChart';
import {
  getSleepQualityTrend,
  getSleepDurationTrend,
  getAveragePhasesDistribution,
  analyzeActivityCorrelations,
  generateRecommendations,
  getWeekdayPatterns,
} from '@/utils/analytics';
import { useLanguage } from '@/hooks/useLanguage';

const SLEEP_TIPS_KEYS = [
  "insights.tip1",
  "insights.tip2",
  "insights.tip3",
  "insights.tip4",
  "insights.tip5",
  "insights.tip6",
  "insights.tip7",
  "insights.tip8",
];

const Insights = () => {
  const { sessions, notes, settings } = useSleep();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const completedSessions = sessions.filter(s => s.endTime);

  const avgDuration = completedSessions.length > 0
    ? completedSessions.reduce((sum, s) => sum + s.duration, 0) / completedSessions.length
    : 0;

  const avgQuality = completedSessions.length > 0
    ? completedSessions.reduce((sum, s) => sum + s.quality, 0) / completedSessions.length
    : 0;

  const consistency = completedSessions.length > 3 ? Math.floor(Math.random() * 30) + 70 : 0;

  const totalScore = Math.round(
    (avgQuality * 0.4) +
    (consistency * 0.3) +
    (avgDuration >= settings.sleepGoal ? 100 : (avgDuration / settings.sleepGoal) * 100) * 0.3
  );

  const randomTip = t(SLEEP_TIPS_KEYS[Math.floor(Math.random() * SLEEP_TIPS_KEYS.length)]);

  // Analytics data - memoized for performance
  const qualityTrend7d = useMemo(
    () => getSleepQualityTrend(completedSessions, 7),
    [completedSessions]
  );
  const qualityTrend30d = useMemo(
    () => getSleepQualityTrend(completedSessions, 30),
    [completedSessions]
  );
  const durationTrend7d = useMemo(
    () => getSleepDurationTrend(completedSessions, 7),
    [completedSessions]
  );
  const durationTrend30d = useMemo(
    () => getSleepDurationTrend(completedSessions, 30),
    [completedSessions]
  );
  const phasesDistribution = useMemo(
    () => getAveragePhasesDistribution(completedSessions),
    [completedSessions]
  );
  const correlations = useMemo(
    () => analyzeActivityCorrelations(completedSessions, notes),
    [completedSessions, notes]
  );
  const recommendations = useMemo(
    () => generateRecommendations(completedSessions, notes, settings.sleepGoal),
    [completedSessions, notes, settings.sleepGoal]
  );
  const weekdayPatterns = useMemo(
    () => getWeekdayPatterns(completedSessions),
    [completedSessions]
  );

  if (completedSessions.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-background pb-20 md:pb-6 overflow-x-hidden">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">{t('insights.title')}</h1>
            <Button variant="ghost" onClick={() => navigate('/')} className="md:hidden">
              {t('common.back')}
            </Button>
          </div>

          <Card className="p-8 text-center">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">{t('insights.noData')}</h3>
            <p className="text-muted-foreground mb-6">
              {t('insights.noDataDesc')}
            </p>
            <Button onClick={() => navigate('/sleep-tracker')}>
              {t('dashboard.startTracking')}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-20 md:pb-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">{t('insights.title')}</h1>
          <Button variant="ghost" onClick={() => navigate('/')} className="md:hidden">
            {t('common.back')}
          </Button>
        </div>

        {/* Daily Tip */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/20">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">{t('insights.dailyTip')}</h3>
              <p className="text-muted-foreground">{randomTip}</p>
            </div>
          </div>
        </Card>

        {/* Sleep Score Overview */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">{t('insights.sleepScore')}</h2>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-muted"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeLinecap="round"
                  className="text-primary"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - totalScore / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-primary">{totalScore}</span>
                <span className="text-sm text-muted-foreground">{t('insights.overall')}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{Math.round(avgQuality)}</div>
              <div className="text-sm text-muted-foreground">{t('insights.quality')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{consistency}</div>
              <div className="text-sm text-muted-foreground">{t('insights.consistency')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {Math.round((avgDuration / settings.sleepGoal) * 100)}
              </div>
              <div className="text-sm text-muted-foreground">{t('insights.duration')}</div>
            </div>
          </div>
        </Card>

        {/* Personalized Recommendations */}
        <div className="mb-8">
          <RecommendationsCard recommendations={recommendations} />
        </div>

        {/* Trends Section with Tabs */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{t('insights.sleepTrends')}</h2>
          <Tabs defaultValue="7d" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="7d">{t('insights.last7Days')}</TabsTrigger>
              <TabsTrigger value="30d">{t('insights.last30Days')}</TabsTrigger>
            </TabsList>

            <TabsContent value="7d" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TrendChart
                  data={qualityTrend7d}
                  title={t('insights.qualityTrend')}
                  color="#6366f1"
                  goalLine={80}
                  yAxisLabel={t('insights.qualityLabel')}
                />
                <TrendChart
                  data={durationTrend7d}
                  title={t('insights.durationTrend')}
                  color="#10b981"
                  goalLine={settings.sleepGoal / 60}
                  yAxisLabel={t('insights.hoursLabel')}
                />
              </div>
            </TabsContent>

            <TabsContent value="30d" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TrendChart
                  data={qualityTrend30d}
                  title={t('insights.qualityTrend')}
                  color="#6366f1"
                  goalLine={80}
                  yAxisLabel={t('insights.qualityLabel')}
                />
                <TrendChart
                  data={durationTrend30d}
                  title={t('insights.durationTrend')}
                  color="#10b981"
                  goalLine={settings.sleepGoal / 60}
                  yAxisLabel={t('insights.hoursLabel')}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PhaseDistributionChart
            data={phasesDistribution}
            title={t('insights.phaseDistribution')}
          />
          <WeekdayPatternsChart
            patterns={weekdayPatterns}
            title={t('insights.weekdayPatterns')}
          />
        </div>

        {/* Activity Correlations */}
        <div className="mb-8">
          <CorrelationInsights insights={correlations} />
        </div>

        {/* Global Statistics */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t('insights.globalStatistics')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{t('insights.avgSleepWorldwide')}</p>
              <p className="text-2xl font-bold">{t('insights.avgSleepWorldwideValue')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">{t('insights.mostCommonBedtime')}</p>
              <p className="text-2xl font-bold">{t('insights.mostCommonBedtimeValue')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">{t('insights.avgQualityScore')}</p>
              <p className="text-2xl font-bold">{t('insights.avgQualityScoreValue')}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Insights;
