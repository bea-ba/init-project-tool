import { Card } from '@/components/ui/card';
import { getQualityColor } from '@/utils/sleepCalculations';

interface SleepQualityCardProps {
  quality: number;
  size?: 'sm' | 'md' | 'lg';
}

export const SleepQualityCard = ({ quality, size = 'lg' }: SleepQualityCardProps) => {
  const sizeClasses = {
    sm: 'w-20 h-20 text-2xl',
    md: 'w-32 h-32 text-4xl',
    lg: 'w-48 h-48 text-6xl',
  };

  const ringSize = {
    sm: 18,
    md: 28,
    lg: 42,
  };

  const circumference = 2 * Math.PI * ringSize[size];
  const strokeDashoffset = circumference - (quality / 100) * circumference;

  return (
    <Card className="flex items-center justify-center p-6 bg-gradient-to-br from-card to-muted/20">
      <div className="relative">
        <svg className={sizeClasses[size]} viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={ringSize[size]}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted"
          />
          <circle
            cx="50"
            cy="50"
            r={ringSize[size]}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={getQualityColor(quality)}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 50 50)"
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${getQualityColor(quality)}`}>
            {quality}%
          </span>
          <span className="text-xs text-muted-foreground mt-1">Quality</span>
        </div>
      </div>
    </Card>
  );
};
