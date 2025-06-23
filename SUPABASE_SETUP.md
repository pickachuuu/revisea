# Supabase Database & Gemini API Setup Guide

This guide will help you set up the complete database schema and integrate the Gemini API for your note-taking and flashcard application.

## 🗄️ Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### 2. Run Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire content from `database_schema.sql`
4. Click **Run** to execute the schema

### 3. Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini API
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

## 🤖 Gemini API Setup

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your environment variables

### 2. API Key Security

For production, store the Gemini API key securely:
- Use environment variables
- Consider encrypting the key in the database
- Implement rate limiting

## 📊 Database Schema Overview

### Core Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `profiles` | User profiles | Extends Supabase auth |
| `notes` | Markdown notes | Tags, status, public/private |
| `flashcard_sets` | Flashcard collections | Linked to notes |
| `flashcards` | Individual cards | Spaced repetition data |
| `study_sessions` | Learning sessions | Progress tracking |
| `session_results` | Detailed results | Performance analytics |
| `gemini_requests` | API usage tracking | Cost monitoring |
| `user_preferences` | User settings | API keys, preferences |

### Key Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Automatic timestamps**: Created/updated tracking
- **Foreign key relationships**: Data integrity
- **Indexes**: Optimized queries
- **Triggers**: Automatic statistics updates

## 🔐 Security Features

### Row Level Security Policies

All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Public notes can be viewed by anyone
- Proper authentication checks

### Data Protection

- API keys are stored encrypted
- User data is isolated by user_id
- No sensitive data in client-side storage

## 🚀 Integration Steps

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 2. Update Auth Context

Replace the TODO comments in `src/lib/auth.tsx` with actual Supabase calls:

```typescript
// Check for existing session
const { data: { session } } = await supabase.auth.getSession();
if (session?.user) {
  setUser({
    id: session.user.id,
    email: session.user.email!,
    name: session.user.user_metadata?.full_name,
    avatar_url: session.user.user_metadata?.avatar_url,
  });
}

// Sign in
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: provider,
  options: {
    redirectTo: `${window.location.origin}/dashboard`
  }
});

// Sign out
await supabase.auth.signOut();
```

### 3. Create API Routes

Create `src/app/api/flashcards/generate/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createGeminiService } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { noteId, count, difficulty } = await request.json();
    
    // Get user from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get note content
    const { data: note } = await supabase
      .from('notes')
      .select('content')
      .eq('id', noteId)
      .eq('user_id', session.user.id)
      .single();

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Get user's Gemini API key
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('gemini_api_key')
      .eq('user_id', session.user.id)
      .single();

    if (!preferences?.gemini_api_key) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 400 });
    }

    // Create Gemini service and generate flashcards
    const geminiService = createGeminiService(preferences.gemini_api_key);
    const result = await geminiService.generateFlashcards(note.content, count, difficulty);

    // Store the request in database
    await supabase.from('gemini_requests').insert({
      user_id: session.user.id,
      note_id: noteId,
      request_type: 'flashcard_generation',
      prompt: `Generate ${count} ${difficulty} flashcards`,
      response: JSON.stringify(result.flashcards),
      status: 'completed',
      tokens_used: result.total_tokens,
      cost_cents: result.cost_cents,
      completed_at: new Date().toISOString()
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Flashcard generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## 📈 Usage Examples

### Creating a Note

```typescript
const { data, error } = await supabase
  .from('notes')
  .insert({
    user_id: userId,
    title: 'JavaScript Fundamentals',
    content: '# JavaScript Basics\n\nJavaScript is a programming language...',
    tags: ['JavaScript', 'Programming'],
    status: 'published'
  });
```

### Generating Flashcards

```typescript
const response = await fetch('/api/flashcards/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    noteId: 'note-uuid',
    count: 10,
    difficulty: 'medium'
  })
});

const { flashcards } = await response.json();
```

### Creating Flashcard Set

```typescript
// Create flashcard set
const { data: set } = await supabase
  .from('flashcard_sets')
  .insert({
    user_id: userId,
    note_id: noteId,
    title: 'JavaScript Fundamentals',
    description: 'Flashcards from JavaScript notes'
  })
  .select()
  .single();

// Add flashcards
const flashcardInserts = flashcards.map(card => ({
  set_id: set.id,
  note_id: noteId,
  question: card.question,
  answer: card.answer,
  difficulty_level: card.difficulty === 'easy' ? 1 : card.difficulty === 'medium' ? 3 : 5
}));

await supabase.from('flashcards').insert(flashcardInserts);
```

## 🔧 Database Functions

The schema includes several useful functions:

- **Automatic profile creation**: When users sign up
- **Statistics updates**: Flashcard set stats update automatically
- **Timestamp management**: Updated_at fields update automatically

## 📊 Monitoring & Analytics

### Gemini API Usage

Track API usage and costs:
```sql
SELECT 
  user_id,
  COUNT(*) as total_requests,
  SUM(tokens_used) as total_tokens,
  SUM(cost_cents) as total_cost_cents
FROM gemini_requests 
WHERE status = 'completed'
GROUP BY user_id;
```

### Study Progress

Track learning progress:
```sql
SELECT 
  fs.title,
  fs.total_cards,
  fs.mastered_cards,
  ROUND((fs.mastered_cards::float / fs.total_cards) * 100, 2) as mastery_percentage
FROM flashcard_sets fs
WHERE fs.user_id = 'user-uuid';
```

## 🚀 Next Steps

1. **Test the schema**: Create some sample data
2. **Implement the API routes**: Set up flashcard generation
3. **Add error handling**: Robust error management
4. **Implement caching**: Cache frequently accessed data
5. **Add analytics**: Track user engagement and learning progress

## 🔒 Security Checklist

- [ ] RLS policies are active
- [ ] API keys are encrypted
- [ ] Input validation is implemented
- [ ] Rate limiting is configured
- [ ] Error messages don't leak sensitive data
- [ ] CORS is properly configured

## 📝 Notes

- The schema supports both individual notes and flashcard sets
- Gemini API requests are tracked for cost monitoring
- Study sessions provide detailed analytics
- The system supports spaced repetition learning
- All user data is properly isolated and secured 