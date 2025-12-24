'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { randomBytes } from 'crypto';

export async function seedAssignments() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const titles = [
    'Major Scales - 2 Octaves',
    'Sight Reading Exercise #4',
    'Beethoven Sonata - First Movement',
    'Rhythm Practice: Syncopation',
    'Jazz Standards: Autumn Leaves',
    'Technical Warm-up: Hanon #1',
    'Theory Worksheet: Circle of Fifths',
    'Ear Training: Interval Recognition'
  ];

  const assignments = Array.from({ length: 5 }).map(() => {
    const title = titles[Math.floor(Math.random() * titles.length)];
    const daysFromNow = Math.floor(Math.random() * 14) + 1;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysFromNow);

    return {
      teacher_id: user.id,
      title: `${title} (${new Date().toLocaleTimeString()})`, // Unique-ish title
      description: 'Please practice this daily for at least 20 minutes. Focus on evenness and dynamics.',
      due_date: dueDate.toISOString(),
    };
  });

  const { error } = await supabase.from('assignments').insert(assignments);

  if (error) {
    console.error('Seed error:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/assignments');
  return { success: true, count: 5 };
}

export async function seedInvites() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const invites = Array.from({ length: 3 }).map((_, i) => ({
    teacher_id: user.id,
    email: `student${Math.floor(Math.random() * 1000)}@example.com`,
    token: randomBytes(32).toString('hex'),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  const { error } = await supabase.from('invites').insert(invites);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/students');
  return { success: true, count: 3 };
}
