import { Card } from '@/components/ui/card';
import { getSleepDebtColor, formatDuration } from '@/utils/sleepCalculations';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface SleepDebtIndicatorProps {
  debtMinutes: number;
}

export const SleepDebtIndicator = ({ debtMinutes }: SleepDebtIndicatorProps) => {
  const isDebt = debtMinutes < 0;
  const absMinutes = Math.abs(debtMinutes);

  return (
    <Card className="p-4 bg-gradient-to-br from-card to-muted/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Sleep Debt</p>
          <p className={`text-2xl font-bold ${getSleepDebtColor(debtMinutes)}`}>
            {isDebt ? '-' : '+'}{formatDuration(absMinutes)}
          </p>
        </div>
        <div className={`p-3 rounded-full ${isDebt ? 'bg-destructive/10' : 'bg-success/10'}`}>
          {isDebt ? (
            <TrendingDown className="w-6 h-6 text-destructive" />
          ) : (
            <TrendingUp className="w-6 h-6 text-success" />
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {isDebt 
          ? 'You owe yourself some rest' 
          : 'Great job! You\'re ahead on sleep'}
      </p>
    </Card>
  );
};
