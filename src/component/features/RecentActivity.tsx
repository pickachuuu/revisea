import Card from '@/component/ui/Card';
import { File01Icon, BookOpen01Icon, Clock01Icon } from 'hugeicons-react';

interface ActivityItem {
  id: string;
  type: 'note' | 'flashcard' | 'session';
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
}

function ActivityItem({ type, title, description, time, icon }: ActivityItem) {
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

export default function RecentActivity() {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'note',
      title: 'JavaScript Fundamentals',
      description: 'Updated notes on ES6 features',
      time: '2 hours ago',
      icon: <File01Icon className="w-4 h-4" />,
    },
    {
      id: '2',
      type: 'flashcard',
      title: 'React Hooks',
      description: 'Created 15 new flashcards',
      time: '4 hours ago',
      icon: <BookOpen01Icon className="w-4 h-4" />,
    },
    {
      id: '3',
      type: 'session',
      title: 'Math Practice',
      description: 'Completed 30-minute study session',
      time: '6 hours ago',
      icon: <Clock01Icon className="w-4 h-4" />,
    },
    {
      id: '4',
      type: 'note',
      title: 'CSS Grid Layout',
      description: 'Added new section on responsive design',
      time: '1 day ago',
      icon: <File01Icon className="w-4 h-4" />,
    },
  ];

  return (
    <Card variant="default" size="md" className="bg-surface">
      <Card.Header>
        <Card.Title>Recent Activity</Card.Title>
        <Card.Description>Your latest learning activities</Card.Description>
      </Card.Header>
      <Card.Content className="space-y-2">
        {activities.map((activity) => (
          <ActivityItem key={activity.id} {...activity} />
        ))}
      </Card.Content>
    </Card>
  );
} 