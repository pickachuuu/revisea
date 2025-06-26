'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/component/ui/Header';
import Card from '@/component/ui/Card';
import Button from '@/component/ui/Button';
import { BookOpen01Icon, Target01Icon, RefreshIcon, File01Icon } from 'hugeicons-react';
import { useFlashcardActions } from '@/hook/useFlashcardActions';
import { FlashcardSet } from '@/lib/database.types';
import ReforgeModal from '@/component/features/modal/ReforgeModal';
import ConfirmDeleteModal from '@/component/features/modal/ConfirmDeleteModal';
import { GeminiResponse } from '@/lib/gemini';
import { createClient } from '@/utils/supabase/client';
import { redirect } from 'next/navigation';

const supabase = createClient();

export default function FlashcardDashboardPage() {
  const router = useRouter();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReforgeModalOpen, setIsReforgeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [existingFlashcards, setExistingFlashcards] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | undefined>(undefined);
  const { getUserFlashcardSets, getSetProgress, getFirstCardInSet, saveGeneratedFlashcards, deleteFlashcardSet, reforgeFlashcards } = useFlashcardActions();

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

  const handleReforgeFlashcards = async (set: FlashcardSet) => {
    setSelectedSet(set);
    
    // Fetch existing flashcards for this set
    try {
      const { data: flashcards, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', set.id);
      
      if (error) {
        console.error('Error fetching existing flashcards:', error);
        setExistingFlashcards([]);
      } else {
        setExistingFlashcards(flashcards || []);
      }
    } catch (error) {
      console.error('Error fetching existing flashcards:', error);
      setExistingFlashcards([]);
    }
    
    setIsReforgeModalOpen(true);
  };

  const handleFlashcardsGenerated = async (geminiResponse: GeminiResponse, action: 'add_more' | 'regenerate') => {
    if (!selectedSet) return;
    
    setSaving(true);
    setSaveSuccess(undefined);
    try {
      // Use the reforge function instead of creating a new set
      await reforgeFlashcards(
        selectedSet.id,
        action,
        geminiResponse.flashcards
      );

      const actionText = action === 'regenerate' ? 'regenerated' : 'added';
      setSaveSuccess(`Successfully ${actionText} ${geminiResponse.flashcards.length} flashcards to the set!`);
      
      // Refresh the flashcard sets
      await loadFlashcardSets();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(undefined), 3000);
      
    } catch (error) {
      console.error('Error reforging flashcards:', error);
      setSaveSuccess('Error reforging flashcards. Please try again.');
      setTimeout(() => setSaveSuccess(undefined), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseReforgeModal = () => {
    setIsReforgeModalOpen(false);
    setSelectedSet(null);
    setExistingFlashcards([]);
  };

  const handleDeleteFlashcardSet = (set: FlashcardSet) => {
    setSelectedSet(set);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSet) return;
    
    try {
      await deleteFlashcardSet(selectedSet.id);
      
      // Remove the set from the local state
      setFlashcardSets(prevSets => prevSets.filter(set => set.id !== selectedSet.id));
      
      // Show success message
      setSaveSuccess('Flashcard set deleted successfully!');
      setTimeout(() => setSaveSuccess(undefined), 3000);
      
    } catch (error) {
      console.error('Error deleting flashcard set:', error);
      setSaveSuccess('Error deleting flashcard set. Please try again.');
      setTimeout(() => setSaveSuccess(undefined), 3000);
    }
  };

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
    <>
    <div className="space-y-8">
      <Header 
        title="Flashcards" 
        description="Study with interactive flashcards"
        children={
          <div className="flex gap-2">
            <Button
             onClick={()=>{redirect('/notes')}}
            >
              <File01Icon className="w-4 h-4 mr-2" />
              Forge from notes
            </Button>
          </div>
        }
      />
      
      {/* Success/Error Message */}
      {saveSuccess && (
        <div className={`p-4 rounded-md border ${
          saveSuccess.includes('Error') 
            ? 'bg-red-50 border-red-200 text-red-600' 
            : 'bg-green-50 border-green-200 text-green-600'
        }`}>
          <p className="text-sm">{saveSuccess}</p>
        </div>
      )}
      
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
                <File01Icon className="w-4 h-4 mr-2" />
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
                    <div>
                      <p className="text-xs text-foreground-muted">
                        Updated {lastStudied}
                      </p>
                    </div>
                    
                    <div className='flex gap-1  '>
                    <Button
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReforgeFlashcards(set);
                      }}
                    >
                      <RefreshIcon className="w-4 h-4 mr-1" />
                      Reforge
                    </Button>

                    <Button
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFlashcardSet(set);
                      }}
                    >
                      <Target01Icon className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                    </div>
                  </div>
                </Card.Footer>
              </Card>
            );
          })}
        </div>
      )}
    </div>

    <ReforgeModal
        isOpen={isReforgeModalOpen}
        onClose={handleCloseReforgeModal}
        noteContent={selectedSet?.description || ''}  
        existingFlashcards={existingFlashcards}
        onFlashcardsGenerated={handleFlashcardsGenerated}
        saving={saving}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Flashcard Set"
        description="Are you sure you want to delete this flashcard set? This action cannot be undone."
        itemName={selectedSet?.title || 'Untitled Set'}
        itemType="flashcard set"
      />
    </>
  );
}