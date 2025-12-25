'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createNotification } from '../notifications-actions';

export async function getConversations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Determine user role to find contacts
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const isTeacher = profile?.role === 'teacher';

  let contacts: any[] = [];

  if (isTeacher) {
    // Fetch students
    const { data: students } = await supabase
      .from('student_profiles')
      .select(`
        user:users!user_id (id, full_name, email, avatar_url)
      `)
      .eq('teacher_id', user.id);
    
    contacts = students?.map(s => s.user) || [];
  } else {
    // Fetch teacher
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select(`
        teacher:users!teacher_id (id, full_name, email, avatar_url)
      `)
      .eq('user_id', user.id)
      .single();
    
    if (studentProfile?.teacher) {
      contacts = [studentProfile.teacher];
    }
  }

  return { contacts, userId: user.id };
}

export async function getMessages(contactId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true });

  return data || [];
}

export async function sendMessage(receiverId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  // Get sender name for the notification
  const { data: sender } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const { error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content,
    });

  if (error) {
    console.error('Error sending message:', error);
    return { error: error.message };
  }

  // Trigger notification
  await createNotification(receiverId, {
    type: 'message',
    title: 'New Message',
    content: `${sender?.full_name || 'Someone'} sent you a message: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
    link: '/dashboard/messages',
  });

  return { success: true };
}

export async function clearMessages(contactId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('messages')
    .delete()
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`);

  if (error) {
    console.error('Error clearing messages:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/messages');
  return { success: true };
}
