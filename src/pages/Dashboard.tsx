import { useSleep } from '@/contexts/SleepContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SleepQualityCard } from '@/components/sleep/SleepQualityCard';
import { SleepDebtIndicator } from '@/components/sleep/SleepDebtIndicator';
import { calculateSleepQuality, calculateSleepDebt, formatDuration } from '@/utils/sleepCalculations';
import { Moon, AlarmClock, Plus, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const Dashboard = () => {
  const { sessions, settings, alarms } = useSleep();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Sleepzy
          </h1>
          <p className="text-muted-foreground">
            {latestSession 
              ? `Last night: ${formatDuration(latestSession.duration)}`
              : 'Track your first night of sleep'}
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <SleepQualityCard quality={quality} />
          <SleepDebtIndicator debtMinutes={sleepDebt} />
        </div>

        {/* Today's Summary */}
        {latestSession && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Last Night's Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-2xl font-bold text-primary">
                  {formatDuration(latestSession.duration)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deep Sleep</p>
                <p className="text-2xl font-bold text-secondary">
                  {formatDuration(latestSession.phases.deep)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">REM Sleep</p>
                <p className="text-2xl font-bold text-accent">
                  {formatDuration(latestSession.phases.rem)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interruptions</p>
                <p className="text-2xl font-bold">{latestSession.interruptions}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Weekly Chart */}
        {last7Days.length > 0 && (
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
        )}

        {/* Next Alarm */}
        {nextAlarm && (
          <Card className="p-6 mb-8 bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Next Alarm</p>
                <p className="text-3xl font-bold">{nextAlarm.time}</p>
                <p className="text-sm text-muted-foreground mt-1">{nextAlarm.label}</p>
              </div>
              <AlarmClock className="w-12 h-12 text-primary" />
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            size="lg"
            onClick={() => navigate('/sleep-tracker')}
            className="h-20 text-lg"
          >
            <Moon className="w-6 h-6 mr-2" />
            Start Sleep Tracking
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/alarm-setup')}
            className="h-20 text-lg"
          >
            <AlarmClock className="w-6 h-6 mr-2" />
            Set Alarm
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/sleep-notes')}
            className="h-20 text-lg"
          >
            <Plus className="w-6 h-6 mr-2" />
            Add Note
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
