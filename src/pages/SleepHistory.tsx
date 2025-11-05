import { useSleep } from '@/contexts/SleepContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { formatDuration, getQualityColor } from '@/utils/sleepCalculations';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from 'recharts';
import { Calendar, Moon, TrendingUp } from 'lucide-react';

const SleepHistory = () => {
  const { sessions, settings } = useSleep();
  const navigate = useNavigate();

  const completedSessions = sessions
    .filter(s => s.endTime)
    .sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime());

  const chartData = completedSessions.slice(0, 30).reverse().map(s => ({
    date: new Date(s.endTime!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    hours: s.duration / 60,
    quality: s.quality,
  }));

  const avgDuration = completedSessions.length > 0
    ? completedSessions.reduce((sum, s) => sum + s.duration, 0) / completedSessions.length
    : 0;

  const avgQuality = completedSessions.length > 0
    ? completedSessions.reduce((sum, s) => sum + s.quality, 0) / completedSessions.length
    : 0;

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-6">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Sleep History</h1>
          <Button variant="ghost" onClick={() => navigate('/')}>
            Back
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Moon className="w-5 h-5 text-primary" />
              <p className="text-sm text-muted-foreground">Average Duration</p>
            </div>
            <p className="text-3xl font-bold">{formatDuration(avgDuration)}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <p className="text-sm text-muted-foreground">Average Quality</p>
            </div>
            <p className={`text-3xl font-bold ${getQualityColor(avgQuality)}`}>
              {Math.round(avgQuality)}%
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-secondary" />
              <p className="text-sm text-muted-foreground">Total Nights</p>
            </div>
            <p className="text-3xl font-bold">{completedSessions.length}</p>
          </Card>
        </div>

        {/* Duration Chart */}
        {chartData.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Sleep Duration</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}h`, 'Duration']}
                />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Quality Chart */}
        {chartData.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Sleep Quality Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Quality']}
                />
                <Line 
                  type="monotone" 
                  dataKey="quality" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--success))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Recent Sessions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Nights</h2>
          <div className="space-y-4">
            {completedSessions.slice(0, 10).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-semibold">
                    {new Date(session.endTime!).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDuration(session.duration)} • {session.interruptions} interruptions
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${getQualityColor(session.quality)}`}>
                    {session.quality}%
                  </p>
                  <p className="text-xs text-muted-foreground">Quality</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SleepHistory;
