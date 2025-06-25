'use client';

import Header from '@/component/ui/Header';
import Card from '@/component/ui/Card';
import Button from '@/component/ui/Button';
import CreateNoteButton from '@/component/features/CreateNoteButton';
import { File01Icon, Delete01Icon,GoogleGeminiIcon, BookOpen01Icon } from 'hugeicons-react';
import { useEffect, useState } from 'react';
import { useNoteActions } from '@/hook/useNoteActions';
import { useFlashcardActions } from '@/hook/useFlashcardActions';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import GenerateFlashCardModal from '@/component/features/modal/GenerateFlashCardModal';
import ConfirmDeleteModal from '@/component/features/modal/ConfirmDeleteModal';
import { GeminiResponse } from '@/lib/gemini';

const supabase = createClient();

export default function NotesPage() {
  const { getUserNotes, deleteNote } = useNoteActions();
  const { saveGeneratedFlashcards } = useFlashcardActions();
  const [notes, setNotes] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const params = useParams();
  const noteId = params?.noteId as string | undefined;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Session check:', { session: !!session, error: error?.message });
        
        if (error) {
          console.error('Auth error:', error);
          window.location.href = '/auth';
          return;
        }
        
        if (!session) {
          console.log('No session found, redirecting to auth');
          window.location.href = '/auth';
          return;
        }
        
        // If we have a session, fetch notes
        const data = await getUserNotes();
        setNotes(data);
        setLoading(false);
      } catch (error) {
        console.error('Error in checkAuth:', error);
        window.location.href = '/auth';
      }
    };
    
    checkAuth();
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

  const handleGenerateFlashcards = (note: any) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleDeleteNote = (note: any) => {
    setSelectedNote(note);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedNote) return;
    
    try {
      await deleteNote(selectedNote.id);
      
      // Remove the note from the local state
      setNotes(prevNotes => prevNotes.filter(note => note.id !== selectedNote.id));
      
      // Show success message
      setSaveSuccess('Note deleted successfully!');
      setTimeout(() => setSaveSuccess(null), 3000);
      
    } catch (error) {
      console.error('Error deleting note:', error);
      setSaveSuccess('Error deleting note. Please try again.');
      setTimeout(() => setSaveSuccess(null), 3000);
    }
  };

  const handleFlashcardsGenerated = async (geminiResponse: GeminiResponse) => {
    if (!selectedNote) return;
    
    setSaving(true);
    setSaveSuccess(null);
    try {
      // Determine difficulty from the first flashcard or default to medium
      const difficulty = geminiResponse.flashcards[0]?.difficulty || 'medium';

      // Save flashcards to Supabase
      const setId = await saveGeneratedFlashcards({
        noteId: selectedNote.id,
        noteTitle: selectedNote.title,
        difficulty,
        geminiResponse
      });

      console.log('Flashcards saved successfully! Set ID:', setId);
      setSaveSuccess(`Successfully saved ${geminiResponse.flashcards.length} flashcards!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(null), 3000);
      
    } catch (error) {
      console.error('Error saving flashcards:', error);
      setSaveSuccess('Error saving flashcards. Please try again.');
      setTimeout(() => setSaveSuccess(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNote(null);
    setSelectedText('');
  };

  return (
    <>
    <div className="space-y-8">
      <Header 
        title="Notes" 
        description="Organize and manage your study notes"
        children={<CreateNoteButton/>}
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
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <Card className="h-40 flex flex-col justify-between rounded-xl border border-border bg-surface">
                <Card.Header className="pb-2 border-b border-border rounded-t-xl">
                  <div className="h-5 w-2/3 bg-background-muted rounded mb-2"></div>
                </Card.Header>
                <Card.Content className="py-3 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <div className="h-4 w-12 bg-background-muted rounded-full"></div>
                    <div className="h-4 w-8 bg-background-muted rounded-full"></div>
                  </div>
                </Card.Content>
                <Card.Footer className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-border rounded-b-xl pt-2">
                  <div className="h-4 w-24 bg-background-muted rounded mb-2"></div>
                  <div className="h-8 w-32 bg-background-muted rounded"></div>
                </Card.Footer>
              </Card>
            </div>
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <Card>
          <Card.Header>
            <div className="text-center py-8">
              <BookOpen01Icon className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No notes yet</h3>
              <p className="text-foreground-muted mb-4">
                Create your first note
              </p>
              <CreateNoteButton/>
              {/* <Button onClick={handleCreate}>
                <BookOpen01Icon className="w-4 h-4 mr-2" />
                Create Your First Note
              </Button> */}
            </div>
          </Card.Header>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
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

                  {/* Action buttons */}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      className="flex items-center gap-2 text-xs"
                      title="Generate flashcards from this note"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleGenerateFlashcards(note);
                      }}
                    >
                      <GoogleGeminiIcon className="w-6 h-6" />
                      Forge
                    </Button>

                    <Button
                      size="sm"
                      className="flex items-center gap-2 text-xs"
                      title="Delete this note"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDeleteNote(note);
                      }}
                    >
                      <Delete01Icon className="w-6 h-6" />
                      Delete  
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>

    <GenerateFlashCardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        noteContent={selectedNote?.content || ''}  
        selectedSection={selectedText}
        onFlashcardsGenerated={handleFlashcardsGenerated}
        saving={saving}
      />

    <ConfirmDeleteModal
      isOpen={isDeleteModalOpen}
      onClose={() => setIsDeleteModalOpen(false)}
      onConfirm={handleConfirmDelete}
      title="Delete Note"
      description="Are you sure you want to delete this note? This action cannot be undone."
      itemName={selectedNote?.title || 'Untitled Note'}
      itemType="note"
    />
  </>
  );
}