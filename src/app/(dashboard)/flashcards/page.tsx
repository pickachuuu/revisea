'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/component/ui/Header';
import Card from '@/component/ui/Card';
import Button from '@/component/ui/Button';
import { BookOpen01Icon, Target01Icon } from 'hugeicons-react';
import { useFlashcardActions } from '@/hook/useFlashcardActions';
import { FlashcardSet } from '@/lib/database.types';


export default function FlashcardDashboardPage() {
  const router = useRouter();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getUserFlashcardSets, getSetProgress, getFirstCardInSet } = useFlashcardActions();

  const loadFlashcardSets = useCallback(async () => {
    setIsLoading(true);
    try {
      const sets = await getUserFlashcardSets();
      setFlashcardSets(sets);
    } catch (error) {
      console.error('Error loading flashcard sets:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getUserFlashcardSets]);

  useEffect(() => {
    loadFlashcardSets();
  }, [loadFlashcardSets]);

  const handleCardClick = useCallback(async (setId: string) => {
    try {
      const firstCard = await getFirstCardInSet(setId);
      if (firstCard) {
        router.push(`/flashcards/${firstCard.id}`);
      }
    } catch (error) {
      console.error('Error navigating to first card:', error);
    }
  }, [getFirstCardInSet, router]);

  const handleStartSession = useCallback(async (setId: string) => {
    try {
      const firstCard = await getFirstCardInSet(setId);
      if (firstCard) {
        router.push(`/flashcards/${firstCard.id}`);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  }, [getFirstCardInSet, router]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Header 
          title="Flashcards" 
          description="Study with interactive flashcards"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-background-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
              <BookOpen01Icon className="w-4 h-4 mr-2" />
              Create Set
            </Button>
          </div>
        }
      />
      
      {flashcardSets.length === 0 ? (
        <Card>
          <Card.Header>
            <div className="text-center py-8">
              <BookOpen01Icon className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No flashcard sets yet</h3>
              <p className="text-foreground-muted mb-4">
                Create your first flashcard set to start studying
              </p>
              <Button>
                <BookOpen01Icon className="w-4 h-4 mr-2" />
                Create Your First Set
              </Button>
            </div>
          </Card.Header>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcardSets.map((set) => {
            const progress = Math.round((set.mastered_cards / set.total_cards) * 100) || 0;
            const lastStudied = set.updated_at ? new Date(set.updated_at).toLocaleDateString() : 'Never';
            
            return (
              <Card 
                key={set.id} 
                variant="default" 
                size="md" 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleCardClick(set.id)}
              >
                <Card.Header>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Card.Title>{set.title}</Card.Title>
                      <Card.Description>{set.description || 'No description'}</Card.Description>
                    </div>
                    <BookOpen01Icon className="w-5 h-5 text-accent ml-2" />
                  </div>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground-muted">Cards:</span>
                      <span className="font-medium">{set.total_cards}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground-muted">Mastered:</span>
                      <span className="font-medium">{set.mastered_cards}</span>
                    </div>
                    <div className="w-full bg-background-muted rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground-muted">Progress:</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                  </div>
                </Card.Content>
                <Card.Footer>
                  <div className="flex justify-between items-center w-full">
                    <p className="text-xs text-foreground-muted">
                      Updated {lastStudied}
                    </p>
                    <Button 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartSession(set.id);
                      }}
                    >
                      <Target01Icon className="w-4 h-4 mr-1" />
                      Study
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}