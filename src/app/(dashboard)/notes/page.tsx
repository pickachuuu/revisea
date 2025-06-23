'use client';

import Header from '@/component/ui/Header';
import Card from '@/component/ui/Card';
import Button from '@/component/ui/Button';
import CreateNoteButton from '@/component/features/CreateNoteButton';
import { File01Icon, GoogleGeminiIcon } from 'hugeicons-react';
import { useEffect, useState } from 'react';
import { useNoteActions } from '@/hook/useNoteActions';


export default function NotesPage() {
  const { getUserNotes } = useNoteActions();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        ) : notes.length === 0 ? (
          <div className="col-span-full flex flex-col items-center py-12 text-foreground-muted text-lg">
            <span>No notes found.</span>
          </div>
        ) : (
          notes.map((note) => (
            <Card
              key={note.id}
              variant="elevated"
              size="md"
              className="flex flex-col justify-between h-full rounded-xl border border-border bg-surface shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group"
            >
              <Card.Header className="pb-2 border-b border-border rounded-t-xl">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Card.Title className="truncate text-lg font-semibold group-hover:text-accent transition-colors">{note.title}</Card.Title>
                    <Card.Description className="truncate text-foreground-muted text-sm mt-1">{note.content?.slice(0, 80) || ''}</Card.Description>
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
                  size="sm"
                  className="flex items-center gap-2 text-accent border-accent hover:bg-accent hover:text-white transition-colors"
                  disabled
                  title="Generate flashcards (coming soon)"
                >
                  <GoogleGeminiIcon className="w-4 h-4" />
                  Generate Flashcards
                </Button>
              </Card.Footer>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}