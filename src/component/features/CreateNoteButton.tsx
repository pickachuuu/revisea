'use client';

import { useRouter } from 'next/navigation';
import { useNoteActions } from '@/hook/useNoteActions';
import { File01Icon } from 'hugeicons-react';
import Button from '../ui/Button';

export default function CreateNoteButton() {
  const router = useRouter();
  const { createNote } = useNoteActions();

  const handleCreate = async () => {
    try {
      const noteId = await createNote();
      router.push(`/notes/${noteId}`);
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  return (
    <Button
    onClick={handleCreate}
    >
        <File01Icon className="w-4 h-4 mr-2" />
        New Note
    </Button>
    );
}
