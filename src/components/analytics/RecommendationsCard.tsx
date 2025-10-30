import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Clock, Target, TrendingUp, Calendar } from 'lucide-react';
import { Recommendation } from '@/utils/analytics';

interface RecommendationsCardProps {
  recommendations: Recommendation[];
}

const getPriorityBadge = (priority: string) => {
  const colors = {
    high: 'bg-red-500/10 text-red-500 border-red-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };

  return (
    <Badge variant="outline" className={colors[priority as keyof typeof colors]}>
      {priority} priority
    </Badge>
  );
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'duration':
      return Clock;
    case 'timing':
      return Calendar;
    case 'quality':
      return Target;
    case 'activities':
      return TrendingUp;
    default:
      return Lightbulb;
  }
};

export const RecommendationsCard = ({ recommendations }: RecommendationsCardProps) => {
  if (recommendations.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Personalized Recommendations</h3>
        <div className="text-center py-8 text-slate-400">
          <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">
            Great job! You're on track with your sleep goals. Keep up the good work!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">Personalized Recommendations</h3>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, index) => {
          const Icon = getCategoryIcon(rec.category);

          return (
            <div
              key={index}
              className="p-4 rounded-lg bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/50"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10">
                  <Icon className="h-5 w-5 text-indigo-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white">{rec.title}</h4>
                    {getPriorityBadge(rec.priority)}
                  </div>

                  <p className="text-sm text-slate-300">{rec.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
