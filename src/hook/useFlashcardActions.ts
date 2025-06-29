'use client';

import { useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { GeminiFlashcard, GeminiResponse } from '@/lib/gemini';
import { FlashcardSetInsert, FlashcardInsert, GeminiRequestInsert } from '@/lib/database.types';

const supabase = createClient();

export interface SaveFlashcardsOptions {
  noteId?: string;
  noteTitle?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  geminiResponse: GeminiResponse;
}

export function useFlashcardActions() {
  // Convert Gemini difficulty to numeric difficulty level
  const convertDifficultyToLevel = (difficulty: 'easy' | 'medium' | 'hard'): number => {
    switch (difficulty) {
      case 'easy': return 1;
      case 'medium': return 2;
      case 'hard': return 3;
      default: return 2;
    }
  };

  return useMemo(() => {
    // Create a new flashcard set
    const createFlashcardSet = async (noteId: string | null, noteTitle: string): Promise<string> => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const setTitle = noteTitle ? `Flashcards from: ${noteTitle}` : 'Generated Flashcards';
      
      const flashcardSet: FlashcardSetInsert = {
        user_id: session.user.id,
        note_id: noteId,
        title: setTitle,
        description: `AI-generated flashcards from note content`,
        total_cards: 0,
        mastered_cards: 0
      };

      const { data, error } = await supabase
        .from('flashcard_sets')
        .insert(flashcardSet)
        .select('id')
        .single();

      if (error) {
        console.error('Error creating flashcard set:', error);
        throw error;
      }

      return data.id;
    };

    // Save individual flashcards
    const saveFlashcards = async (setId: string, noteId: string | null, flashcards: GeminiFlashcard[]): Promise<void> => {
      const flashcardInserts: FlashcardInsert[] = flashcards.map(flashcard => ({
        set_id: setId,
        note_id: noteId,
        question: flashcard.question,
        answer: flashcard.answer,
        status: 'new',
        difficulty_level: convertDifficultyToLevel(flashcard.difficulty),
        review_count: 0,
        correct_count: 0
      }));

      const { error } = await supabase
        .from('flashcards')
        .insert(flashcardInserts);

      if (error) {
        console.error('Error saving flashcards:', error);
        throw error;
      }
    };

    // Log Gemini API request
    const logGeminiRequest = async (
      noteId: string | null, 
      prompt: string, 
      response: GeminiResponse,
      status: 'completed' | 'failed' = 'completed',
      errorMessage?: string
    ): Promise<void> => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const geminiRequest: GeminiRequestInsert = {
        user_id: session.user.id,
        note_id: noteId,
        request_type: 'flashcard_generation',
        prompt,
        response: JSON.stringify(response.flashcards),
        status,
        tokens_used: response.total_tokens,
        cost_cents: response.cost_cents,
        error_message: errorMessage || null,
        completed_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('gemini_requests')
        .insert(geminiRequest);

      if (error) {
        console.error('Error logging Gemini request:', error);
        // Don't throw here as this is just logging
      }
    };

    // Main function to save generated flashcards
    const saveGeneratedFlashcards = async (options: SaveFlashcardsOptions): Promise<string> => {
      const { noteId, noteTitle, difficulty, geminiResponse } = options;
      
      try {
        // Create flashcard set
        const setId = await createFlashcardSet(noteId || null, noteTitle || 'Untitled Note');
        
        // Save individual flashcards
        await saveFlashcards(setId, noteId || null, geminiResponse.flashcards);
        
        // Log the Gemini request
        const prompt = `Generate ${geminiResponse.flashcards.length} ${difficulty} flashcards from note content`;
        await logGeminiRequest(noteId || null, prompt, geminiResponse);
        
        return setId;
      } catch (error) {
        // Log failed request
        const prompt = `Generate ${geminiResponse.flashcards.length} ${difficulty} flashcards from note content`;
        await logGeminiRequest(noteId || null, prompt, geminiResponse, 'failed', error instanceof Error ? error.message : 'Unknown error');
        
        throw error;
      }
    };

    // Function to handle reforge operations (add to existing or replace entirely)
    const reforgeFlashcards = async (
      existingSetId: string,
      action: 'add_more' | 'regenerate',
      flashcards: GeminiFlashcard[]
    ): Promise<void> => {
      try {
        if (action === 'regenerate') {
          // Delete all existing flashcards in the set
          const { error: deleteError } = await supabase
            .from('flashcards')
            .delete()
            .eq('set_id', existingSetId);

          if (deleteError) {
            console.error('Error deleting existing flashcards:', deleteError);
            throw deleteError;
          }
        }

        // For 'add_more', we only save the new flashcards (they're already filtered)
        // For 'regenerate', we save all the new flashcards
        await saveFlashcards(existingSetId, null, flashcards);

        // Update the set's total_cards count
        const { data: existingCards } = await supabase
          .from('flashcards')
          .select('id')
          .eq('set_id', existingSetId);

        const totalCards = existingCards?.length || 0;

        const { error: updateError } = await supabase
          .from('flashcard_sets')
          .update({ 
            total_cards: totalCards,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSetId);

        if (updateError) {
          console.error('Error updating flashcard set:', updateError);
          throw updateError;
        }

      } catch (error) {
        console.error('Error in reforge operation:', error);
        throw error;
      }
    };

    // Get user's flashcard sets
    const getUserFlashcardSets = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) return [];

      const { data, error } = await supabase
        .from('flashcard_sets')
        .select(`
          *,
          notes (
            id,
            title
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching flashcard sets:', error);
        return [];
      }

      return data || [];
    };

    // Get flashcards for a specific set
    const getFlashcardsBySet = async (setId: string) => {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', setId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching flashcards:', error);
        return [];
      }

      return data || [];
    };

    // Update flashcard status (for study sessions)
    const updateFlashcardStatus = async (
      flashcardId: string, 
      status: 'new' | 'learning' | 'review' | 'mastered',
      wasCorrect?: boolean
    ) => {
      const updateData: any = {
        status,
        last_reviewed: new Date().toISOString()
      };

      if (wasCorrect !== undefined) {
        // First get the current flashcard to get current values
        const { data: currentCard, error: fetchError } = await supabase
          .from('flashcards')
          .select('review_count, correct_count')
          .eq('id', flashcardId)
          .single();

        if (fetchError) {
          console.error('Error fetching current flashcard:', fetchError);
          throw fetchError;
        }

        updateData.review_count = (currentCard?.review_count || 0) + 1;
        if (wasCorrect) {
          updateData.correct_count = (currentCard?.correct_count || 0) + 1;
        }
      }

      const { error } = await supabase
        .from('flashcards')
        .update(updateData)
        .eq('id', flashcardId);

      if (error) {
        console.error('Error updating flashcard status:', error);
        throw error;
      }
    };

    // Get a single flashcard by ID
    const getFlashcardById = async (flashcardId: string) => {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('id', flashcardId)
        .single();

      if (error) {
        console.error('Error fetching flashcard:', error);
        return null;
      }

      return data;
    };

    // Get flashcard set details
    const getFlashcardSetById = async (setId: string) => {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select(`
          *,
          notes (
            id,
            title
          )
        `)
        .eq('id', setId)
        .single();

      if (error) {
        console.error('Error fetching flashcard set:', error);
        return null;
      }

      return data;
    };

    // Mark flashcard as mastered and update set progress
    const markFlashcardAsMastered = async (flashcardId: string) => {
      // First get the current flashcard to get current values
      const { data: currentCard, error: fetchError } = await supabase
        .from('flashcards')
        .select('review_count, correct_count')
        .eq('id', flashcardId)
        .single();

      if (fetchError) {
        console.error('Error fetching current flashcard:', fetchError);
        throw fetchError;
      }

      // Update with incremented values
      const { error } = await supabase
        .from('flashcards')
        .update({
          status: 'mastered',
          last_reviewed: new Date().toISOString(),
          review_count: (currentCard?.review_count || 0) + 1,
          correct_count: (currentCard?.correct_count || 0) + 1
        })
        .eq('id', flashcardId);

      if (error) {
        console.error('Error marking flashcard as mastered:', error);
        throw error;
      }
    };

    // Get progress for a flashcard set
    const getSetProgress = async (setId: string) => {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('total_cards, mastered_cards')
        .eq('id', setId)
        .single();

      if (error) {
        console.error('Error fetching set progress:', error);
        return { total: 0, mastered: 0, percentage: 0 };
      }

      const percentage = data.total_cards > 0 ? Math.round((data.mastered_cards / data.total_cards) * 100) : 0;
      
      return {
        total: data.total_cards,
        mastered: data.mastered_cards,
        percentage
      };
    };

    // Get first card in a set
    const getFirstCardInSet = async (setId: string) => {
      const { data, error } = await supabase
        .from('flashcards')
        .select('id')
        .eq('set_id', setId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching first card:', error);
        return null;
      }

      return data;
    };

    // Get next card in the set (for navigation)
    const getNextCard = async (currentCardId: string, setId: string) => {
      // First get all cards in the set ordered by creation date
      const { data: allCards, error: fetchError } = await supabase
        .from('flashcards')
        .select('id, created_at')
        .eq('set_id', setId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching cards for navigation:', fetchError);
        return null;
      }

      if (!allCards || allCards.length === 0) {
        return null;
      }

      // Find the current card's position
      const currentIndex = allCards.findIndex((card: { id: string; created_at: string }) => card.id === currentCardId);
      
      if (currentIndex === -1) {
        console.error('Current card not found in set');
        return null;
      }

      // Return the next card if it exists
      if (currentIndex < allCards.length - 1) {
        return { id: allCards[currentIndex + 1].id };
      }

      // No next card
      return null;
    };

    // Get previous card in the set (for navigation)
    const getPreviousCard = async (currentCardId: string, setId: string) => {
      // First get all cards in the set ordered by creation date
      const { data: allCards, error: fetchError } = await supabase
        .from('flashcards')
        .select('id, created_at')
        .eq('set_id', setId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching cards for navigation:', fetchError);
        return null;
      }

      if (!allCards || allCards.length === 0) {
        return null;
      }

      // Find the current card's position
      const currentIndex = allCards.findIndex((card: { id: string; created_at: string }) => card.id === currentCardId);
      
      if (currentIndex === -1) {
        console.error('Current card not found in set');
        return null;
      }

      // Return the previous card if it exists
      if (currentIndex > 0) {
        return { id: allCards[currentIndex - 1].id };
      }

      // No previous card
      return null;
    };

    // Delete a flashcard set and all its cards
    const deleteFlashcardSet = async (setId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('flashcard_sets')
        .delete()
        .eq('id', setId)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error deleting flashcard set:', error);
        throw error;
      }
    };

    // Toggle public status of flashcard set
    const togglePublicStatus = async (setId: string, isPublic: boolean) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('flashcard_sets')
        .update({ is_public: isPublic })
        .eq('id', setId)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error updating flashcard set public status:', error);
        throw error;
      }
    };

    // Get public flashcard set by ID (for public viewing)
    const getPublicFlashcardSet = async (setId: string) => {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select(`
          id,
          title,
          description,
          total_cards,
          user_id,
          created_at,
          profiles!inner(full_name)
        `)
        .eq('id', setId)
        .eq('is_public', true)
        .single();

      if (error) {
        console.error('Error fetching public flashcard set:', error);
        throw error;
      }

      return data;
    };

    // Get public flashcards by set ID
    const getPublicFlashcards = async (setId: string) => {
      const { data, error } = await supabase
        .from('flashcards')
        .select('id, question, answer, difficulty_level')
        .eq('set_id', setId)
        .order('created_at');

      if (error) {
        console.error('Error fetching public flashcards:', error);
        throw error;
      }

      return data || [];
    };

    return {
      createFlashcardSet,
      saveFlashcards,
      saveGeneratedFlashcards,
      reforgeFlashcards,
      getUserFlashcardSets,
      getFlashcardsBySet,
      updateFlashcardStatus,
      getFlashcardById,
      getFlashcardSetById,
      markFlashcardAsMastered,
      getSetProgress,
      getFirstCardInSet,
      getNextCard,
      getPreviousCard,
      deleteFlashcardSet,
      togglePublicStatus,
      getPublicFlashcardSet,
      getPublicFlashcards
    };
  }, []); // Empty dependency array since all functions are stable
}
