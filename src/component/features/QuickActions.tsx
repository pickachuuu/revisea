import Card from '@/component/ui/Card';
import { BookOpen01Icon, File01Icon, Target01Icon } from 'hugeicons-react';
import Link from 'next/link';

interface ActionButtonProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

function ActionButton({ title, description, icon, href, color }: ActionButtonProps) {
  return (
    <Link href={href}>
      <div className={`p-4 rounded-lg border border-border hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer group ${color}`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-accent-muted group-hover:bg-accent-light transition-colors">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
              {title}
            </h3>
            <p className="text-sm text-foreground-muted mt-1">
              {description}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function QuickActions() {
  const actions = [
    {
      title: 'New Note',
      description: 'Create a new study note',
      icon: <File01Icon className="w-5 h-5 text-accent" />,
      href: '/notes',
      color: 'hover:bg-blue-50 dark:hover:bg-blue-950/20',
    },
    {
      title: 'Study Session',
      description: 'Start a focused study session',
      icon: <Target01Icon className="w-5 h-5 text-accent" />,
      href: '/flashcards',
      color: 'hover:bg-green-50 dark:hover:bg-green-950/20',
    },
    {
      title: 'Review Cards',
      description: 'Review your flashcards',
      icon: <BookOpen01Icon className="w-5 h-5 text-accent" />,
      href: '/flashcards',
      color: 'hover:bg-purple-50 dark:hover:bg-purple-950/20',
    },
    {
      title: 'Browse Notes',
      description: 'View all your notes',
      icon: <File01Icon className="w-5 h-5 text-accent" />,
      href: '/notes',
      color: 'hover:bg-orange-50 dark:hover:bg-orange-950/20',
    },
  ];

  return (
    <Card variant="default" size="md" className="bg-surface">
      <Card.Header>
        <Card.Title>Quick Actions</Card.Title>
        <Card.Description>Quick access to common tasks</Card.Description>
      </Card.Header>
      <Card.Content className="space-y-3">
        {actions.map((action, index) => (
          <ActionButton key={index} {...action} />
        ))}
      </Card.Content>
    </Card>
  );
} 