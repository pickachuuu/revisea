import { Metadata } from 'next';
import Header from '@/component/ui/Header';
import Card from '@/component/ui/Card';
import Button from '@/component/ui/Button';
import { File01Icon } from 'hugeicons-react';

export const metadata: Metadata = {
  title: 'Notes | Stendhal',
  description: 'Manage and organize your study notes',
};

export default function NotesPage() {
  const notes = [
    {
      id: '1',
      title: 'JavaScript Fundamentals',
      description: 'Core concepts and ES6 features',
      lastModified: '2 hours ago',
      tags: ['JavaScript', 'Programming'],
    },
    {
      id: '2',
      title: 'React Hooks',
      description: 'Understanding useState, useEffect, and custom hooks',
      lastModified: '4 hours ago',
      tags: ['React', 'Frontend'],
    },
    {
      id: '3',
      title: 'CSS Grid Layout',
      description: 'Modern CSS layout techniques',
      lastModified: '1 day ago',
      tags: ['CSS', 'Layout'],
    },
  ];

  return (
    <div className="space-y-8">
      <Header 
        title="Notes" 
        description="Organize and manage your study notes"
        children={
          <Button>
            <File01Icon className="w-4 h-4 mr-2" />
            New Note
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <Card key={note.id} variant="default" size="md" className="hover:shadow-md transition-shadow cursor-pointer">
            <Card.Header>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Card.Title>{note.title}</Card.Title>
                  <Card.Description>{note.description}</Card.Description>
                </div>
                <File01Icon className="w-5 h-5 text-accent ml-2" />
              </div>
            </Card.Header>
            <Card.Content>
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-accent-muted text-accent rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card.Content>
            <Card.Footer>
              <p className="text-xs text-foreground-muted">
                Modified {note.lastModified}
              </p>
            </Card.Footer>
          </Card>
        ))}
      </div>
    </div>
  );
}