'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const logPracticeSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date string",
  }),
  durationMinutes: z.number().int().positive('Duration must be positive'),
  notes: z.string().optional(),
});

export type LogPracticeInput = z.infer<typeof logPracticeSchema>;

export async function logPracticeSession(data: LogPracticeInput) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Validate input
  const result = logPracticeSchema.safeParse(data);
  if (!result.success) {
    return { error: 'Invalid input data' };
  }

  const { date, durationMinutes, notes } = result.data;

  const { error } = await supabase
    .from('practice_logs')
    .insert({
      student_id: user.id,
      date: new Date(date).toISOString(), // Postgres date type handles ISO strings
      duration_minutes: durationMinutes,
      notes: notes || null,
    });

  if (error) {
    console.error('Error logging practice:', error);
    return { error: 'Failed to log practice session' };
  }

  revalidatePath('/dashboard/practice');
  return { success: true };
}

export async function getStudentPracticeLogs() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data, error } = await supabase
    .from('practice_logs')
    .select('*')
    .eq('student_id', user.id)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching practice logs:', error);
    return [];
  }

  return data;
}
