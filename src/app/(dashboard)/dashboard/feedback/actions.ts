'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function getStudentFeedback() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data, error } = await supabase
    .from('submissions')
    .select(`
      id,
      file_url,
      file_type,
      notes,
      submitted_at,
      assignments (
        title,
        due_date
      ),
      feedback (
        rating,
        content,
        created_at
      )
    `)
    .eq('student_id', user.id)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching student feedback:', error);
    return [];
  }

  return data;
}
