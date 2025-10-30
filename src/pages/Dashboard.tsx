import { useSleep } from '@/contexts/SleepContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SleepQualityCard } from '@/components/sleep/SleepQualityCard';
import { SleepDebtIndicator } from '@/components/sleep/SleepDebtIndicator';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { useOnboarding } from '@/hooks/useOnboarding';
import { PageTransition, StaggerContainer, StaggerItem, FadeIn } from '@/components/ui/page-transition';
import { calculateSleepQuality, calculateSleepDebt, formatDuration } from '@/utils/sleepCalculations';
import { Moon, AlarmClock, Plus, TrendingUp, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { sessions, settings, alarms } = useSleep();
  const navigate = useNavigate();
  const { showOnboarding, completeOnboarding } = useOnboarding();

  const latestSession = sessions.filter(s => s.endTime).sort((a, b) =>
    new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime()
  )[0];

  const quality = latestSession ? calculateSleepQuality(latestSession) : 0;
  const sleepDebt = calculateSleepDebt(sessions, settings.sleepGoal);

  const nextAlarm = alarms
    .filter(a => a.enabled)
    .sort((a, b) => a.time.localeCompare(b.time))[0];

  const last7Days = sessions
    .filter(s => s.endTime)
    .slice(-7)
    .map(s => ({
      date: new Date(s.endTime!).toLocaleDateString('en-US', { weekday: 'short' }),
      hours: s.duration / 60,
    }));

  const hasData = sessions.length > 0;

  return (
    <>
      <WelcomeModal open={showOnboarding} onComplete={completeOnboarding} />

      <PageTransition>
        <div className="min-h-screen bg-background pb-20 md:pb-6">
          <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <FadeIn>
              <div className="mb-8">
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl font-bold font-heading bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2"
                >
                  Dreamwell
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-muted-foreground"
                >
                  {latestSession
                    ? `Last night: ${formatDuration(latestSession.duration)}`
                    : 'Begin your journey to restorative rest'}
                </motion.p>
              </div>
            </FadeIn>

            {/* Empty State for New Users */}
            {!hasData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-12 text-center mb-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.5, duration: 0.6 }}
                  >
                    <Moon className="w-20 h-20 mx-auto mb-6 text-primary opacity-80" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-3">Welcome to Your Sleep Journey</h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Start tracking your sleep today to unlock personalized insights, beautiful analytics, and AI-powered recommendations.
                  </p>
                  <Button
                    size="lg"
                    onClick={() => navigate('/sleep-tracker')}
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                  >
                    <Moon className="mr-2 h-5 w-5" />
                    Track Your First Night
                    <Sparkles className="ml-2 h-4 w-4" />
                  </Button>
                </Card>
              </motion.div>
            )}

            {/* Main Stats */}
            {hasData && (
              <StaggerContainer>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <StaggerItem>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <SleepQualityCard quality={quality} />
                    </motion.div>
                  </StaggerItem>
                  <StaggerItem>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <SleepDebtIndicator debtMinutes={sleepDebt} />
                    </motion.div>
                  </StaggerItem>
                </div>
              </StaggerContainer>
            )}

            {/* Today's Summary */}
            {latestSession && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    Last Night's Summary
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatDuration(latestSession.duration)}
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <p className="text-sm text-muted-foreground">Deep Sleep</p>
                      <p className="text-2xl font-bold text-secondary">
                        {formatDuration(latestSession.phases.deep)}
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <p className="text-sm text-muted-foreground">REM Sleep</p>
                      <p className="text-2xl font-bold text-accent">
                        {formatDuration(latestSession.phases.rem)}
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <p className="text-sm text-muted-foreground">Interruptions</p>
                      <p className="text-2xl font-bold">{latestSession.interruptions}</p>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Weekly Chart */}
            {last7Days.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-4">Last 7 Days</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={last7Days}>
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            )}

            {/* Next Alarm */}
            {nextAlarm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="p-6 mb-8 bg-gradient-to-br from-primary/10 to-secondary/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Next Alarm</p>
                      <p className="text-3xl font-bold">{nextAlarm.time}</p>
                      <p className="text-sm text-muted-foreground mt-1">{nextAlarm.label}</p>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    >
                      <AlarmClock className="w-12 h-12 text-primary" />
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Quick Actions */}
            <StaggerContainer>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StaggerItem>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      onClick={() => navigate('/sleep-tracker')}
                      className="h-20 text-lg w-full"
                    >
                      <Moon className="w-6 h-6 mr-2" />
                      Begin Sleep Tracking
                    </Button>
                  </motion.div>
                </StaggerItem>
                <StaggerItem>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      variant="secondary"
                      onClick={() => navigate('/alarm-setup')}
                      className="h-20 text-lg w-full"
                    >
                      <AlarmClock className="w-6 h-6 mr-2" />
                      Set Alarm
                    </Button>
                  </motion.div>
                </StaggerItem>
                <StaggerItem>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('/sleep-notes')}
                      className="h-20 text-lg w-full"
                    >
                      <Plus className="w-6 h-6 mr-2" />
                      Add Note
                    </Button>
                  </motion.div>
                </StaggerItem>
              </div>
            </StaggerContainer>
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default Dashboard;
