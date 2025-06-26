'use client';

import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export function useNoteActions(){
    const createNote = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        const {data, error} = await supabase
            .from('notes')
            .insert([{ title: '', content: '', tags: [], user_id: session?.user?.id }])
            .select('id')
            .single();
        
        if (error) {
            throw error;
        }
        
        return data?.id;
    }

    const saveNote = async (id: string, { title, content, tags }: { title: string, content: string, tags: string[] }) => {
        if (!title) return;

        const { data: { session } } = await supabase.auth.getSession();
        
        const { data, error } = await supabase
            .from('notes')
            .update({ 
                title, 
                content, 
                tags,
                user_id: session?.user?.id,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', session?.user?.id);

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        // Remove .single() since we don't need the response data
        return true;
    };

    const getUserNotes = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return [];
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', session.user.id)
            .order('updated_at', { ascending: false });
        if (error) {
            console.error('Supabase error:', error);
            return [];
        }
        return data || [];
    };

    const deleteNote = async (id: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) throw new Error('Not authenticated');
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', id)
            .eq('user_id', session.user.id);
        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }
        return true;
    };

    return { createNote, saveNote, getUserNotes, deleteNote };
}