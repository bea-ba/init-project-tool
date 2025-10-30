import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';

interface PhaseData {
  name: string;
  value: number;
  percentage: number;
}

interface PhaseDistributionChartProps {
  data: PhaseData[];
  title: string;
  height?: number;
}

const COLORS = {
  Light: '#60a5fa',
  Deep: '#6366f1',
  REM: '#a78bfa',
  Awake: '#f59e0b',
};

export const PhaseDistributionChart = ({
  data,
  title,
  height = 300,
}: PhaseDistributionChartProps) => {
  if (data.length === 0 || data.every(d => d.value === 0)) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-slate-400">
          No data available yet
        </div>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-slate-200 font-medium">{payload[0].name}</p>
          <p className="text-slate-400 text-sm">
            {payload[0].value} minutes ({payload[0].payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#94a3b8'} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-slate-300">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {data.map((phase) => (
          <div key={phase.name} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[phase.name as keyof typeof COLORS] }}
              />
              <span className="text-sm text-slate-300">{phase.name}</span>
            </div>
            <span className="text-sm font-medium text-white">{phase.value}m</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
