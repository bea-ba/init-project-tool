import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Coffee, Dumbbell, Brain, Smartphone } from 'lucide-react';
import { CorrelationInsight } from '@/utils/analytics';

interface CorrelationInsightsProps {
  insights: CorrelationInsight[];
}

const getActivityIcon = (activity: string) => {
  switch (activity) {
    case 'Caffeine':
      return Coffee;
    case 'Exercise':
      return Dumbbell;
    case 'High Stress':
      return Brain;
    case 'Screen Time':
      return Smartphone;
    default:
      return Activity;
  }
};

const getConfidenceBadge = (confidence: string) => {
  const colors = {
    high: 'bg-green-500/10 text-green-500 border-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <Badge variant="outline" className={colors[confidence as keyof typeof colors]}>
      {confidence} confidence
    </Badge>
  );
};

export const CorrelationInsights = ({ insights }: CorrelationInsightsProps) => {
  if (insights.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Activity Impact</h3>
        <div className="text-center py-8 text-slate-400">
          <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">
            Not enough data yet. Keep logging your activities to see how they affect your sleep.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Activity Impact on Sleep</h3>
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = getActivityIcon(insight.activity);
          const isPositive = insight.impact > 0;

          return (
            <div
              key={index}
              className="flex items-start gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors"
            >
              <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <Icon className={`h-5 w-5 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-white">{insight.activity}</h4>
                  {getConfidenceBadge(insight.confidence)}
                </div>

                <p className="text-sm text-slate-300 mb-2">{insight.description}</p>

                <div className="flex items-center gap-2">
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {isPositive ? '+' : ''}
                    {insight.impact}% impact
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
