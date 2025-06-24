import Card from '@/component/ui/Card';
import { File01Icon, BookOpen01Icon, Target01Icon, ArrowUp01Icon } from 'hugeicons-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down';
}

function StatCardSkeleton() {
  return (
    <Card variant="default" size="sm" className="bg-surface animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-4 w-20 bg-background-muted rounded mb-2"></div>
          <div className="h-8 w-16 bg-background-muted rounded"></div>
        </div>
        <div className="p-2 rounded-lg bg-background-muted w-10 h-10" />
      </div>
    </Card>
  );
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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatCardProps[]>([
    { title: 'Total Notes', value: 0, icon: <File01Icon className="w-5 h-5 text-accent" />, trend: '', trendDirection: 'up' },
    { title: 'Flashcards', value: 0, icon: <BookOpen01Icon className="w-5 h-5 text-accent" />, trend: '', trendDirection: 'up' },
    { title: 'Study Sessions', value: 0, icon: <Target01Icon className="w-5 h-5 text-accent" />, trend: '', trendDirection: 'up' },
    { title: 'Streak Days', value: 0, icon: <ArrowUp01Icon className="w-5 h-5 text-accent" /> },
  ]);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      // Fetch notes count
      const { data: { session } } = await supabase.auth.getSession();
      let userId = session?.user?.id;
      let noteCount = 0;
      let flashcardCount = 0;
      if (userId) {
        const { count: notesCount } = await supabase
          .from('notes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        noteCount = notesCount || 0;
        // Get all flashcard set IDs for this user
        const { data: sets } = await supabase
          .from('flashcard_sets')
          .select('id')
          .eq('user_id', userId);
        const setIds = sets ? sets.map((s: any) => s.id) : [];
        if (setIds.length > 0) {
          const { count: flashcardsCount } = await supabase
            .from('flashcards')
            .select('*', { count: 'exact', head: true })
            .in('set_id', setIds);
          flashcardCount = flashcardsCount || 0;
        } else {
          flashcardCount = 0;
        }
      }
      setStats([
        { title: 'Total Notes', value: noteCount, icon: <File01Icon className="w-5 h-5 text-accent" />, trend: '', trendDirection: 'up' as const },
        { title: 'Flashcards', value: flashcardCount, icon: <BookOpen01Icon className="w-5 h-5 text-accent" />, trend: '', trendDirection: 'up' as const },
        { title: 'Study Sessions', value: 0, icon: <Target01Icon className="w-5 h-5 text-accent" />, trend: '', trendDirection: 'up' as const },
        { title: 'Streak Days', value: 0, icon: <ArrowUp01Icon className="w-5 h-5 text-accent" /> },
      ]);
      setLoading(false);
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-foreground">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((stat, index) => <StatCard key={index} {...stat} />)
        }
      </div>
    </div>
  );
} 