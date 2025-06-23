'use client';

import Header from '@/component/ui/Header';
import Card from '@/component/ui/Card';
import Button from '@/component/ui/Button';
import CreateNoteButton from '@/component/features/CreateNoteButton';
import { File01Icon, GoogleGeminiIcon } from 'hugeicons-react';
import { useEffect, useState } from 'react';
import { useNoteActions } from '@/hook/useNoteActions';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export default function NotesPage() {
  const { getUserNotes } = useNoteActions();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const noteId = params?.noteId as string | undefined;

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      const data = await getUserNotes();
      setNotes(data);
      setLoading(false);
    };
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter out notes with empty title, empty content, and 0 tags
  const filteredNotes = notes.filter(
    (note) =>
      (note.title && note.title.trim() !== '') ||
      (note.content && note.content.trim() !== '') ||
      (Array.isArray(note.tags) && note.tags.length > 0)
  );

  // Fetch note if editing
  useEffect(() => {
    const fetchNote = async () => {
      if (noteId) {
        // Fetch from Supabase
        const { data, error } = await supabase
          .from('notes')
          .select('title, content, tags')
          .eq('id', noteId)
          .single();
        if (data) {
          // Update the note in the notes array
          const updatedNotes = notes.map((note) =>
            note.id === noteId ? { ...note, title: data.title, content: data.content, tags: data.tags } : note
          );
          setNotes(updatedNotes);
        }
      }
    };
    fetchNote();
  }, [noteId, notes]);

  return (
    <div className="space-y-8">
      <Header 
        title="Notes" 
        description="Organize and manage your study notes"
        children={<CreateNoteButton/>}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12 text-foreground-muted text-lg">Loading notes...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="col-span-full flex flex-col items-center py-12 text-foreground-muted text-lg">
            <span>No notes found.</span>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <Link href={`/notes/${note.id}`} key={note.id} className="block h-full">
              <Card
                variant="elevated"
                size="md"
                className="flex flex-col justify-between h-full rounded-xl border border-border bg-surface shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group"
              >
                <Card.Header className="pb-2 border-b border-border rounded-t-xl">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <Card.Title className="truncate text-lg font-semibold group-hover:text-accent transition-colors">{note.title}</Card.Title>
                    </div>
                    <File01Icon className="w-6 h-6 text-accent shrink-0 ml-2" />
                  </div>
                </Card.Header>
                <Card.Content className="py-3 flex-1">
                  <div className="flex flex-wrap gap-2">
                    {(note.tags || []).map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-accent-muted text-accent rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Card.Content>
                <Card.Footer className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-border rounded-b-xl pt-2">
                  <p className="text-xs text-foreground-muted">
                    Modified {note.updated_at ? new Date(note.updated_at).toLocaleString() : ''}
                  </p>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-2 text-xs text-accent border-accent hover:bg-accent hover:text-white transition-colors"
                    disabled
                    title="Generate flashcards (coming soon)"
                  >
                    <GoogleGeminiIcon className="w-6 h-6" />
                    Generate Flashcards
                  </Button>
                </Card.Footer>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}