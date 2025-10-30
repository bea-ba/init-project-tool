import { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/components/ui/card';
import { WeekdayPattern } from '@/utils/analytics';

interface WeekdayPatternsChartProps {
  patterns: WeekdayPattern[];
  title: string;
  height?: number;
}

export const WeekdayPatternsChart = memo(({
  patterns,
  title,
  height = 300,
}: WeekdayPatternsChartProps) => {
  const data = patterns.map(p => ({
    day: p.day.substring(0, 3),
    quality: p.count > 0 ? p.averageQuality : null,
    duration: p.count > 0 ? (p.averageDuration / 60).toFixed(1) : null,
  }));

  if (patterns.every(p => p.count === 0)) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-slate-400">
          No data available yet
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis
            dataKey="day"
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            tickLine={false}
            label={{ value: 'Quality (%)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            tickLine={false}
            label={{ value: 'Duration (h)', angle: 90, position: 'insideRight', style: { fill: '#94a3b8' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            labelStyle={{ color: '#e2e8f0' }}
            itemStyle={{ color: '#e2e8f0' }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => <span className="text-slate-300">{value === 'quality' ? 'Quality' : 'Duration'}</span>}
          />
          <Bar yAxisId="left" dataKey="quality" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="right" dataKey="duration" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-7 gap-2">
        {patterns.map((pattern) => (
          <div key={pattern.day} className="text-center">
            <div className="text-xs text-slate-400 mb-1">{pattern.day.substring(0, 3)}</div>
            {pattern.count > 0 ? (
              <>
                <div className="text-sm font-medium text-white">{pattern.averageQuality}%</div>
                <div className="text-xs text-slate-400">
                  {(pattern.averageDuration / 60).toFixed(1)}h
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-600">-</div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
});
