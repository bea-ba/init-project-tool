import { Skeleton } from './skeleton';
import { Card } from './card';

export const ChartSkeleton = () => (
  <Card className="p-6">
    <Skeleton className="h-6 w-48 mb-4" />
    <Skeleton className="h-64 w-full" />
  </Card>
);

export const CardSkeleton = () => (
  <Card className="p-6">
    <div className="flex items-start gap-4">
      <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  </Card>
);

export const StatCardSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-8 w-20" />
    <Skeleton className="h-4 w-24" />
  </div>
);

export const ListItemSkeleton = () => (
  <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/50">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  </div>
);
