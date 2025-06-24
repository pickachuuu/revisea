'use client';

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
      updateData.review_count = supabase.sql`review_count + 1`;
      if (wasCorrect) {
        updateData.correct_count = supabase.sql`correct_count + 1`;
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

  // Delete a flashcard set and all its cards
  const deleteFlashcardSet = async (setId: string) => {
    const { error } = await supabase
      .from('flashcard_sets')
      .delete()
      .eq('id', setId);

    if (error) {
      console.error('Error deleting flashcard set:', error);
      throw error;
    }
  };

  return {
    saveGeneratedFlashcards,
    getUserFlashcardSets,
    getFlashcardsBySet,
    updateFlashcardStatus,
    deleteFlashcardSet,
    createFlashcardSet,
    saveFlashcards,
    logGeminiRequest
  };
}
