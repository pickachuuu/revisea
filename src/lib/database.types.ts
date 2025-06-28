export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          status: 'draft' | 'published' | 'archived'
          tags: string[] | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          status?: 'draft' | 'published' | 'archived'
          tags?: string[] | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          status?: 'draft' | 'published' | 'archived'
          tags?: string[] | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      flashcard_sets: {
        Row: {
          id: string
          user_id: string
          note_id: string | null
          title: string
          description: string | null
          total_cards: number
          mastered_cards: number
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          note_id?: string | null
          title: string
          description?: string | null
          total_cards?: number
          mastered_cards?: number
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          note_id?: string | null
          title?: string
          description?: string | null
          total_cards?: number
          mastered_cards?: number
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      flashcards: {
        Row: {
          id: string
          set_id: string
          note_id: string | null
          question: string
          answer: string
          status: 'new' | 'learning' | 'review' | 'mastered'
          difficulty_level: number
          last_reviewed: string | null
          next_review: string | null
          review_count: number
          correct_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          set_id: string
          note_id?: string | null
          question: string
          answer: string
          status?: 'new' | 'learning' | 'review' | 'mastered'
          difficulty_level?: number
          last_reviewed?: string | null
          next_review?: string | null
          review_count?: number
          correct_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          set_id?: string
          note_id?: string | null
          question?: string
          answer?: string
          status?: 'new' | 'learning' | 'review' | 'mastered'
          difficulty_level?: number
          last_reviewed?: string | null
          next_review?: string | null
          review_count?: number
          correct_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          set_id: string | null
          session_type: string
          cards_studied: number
          correct_answers: number
          duration_minutes: number
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          set_id?: string | null
          session_type: string
          cards_studied?: number
          correct_answers?: number
          duration_minutes?: number
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          set_id?: string | null
          session_type?: string
          cards_studied?: number
          correct_answers?: number
          duration_minutes?: number
          started_at?: string
          completed_at?: string | null
        }
      }
      session_results: {
        Row: {
          id: string
          session_id: string
          flashcard_id: string
          was_correct: boolean
          response_time_seconds: number | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          flashcard_id: string
          was_correct: boolean
          response_time_seconds?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          flashcard_id?: string
          was_correct?: boolean
          response_time_seconds?: number | null
          created_at?: string
        }
      }
      gemini_requests: {
        Row: {
          id: string
          user_id: string
          note_id: string | null
          request_type: string
          prompt: string
          response: string | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          tokens_used: number | null
          cost_cents: number | null
          error_message: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          note_id?: string | null
          request_type: string
          prompt: string
          response?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          tokens_used?: number | null
          cost_cents?: number | null
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          note_id?: string | null
          request_type?: string
          prompt?: string
          response?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          tokens_used?: number | null
          cost_cents?: number | null
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          gemini_api_key: string | null
          default_flashcard_count: number
          study_reminder_enabled: boolean
          study_reminder_time: string
          theme: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          gemini_api_key?: string | null
          default_flashcard_count?: number
          study_reminder_enabled?: boolean
          study_reminder_time?: string
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          gemini_api_key?: string | null
          default_flashcard_count?: number
          study_reminder_enabled?: boolean
          study_reminder_time?: string
          theme?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      note_status: 'draft' | 'published' | 'archived'
      flashcard_status: 'new' | 'learning' | 'review' | 'mastered'
      gemini_request_status: 'pending' | 'processing' | 'completed' | 'failed'
    }
  }
}

// Helper types for common operations
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Note = Database['public']['Tables']['notes']['Row']
export type FlashcardSet = Database['public']['Tables']['flashcard_sets']['Row']
export type Flashcard = Database['public']['Tables']['flashcards']['Row']
export type StudySession = Database['public']['Tables']['study_sessions']['Row']
export type SessionResult = Database['public']['Tables']['session_results']['Row']
export type GeminiRequest = Database['public']['Tables']['gemini_requests']['Row']
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type NoteInsert = Database['public']['Tables']['notes']['Insert']
export type FlashcardSetInsert = Database['public']['Tables']['flashcard_sets']['Insert']
export type FlashcardInsert = Database['public']['Tables']['flashcards']['Insert']
export type StudySessionInsert = Database['public']['Tables']['study_sessions']['Insert']
export type SessionResultInsert = Database['public']['Tables']['session_results']['Insert']
export type GeminiRequestInsert = Database['public']['Tables']['gemini_requests']['Insert']
export type UserPreferencesInsert = Database['public']['Tables']['user_preferences']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type NoteUpdate = Database['public']['Tables']['notes']['Update']
export type FlashcardSetUpdate = Database['public']['Tables']['flashcard_sets']['Update']
export type FlashcardUpdate = Database['public']['Tables']['flashcards']['Update']
export type StudySessionUpdate = Database['public']['Tables']['study_sessions']['Update']
export type SessionResultUpdate = Database['public']['Tables']['session_results']['Update']
export type GeminiRequestUpdate = Database['public']['Tables']['gemini_requests']['Update']
export type UserPreferencesUpdate = Database['public']['Tables']['user_preferences']['Update'] 