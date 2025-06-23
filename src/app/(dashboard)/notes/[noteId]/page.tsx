'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import Card from '@/component/ui/Card';
import Button from '@/component/ui/Button';
import Header from '@/component/ui/Header';
import { useParams } from 'next/navigation';
import { useNoteActions } from '@/hook/useNoteActions';
import { File01Icon } from 'hugeicons-react';

// Importing the editor dynamically to support SSR
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export default function NewNotePage() {
  const params = useParams();
  const { createNote, saveNote } = useNoteActions();
  const [id, setId] = useState<string | null>(params?.noteId as string || null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('#');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Create new note when there's no ID and user starts typing title
  useEffect(() => {
    const handleCreateNote = async () => {
      if (!id && title.trim()) {
        console.log('Creating new note...');
        try {
          const newId = await createNote();
          console.log('Created note with ID:', newId);
          if (newId) {
            setId(newId);
            setSaveStatus('saved');
          }
        } catch (error) {
          console.error('Error creating note:', error);
          setSaveStatus('error');
        }
      }
    };

    handleCreateNote();
  }, [title, id, createNote]);

  // Auto-save effect
  useEffect(() => {
    const handleSave = async () => {
      if (!id || !title.trim()) {
        console.log('Not saving - no id or title');
        return;
      }

      console.log('Preparing to save note:', { id, title, content, tags });
      setSaveStatus('saving');

      try {
        await saveNote(id, { title, content, tags });
        console.log('Note saved successfully');
        setSaveStatus('saved');
      } catch (error) {
        console.error('Error saving note:', error);
        setSaveStatus('error');
      }
    };

    // Debounce the save
    const timeoutId = setTimeout(handleSave, 1000);
    return () => clearTimeout(timeoutId);
  }, [id, title, content, tags, saveNote]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Title change handler with logging
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    console.log('Title changed to:', newTitle);
    setTitle(newTitle);
  };

  // Content change handler with logging
  const handleContentChange = (newContent: string | undefined) => {
    console.log('Content changed to:', newContent);
    setContent(newContent || '');
  };

  return (
    <div className="space-y-6">
      <Header 
        title={title || "New Note"} 
        description="Create and edit your study notes"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
        {/* Metadata Card */}
        <Card
          variant="elevated"
          className="h-fit rounded-xl border border-border bg-surface shadow-sm transition-all duration-200"
        >
          <Card.Header className="pb-4">
            <div className="space-y-4">
              {/* Title Input */}
              <div className="relative">
                <input
                  className="w-full text-xl font-semibold bg-transparent focus:outline-none focus:ring-0 placeholder:text-foreground-muted"
                  placeholder="Note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  aria-label="Note title"
                  maxLength={100}
                  autoFocus
                />
                <div className="absolute right-0 top-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    saveStatus === 'saved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                    saveStatus === 'saving' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {saveStatus === 'saved' ? 'Saved' : 
                     saveStatus === 'saving' ? 'Saving...' : 
                     'Error saving'}
                  </span>
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 min-h-[32px]">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-accent-muted text-accent rounded-full shadow-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:bg-accent hover:text-white rounded-full p-0.5 transition-colors"
                        aria-label={`Remove tag ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add tags..."
                    className="flex-1 px-3 py-2 text-sm bg-accent-muted/10 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent transition-all placeholder:text-foreground-muted"
                    maxLength={50}
                  />
                  <Button
                    onClick={handleAddTag}
                    variant="outline"
                    size="sm"
                    disabled={!tagInput.trim()}
                    type="button"
                    className="shrink-0"
                  >
                    Add
                  </Button>
                </div>
                <p className="text-xs text-foreground-muted">
                  Press Enter or comma to add a tag
                </p>
              </div>
            </div>
          </Card.Header>
        </Card>

        {/* Editor Card */}
        <Card
          variant="elevated"
          className="rounded-xl border border-border bg-surface shadow-sm transition-all duration-200"
        >
          <Card.Header className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <File01Icon className="w-5 h-5 text-accent" />
              <h3 className="font-medium">Editor</h3>
            </div>
          </Card.Header>
          <Card.Content className="p-0">
            <div className="h-[calc(100vh-300px)] min-h-[500px]">
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || '')}
                preview="edit"
                height="100%"
                textareaProps={{
                  placeholder: 'Start writing your note in Markdown...'
                }}
                className="border-none"
              />
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
 