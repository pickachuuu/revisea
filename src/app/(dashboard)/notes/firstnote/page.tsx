// app/notes/new/page.tsx or a component file
'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import Card from '@/component/ui/Card';
import Button from '@/component/ui/Button';
import Header from '@/component/ui/Header';
import { createClient } from '@/utils/supabase/client';

// Importing the editor dynamically to support SSR
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });
const MDPreview = dynamic(() => import('@uiw/react-markdown-preview'), { ssr: false });

export default function NewNotePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('#');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  // const supabase = createClient(); // For future save logic

  // const handleSave = async () => {
  //   // Example: save to Supabase
  // };

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

  return (
    <div className=" w-full bg-background flex flex-col items-center py-8 px-2">
      <Card variant="elevated" size="lg" className="w-full">
        <Card.Header>
          <input
            className="w-full text-2xl font-semibold border-b border-border bg-transparent mb-2 focus:outline-none focus:border-accent transition-colors placeholder:text-foreground-muted"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Note title"
            maxLength={100}
            autoFocus
          />
          
          {/* Tags Section */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-accent-muted text-accent rounded-full"
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
                placeholder="Add tags (press Enter or comma to add)"
                className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-transparent focus:outline-none focus:border-accent transition-colors placeholder:text-foreground-muted"
                maxLength={50}
              />
              <Button
                onClick={handleAddTag}
                variant="outline"
                size="sm"
                disabled={!tagInput.trim()}
                type="button"
              >
                Add
              </Button>
            </div>
            <p className="text-xs text-foreground-muted mt-1">
              Press Enter or comma to add a tag
            </p>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="mt-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[400px]">
              {/* Editor Column */}
              <div className="h-full">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Editor
                </label>
                <div className="h-full border border-border rounded-md overflow-hidden">
                  <MDEditor
                    value={content}
                    onChange={(val) => setContent(val || '')}
                    height="100%"
                    preview="edit"
                    textareaProps={{
                      placeholder: 'Start writing your note in Markdown...'
                    }}
                    className="h-96"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card.Content>
        <Card.Footer className="justify-end">
          <Button
            // onClick={handleSave}
            variant="default"
            size="lg"
            className="px-8"
            type="button"
          >
            Save Note
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
}
 