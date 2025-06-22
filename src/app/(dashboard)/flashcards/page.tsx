import { Metadata } from 'next';
import Header from '@/component/ui/Header';
import Card from '@/component/ui/Card';
import Button from '@/component/ui/Button';
import { BookOpen01Icon, Target01Icon } from 'hugeicons-react';

export const metadata: Metadata = {
  title: 'Flashcards | Stendhal',
  description: 'Study with interactive flashcards',
};

export default function FlashcardsPage() {
  const flashcardSets = [
    {
      id: '1',
      title: 'JavaScript Fundamentals',
      description: 'Core concepts and syntax',
      cardCount: 25,
      lastStudied: '2 hours ago',
      progress: 80,
    },
    {
      id: '2',
      title: 'React Hooks',
      description: 'Understanding React hooks',
      cardCount: 15,
      lastStudied: '1 day ago',
      progress: 60,
    },
    {
      id: '3',
      title: 'CSS Grid & Flexbox',
      description: 'Modern CSS layout techniques',
      cardCount: 20,
      lastStudied: '3 days ago',
      progress: 40,
    },
  ];

  return (
    <div className="space-y-8">
      <Header 
        title="Flashcards" 
        description="Study with interactive flashcards"
        children={
          <div className="flex gap-2">
            <Button variant="outline">
              <BookOpen01Icon className="w-4 h-4 mr-2" />
              Browse Sets
            </Button>
            <Button>
              <Target01Icon className="w-4 h-4 mr-2" />
              Start Session
            </Button>
          </div>
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flashcardSets.map((set) => (
          <Card key={set.id} variant="default" size="md" className="hover:shadow-md transition-shadow cursor-pointer">
            <Card.Header>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Card.Title>{set.title}</Card.Title>
                  <Card.Description>{set.description}</Card.Description>
                </div>
                <BookOpen01Icon className="w-5 h-5 text-accent ml-2" />
              </div>
            </Card.Header>
            <Card.Content>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Cards:</span>
                  <span className="font-medium">{set.cardCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Progress:</span>
                  <span className="font-medium">{set.progress}%</span>
                </div>
                <div className="w-full bg-background-muted rounded-full h-2">
                  <div 
                    className="bg-accent h-2 rounded-full transition-all duration-300"
                    style={{ width: `${set.progress}%` }}
                  />
                </div>
              </div>
            </Card.Content>
            <Card.Footer>
              <p className="text-xs text-foreground-muted">
                Last studied {set.lastStudied}
              </p>
            </Card.Footer>
          </Card>
        ))}
      </div>
    </div>
  );
}