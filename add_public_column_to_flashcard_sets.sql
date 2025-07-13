-- Migration: Add is_public column to flashcard_sets table
-- This script adds the is_public boolean column to enable sharing functionality

-- Add the is_public column with a default value of false
ALTER TABLE public.flashcard_sets 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- Add an index for better query performance when filtering by public status
CREATE INDEX IF NOT EXISTS idx_flashcard_sets_is_public ON public.flashcard_sets(is_public);

-- Update RLS policies to allow public access to public flashcard sets
-- This policy allows anyone to read flashcard sets that are marked as public
CREATE POLICY "Allow public read access to public flashcard sets" ON public.flashcard_sets
    FOR SELECT
    USING (is_public = true);

-- This policy allows anyone to read flashcards from public sets
CREATE POLICY "Allow public read access to flashcards from public sets" ON public.flashcards
    FOR SELECT
    USING (
        set_id IN (
            SELECT id FROM public.flashcard_sets WHERE is_public = true
        )
    );

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    column_default, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'flashcard_sets' 
AND column_name = 'is_public'; 