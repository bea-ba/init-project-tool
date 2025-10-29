import { useSleep } from '@/contexts/SleepContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, TrendingUp, Award, Clock, Target, Sparkles } from 'lucide-react';

const SLEEP_TIPS = [
  "Keep your bedroom cool (60-67°F) for optimal sleep",
  "Try to go to bed at the same time each night",
  "Avoid caffeine 6 hours before bedtime",
  "Expose yourself to bright light in the morning",
  "Exercise regularly, but not right before bed",
  "Create a relaxing bedtime routine",
  "Limit screen time 1 hour before sleep",
  "Your bedroom should be dark, quiet, and comfortable",
];

const Insights = () => {
  const { sessions, settings } = useSleep();
  const navigate = useNavigate();

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

  const randomTip = SLEEP_TIPS[Math.floor(Math.random() * SLEEP_TIPS.length)];

  const generateInsights = () => {
    const insights = [];
    
    if (avgDuration < settings.sleepGoal - 30) {
      insights.push({
        icon: Clock,
        title: "Increase Sleep Duration",
        description: `You're averaging ${Math.round(avgDuration / 60)}h ${Math.round(avgDuration % 60)}m. Try to add 30 minutes to your sleep.`,
        color: "text-warning"
      });
    }

    if (avgQuality < 70) {
      insights.push({
        icon: Target,
        title: "Improve Sleep Quality",
        description: "Consider your sleep environment. Is it dark, quiet, and cool enough?",
        color: "text-destructive"
      });
    }

    if (consistency < 70) {
      insights.push({
        icon: TrendingUp,
        title: "Build Consistency",
        description: "Try going to bed at the same time every night, even on weekends.",
        color: "text-secondary"
      });
    }

    if (completedSessions.length > 0 && avgQuality >= 80) {
      insights.push({
        icon: Award,
        title: "Excellent Sleep Quality!",
        description: "You're maintaining great sleep habits. Keep it up!",
        color: "text-success"
      });
    }

    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Sleep Insights</h1>
          <Button variant="ghost" onClick={() => navigate('/')} className="md:hidden">
            Back
          </Button>
        </div>

        {/* Daily Tip */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/20">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Daily Sleep Tip</h3>
              <p className="text-muted-foreground">{randomTip}</p>
            </div>
          </div>
        </Card>

        {/* Sleep Score Breakdown */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Your Sleep Score</h2>
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
                <span className="text-sm text-muted-foreground">Overall</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{Math.round(avgQuality)}</div>
              <div className="text-sm text-muted-foreground">Quality</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{consistency}</div>
              <div className="text-sm text-muted-foreground">Consistency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {Math.round((avgDuration / settings.sleepGoal) * 100)}
              </div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </div>
          </div>
        </Card>

        {/* Personal Insights */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold">Personal Insights</h2>
          {insights.length > 0 ? (
            insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${insight.color} bg-opacity-10`}>
                      <Icon className={`w-6 h-6 ${insight.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{insight.title}</h3>
                      <p className="text-muted-foreground text-sm">{insight.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="p-8 text-center">
              <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Track more sleep sessions to get personalized insights
              </p>
              <Button onClick={() => navigate('/sleep-tracker')}>
                Start Tracking
              </Button>
            </Card>
          )}
        </div>

        {/* Global Statistics */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Global Sleep Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Average Sleep Worldwide</p>
              <p className="text-2xl font-bold">7h 15m</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Most Common Bedtime</p>
              <p className="text-2xl font-bold">10:30 PM</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Average Quality Score</p>
              <p className="text-2xl font-bold">72%</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Insights;
