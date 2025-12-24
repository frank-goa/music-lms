'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export async function getResources() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching resources:', error);
    return [];
  }

  return data;
}

const createResourceSchema = z.object({
  title: z.string().min(1),
  fileUrl: z.string().url(),
  fileType: z.string(),
});

export async function createResource(data: z.infer<typeof createResourceSchema>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { error } = await supabase
    .from('resources')
    .insert({
      teacher_id: user.id,
      title: data.title,
      file_url: data.fileUrl,
      file_type: data.fileType,
    });

  if (error) {
    console.error('Error creating resource:', error);
    return { error: 'Failed to save resource' };
  }

  revalidatePath('/dashboard/library');
  return { success: true };
}

export async function deleteResource(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { error } = await supabase
    .from('resources')
    .delete()
    .eq('id', id)
    .eq('teacher_id', user.id);

  if (error) {
    return { error: 'Failed to delete resource' };
  }

  revalidatePath('/dashboard/library');
  return { success: true };
}
