import Card from '@/component/ui/Card';
import { File01Icon, BookOpen01Icon, Target01Icon, ArrowUp01Icon } from 'hugeicons-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down';
}

function StatCard({ title, value, icon, trend, trendDirection }: StatCardProps) {
  return (
    <Card variant="default" size="sm" className="bg-surface">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground-muted">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <div className="flex items-center gap-1">
              <ArrowUp01Icon 
                className={`w-4 h-4 ${
                  trendDirection === 'up' ? 'text-green-500' : 'text-red-500'
                }`} 
              />
              <span className={`text-sm ${
                trendDirection === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {trend}
              </span>
            </div>
          )}
        </div>
        <div className="p-2 rounded-lg bg-accent-muted">
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default function DashboardStats() {
  const stats = [
    {
      title: 'Total Notes',
      value: 42,
      icon: <File01Icon className="w-5 h-5 text-accent" />,
      trend: '+12%',
      trendDirection: 'up' as const,
    },
    {
      title: 'Flashcards',
      value: 156,
      icon: <BookOpen01Icon className="w-5 h-5 text-accent" />,
      trend: '+8%',
      trendDirection: 'up' as const,
    },
    {
      title: 'Study Sessions',
      value: 23,
      icon: <Target01Icon className="w-5 h-5 text-accent" />,
      trend: '+15%',
      trendDirection: 'up' as const,
    },
    {
      title: 'Streak Days',
      value: 7,
      icon: <ArrowUp01Icon className="w-5 h-5 text-accent" />,
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-foreground">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </div>
  );
} 