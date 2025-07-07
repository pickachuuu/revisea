'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Card from '@/component/ui/Card';
import Button from '@/component/ui/Button';
import Header from '@/component/ui/Header';
import { useParams } from 'next/navigation';
import { useNoteActions } from '@/hook/useNoteActions';
import { File01Icon } from 'hugeicons-react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export default function NewNotePage() {
  const params = useParams();
  const noteId = params?.noteId as string | undefined;
  const { createNote, saveNote } = useNoteActions();
  const [id, setId] = useState<string | null>(noteId || null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('#');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [loading, setLoading] = useState(!!noteId);
  const [lastSaved, setLastSaved] = useState({ title: '', content: '', tags: [] as string[] });
  const [editing, setEditing] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch note if editing
  useEffect(() => {
    const fetchNote = async () => {
      if (noteId) {
        setLoading(true);
        const { data, error } = await supabase
          .from('notes')
          .select('title, content, tags')
          .eq('id', noteId)
          .single();
        if (data) {
          setTitle(data.title || '');
          setContent(data.content || '');
          setTags(data.tags || []);
          setId(noteId);
          setLastSaved({ title: data.title || '', content: data.content || '', tags: data.tags || [] });
        }
        setLoading(false);
      }
    };
    fetchNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  // Create new note when there's no ID and user starts typing title
  useEffect(() => {
    const handleCreateNote = async () => {
      if (!id && title.trim()) {
        try {
          const newId = await createNote();
          if (newId) {
            setId(newId);
            setSaveStatus('saved');
          }
        } catch (error) {
          setSaveStatus('error');
        }
      }
    };

    handleCreateNote();
  }, [title, id, createNote]);

  // Improved auto-save effect
  useEffect(() => {
    if (!id || !title.trim()) return;

    // Only save if something changed
    if (
      lastSaved.title === title &&
      lastSaved.content === content &&
      JSON.stringify(lastSaved.tags) === JSON.stringify(tags)
    ) {
      return;
    }

    setSaveStatus('saving');
    const timeoutId = setTimeout(async () => {
      try {
        await saveNote(id, { title, content, tags });
        setSaveStatus('saved');
        setLastSaved({ title, content, tags });
      } catch {
        setSaveStatus('error');
      }
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [id, title, content, tags, saveNote, lastSaved]);

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

  // Title change handler
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  // Content change handler (fixes markdown repeat bug)
  const handleContentChange = (val: string | undefined) => {
    setContent(val || '');
  };

  // Markdown list continuation handler
  const handleMarkdownListKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      const textarea = e.currentTarget;
      const { selectionStart, selectionEnd, value } = textarea;
      const before = value.slice(0, selectionStart);
      const after = value.slice(selectionEnd);
      const lineStart = before.lastIndexOf('\n') + 1;
      const currentLine = before.slice(lineStart);

      // Match unordered list (-, *, +) or ordered list (number.)
      const unorderedMatch = currentLine.match(/^(\s*[-*+] )/);
      const orderedMatch = currentLine.match(/^(\s*)(\d+)\. /);

      if (unorderedMatch) {
        e.preventDefault();
        const insert = '\n' + unorderedMatch[1];
        const newValue = value.slice(0, selectionStart) + insert + after;
        setContent(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + insert.length;
        }, 0);
      } else if (orderedMatch) {
        e.preventDefault();
        const spaces = orderedMatch[1] || '';
        const number = parseInt(orderedMatch[2], 10) + 1;
        const insert = `\n${spaces}${number}. `;
        const newValue = value.slice(0, selectionStart) + insert + after;
        setContent(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + insert.length;
        }, 0);
      }
    }
  };

  // Focus textarea when switching to edit mode
  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editing]);

  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      // Only scroll if caret is at the end
      if (textarea.selectionStart === textarea.value.length) {
        textarea.scrollTop = textarea.scrollHeight;
      }
    }
  }, [content, editing]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
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
            <Card.Header className=" border-b border-border pb-4">


              <div className='flex gap-5 justify-start items-center'>
                <div className="flex gap-2 items-center">
                  <File01Icon className="w-5 h-5 text-accent" />
                  <h3 className="font-medium">Editor</h3>
                </div>              
                
                <Button
                  onClick={() => setEditing(!editing)}
                  variant={editing ? "default" : "outline"}
                  size="sm"
                  className={`text-xs h-8 w-12 px-3 transition-all duration-200 ${
                    editing 
                      ? "bg-accent text-white hover:bg-accent-light" 
                      : "border border-border bg-transparent hover:bg-background-muted"
                  }`}
                >
                  {editing ? "Preview" : "Edit"}
                </Button>
              </div>
            </Card.Header>
          
          <Card.Content className="p-0">
            <div className="w-full h-[600px]">
              {editing ? (
                <textarea
                  ref={textareaRef}
                  className="shadow-md w-full h-full p-4 rounded-b-lg resize-none font-mono text-base bg-background-muted text-foreground focus:outline-none focus:ring-0"
                  value={content}
                  onChange={e => {
                    setContent(e.target.value);
                  }}
                  onKeyDown={handleMarkdownListKeyDown}
                  placeholder="Write your markdown here..."
                  spellCheck={true}
                />
              ) : (
                <div
                  className="w-full h-full p-4 overflow-auto prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-code:text-foreground prose-pre:text-foreground prose-blockquote:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-table:text-foreground prose-th:text-foreground prose-td:text-foreground"
                >
                  <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
 