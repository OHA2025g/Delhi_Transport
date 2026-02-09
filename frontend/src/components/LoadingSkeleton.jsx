import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const KPICardSkeleton = () => {
  return (
    <Card className="kpi-card-enhanced">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="skeleton h-4 w-24 mb-3"></div>
            <div className="skeleton h-8 w-32 mb-2"></div>
          </div>
          <div className="skeleton w-10 h-10 rounded-lg"></div>
        </div>
        <div className="skeleton h-4 w-20 mt-3"></div>
      </CardContent>
    </Card>
  );
};

export const ChartSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <div className="skeleton h-6 w-48"></div>
      </CardHeader>
      <CardContent>
        <div className="skeleton h-80 w-full"></div>
      </CardContent>
    </Card>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex gap-4">
            {Array.from({ length: cols }).map((_, i) => (
              <div key={i} className="skeleton h-4 flex-1"></div>
            ))}
          </div>
          {/* Rows */}
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <div key={rowIdx} className="flex gap-4">
              {Array.from({ length: cols }).map((_, colIdx) => (
                <div key={colIdx} className="skeleton h-4 flex-1"></div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="skeleton h-10 w-64 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
};

export default DashboardSkeleton;

