import Card from '@/component/ui/Card';
import { File01Icon, BookOpen01Icon, Clock01Icon } from 'hugeicons-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

interface ActivityItemProps {
  id: string;
  type: 'note' | 'flashcard' | 'session';
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
}

function ActivityItem({ type, title, description, time, icon }: ActivityItemProps) {
  const getTypeColor = () => {
    switch (type) {
      case 'note':
        return 'text-blue-500';
      case 'flashcard':
        return 'text-green-500';
      case 'session':
        return 'text-purple-500';
      default:
        return 'text-foreground-muted';
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-background-muted rounded-lg transition-colors">
      <div className={`p-2 rounded-lg bg-accent-muted ${getTypeColor()}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate">{title}</h4>
        <p className="text-sm text-foreground-muted truncate">{description}</p>
      </div>
      <div className="flex items-center gap-1 text-xs text-foreground-muted">
        <Clock01Icon className="w-3 h-3" />
        <span>{time}</span>
      </div>
    </div>
  );
}

function ActivityItemSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3 animate-pulse">
      <div className="p-2 rounded-lg bg-background-muted w-8 h-8" />
      <div className="flex-1 min-w-0">
        <div className="h-4 w-32 bg-background-muted rounded mb-2"></div>
        <div className="h-3 w-48 bg-background-muted rounded"></div>
      </div>
      <div className="w-12 h-4 bg-background-muted rounded" />
    </div>
  );
}

export default function RecentActivity() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItemProps[]>([]);

  useEffect(() => {
    async function fetchActivities() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      let userId = session?.user?.id;
      let items: ActivityItemProps[] = [];
      if (userId) {
        // Fetch recent notes
        const { data: notes } = await supabase
          .from('notes')
          .select('id, title, updated_at')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(3);
        if (notes) {
          items = items.concat(notes.map((note: any) => ({
            id: note.id,
            type: 'note',
            title: note.title || 'Untitled Note',
            description: 'Updated note',
            time: note.updated_at ? timeAgo(note.updated_at) : '',
            icon: <File01Icon className="w-4 h-4" />,
          })));
        }
        // Fetch recent flashcards
        const { data: flashcards } = await supabase
          .from('flashcards')
          .select('id, question, updated_at')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(2);
        if (flashcards) {
          items = items.concat(flashcards.map((fc: any) => ({
            id: fc.id,
            type: 'flashcard',
            title: fc.question ? fc.question.slice(0, 32) : 'Flashcard',
            description: 'Updated flashcard',
            time: fc.updated_at ? timeAgo(fc.updated_at) : '',
            icon: <BookOpen01Icon className="w-4 h-4" />,
          })));
        }
      }
      setActivities(items);
      setLoading(false);
    }
    fetchActivities();
  }, []);

  function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <Card variant="default" size="md" className="bg-surface">
      <Card.Header>
        <Card.Title>Recent Activity</Card.Title>
        <Card.Description>Your latest learning activities</Card.Description>
      </Card.Header>
      <Card.Content className="space-y-2">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <ActivityItemSkeleton key={i} />)
          : activities.length > 0
            ? activities.map((activity) => (
                <ActivityItem key={activity.id} {...activity} />
              ))
            : <div className="text-foreground-muted text-sm">No recent activity found.</div>
        }
      </Card.Content>
    </Card>
  );
} 