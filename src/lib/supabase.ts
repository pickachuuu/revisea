import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper function to get user profile
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

// Helper function to get user notes
export async function getUserNotes(userId: string) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Helper function to get flashcard sets
export async function getUserFlashcardSets(userId: string) {
  const { data, error } = await supabase
    .from('flashcard_sets')
    .select(`
      *,
      notes (
        id,
        title,
        content
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Helper function to get flashcards for a set
export async function getFlashcardsForSet(setId: string) {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('set_id', setId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
}

// Helper function to get user preferences
export async function getUserPreferences(userId: string) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
  return data
} 