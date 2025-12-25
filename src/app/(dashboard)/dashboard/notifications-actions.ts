'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function getNotifications() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .is('read_at', null)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data;
}

export async function markAsRead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { error: error.message };
  
  revalidatePath('/dashboard');
  return { success: true };
}

export async function markAllAsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null);

  if (error) return { error: error.message };
  
  revalidatePath('/dashboard');
  return { success: true };
}

// Utility to create a notification (to be used by other actions)
export async function createNotification(userId: string, data: {
  type: string;
  title: string;
  content?: string;
  link?: string;
}) {
  try {
    // Use Admin Client to bypass RLS for system notifications
    const supabase = createAdminClient();
    
    console.log(`Creating notification for user ${userId}:`, data.title);

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        ...data
      } as any);

    if (error) {
      console.error('Supabase error creating notification:', error);
    } else {
      console.log('Notification created successfully');
    }
  } catch (err) {
    console.error('Unexpected error in createNotification:', err);
  }
}
