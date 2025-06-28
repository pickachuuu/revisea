import Card from '@/component/ui/Card';
import { File01Icon, BookOpen01Icon, Target01Icon, TickDouble01Icon } from 'hugeicons-react';
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

interface FlashcardSet {
  id: string;
  total_cards: number;
  mastered_cards: number;
  flashcards: Array<{
    id: string;
    status: string;
  }>;
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
    { title: 'Flashcard Sets', value: 0, icon: <Target01Icon className="w-5 h-5 text-accent" />, trend: '', trendDirection: 'up' },
    { title: 'Mastered Cards', value: 0, icon: <span className="w-5 h-5 text-accent text-xl">✓</span> },
  ]);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      let userId = session?.user?.id;
      
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch notes count
        const { count: notesCount } = await supabase
          .from('notes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        // Fetch flashcard sets and their data
        const { data: flashcardSets } = await supabase
          .from('flashcard_sets')
          .select(`
            id,
            total_cards,
            mastered_cards,
            flashcards (
              id,
              status
            )
          `)
          .eq('user_id', userId);

        let totalFlashcardSets = 0;
        let totalFlashcards = 0;
        let totalMasteredCards = 0;
        let fullyMasteredSets = 0;

        if (flashcardSets) {
          totalFlashcardSets = flashcardSets.length;
          
          // Calculate totals and check for fully mastered sets
          flashcardSets.forEach((set: FlashcardSet) => {
            totalFlashcards += set.total_cards || 0;
            totalMasteredCards += set.mastered_cards || 0;
            
            // Check if all cards in this set are mastered
            if (set.flashcards && set.flashcards.length > 0) {
              const allMastered = set.flashcards.every((card) => card.status === 'mastered');
              if (allMastered) {
                fullyMasteredSets++;
              }
            }
          });
        }

        setStats([
          { 
            title: 'Total Notes', 
            value: notesCount || 0, 
            icon: <File01Icon className="w-5 h-5 text-accent" />, 
            trend: '', 
            trendDirection: 'up' as const 
          },
          { 
            title: 'Flashcards', 
            value: totalFlashcards, 
            icon: <BookOpen01Icon className="w-5 h-5 text-accent" />, 
            trend: '', 
            trendDirection: 'up' as const 
          },
          { 
            title: 'Flashcard Sets', 
            value: totalFlashcardSets, 
            icon: <Target01Icon className="w-5 h-5 text-accent" />, 
            trend: fullyMasteredSets > 0 ? `${fullyMasteredSets} completed` : '', 
            trendDirection: 'up' as const 
          },
          { 
            title: 'Mastered Cards', 
            value: totalMasteredCards, 
            icon: <TickDouble01Icon className="w-5 h-5 text-accent" />, 
          },
        ]);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
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